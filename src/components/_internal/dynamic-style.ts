import { registerSSRStyle } from '@askrjs/askr';
import { watch } from '@askrjs/askr/resources';

type StyleValue = number | string | null | undefined;

const MAX_DYNAMIC_RULES = 512;
type Registry = {
  element: HTMLStyleElement;
  rules: Map<string, { rule: string; selector: string }>;
};
const registries = new WeakMap<Document, Map<string, Registry>>();

function escapeCssString(value: string) {
  return [...value]
    .map((character) => {
      const code = character.charCodeAt(0);
      if (character === '\\' || character === '"') return `\\${character}`;
      if (code <= 31 || code === 127) return `\\${code.toString(16)} `;
      return character;
    })
    .join('');
}

function getRegistry(
  nonce: string | undefined,
  ownerDocument?: Document
): Registry | null {
  const targetDocument =
    ownerDocument ?? (typeof document === 'undefined' ? undefined : document);
  if (!targetDocument) {
    return null;
  }
  const key = nonce ?? '';
  let documentRegistries = registries.get(targetDocument);
  if (!documentRegistries) {
    documentRegistries = new Map();
    registries.set(targetDocument, documentRegistries);
  }
  const current = documentRegistries.get(key);
  if (current?.element.isConnected) return current;

  const created = targetDocument.createElement('style');
  created.setAttribute('data-askr-dynamic-styles', 'true');
  if (nonce !== undefined) created.nonce = nonce;
  (targetDocument.head ?? targetDocument.documentElement).appendChild(created);
  const registry = {
    element: created,
    rules: new Map<string, { rule: string; selector: string }>(),
  };
  documentRegistries.set(key, registry);
  return registry;
}

function syncRegistry(registry: Registry) {
  registry.element.textContent = Array.from(registry.rules.values())
    .map(({ rule }) => rule)
    .join('\n');
}

function buildDynamicStyleRule(
  selector: string,
  declarations: Record<string, StyleValue>
) {
  let body = '';
  let declarationCount = 0;

  for (const name in declarations) {
    if (!Object.prototype.hasOwnProperty.call(declarations, name)) {
      continue;
    }

    const value = declarations[name];

    if (value === undefined || value === null) {
      continue;
    }

    if (!/^(?:--[A-Za-z0-9_-]+|[A-Za-z][A-Za-z0-9-]*)$/.test(name)) {
      throw new TypeError(`Invalid dynamic CSS property: ${name}`);
    }
    const serialized = String(value);
    if (/[;{}]/.test(serialized)) {
      throw new TypeError(`Unsafe dynamic CSS value for ${name}`);
    }
    const declaration = `${name}: ${serialized};`;

    if (declarationCount === 0) {
      body = declaration;
    } else {
      body += ` ${declaration}`;
    }

    declarationCount += 1;
  }

  if (!declarationCount) {
    return null;
  }

  return `${selector} { ${body} }`;
}

export function dynamicAttributeSelector(name: string, value: string) {
  if (!/^[A-Za-z_:][A-Za-z0-9_.:-]*$/.test(name)) {
    throw new TypeError(`Invalid dynamic style attribute: ${name}`);
  }
  return `[${name}="${escapeCssString(value)}"]`;
}

function publishSerializedRule(
  key: string,
  selector: string,
  rule: string | null,
  nonce?: string,
  ownerDocument?: Document
) {
  if (!rule) {
    removeDynamicStyleRule(key, ownerDocument);
    return;
  }

  const targetDocument =
    ownerDocument ?? (typeof document === 'undefined' ? undefined : document);
  if (!targetDocument) {
    registerSSRStyle(`askr-dynamic:${nonce ?? ''}:${key}`, rule);
    return;
  }

  const registry = getRegistry(nonce, targetDocument);
  if (!registry) return;
  if (registry.rules.get(key)?.rule === rule && registry.element.isConnected) {
    return;
  }

  if (!registry.rules.has(key) && registry.rules.size >= MAX_DYNAMIC_RULES) {
    for (const [candidateKey, candidate] of registry.rules) {
      if (targetDocument.querySelector(candidate.selector)) continue;
      registry.rules.delete(candidateKey);
      break;
    }
  }
  registry.rules.set(key, { rule, selector });
  syncRegistry(registry);
}

/** Publish validated browser or server CSS immediately. */
export function setDynamicStyleRule(
  key: string,
  selector: string,
  declarations: Record<string, StyleValue>,
  nonce?: string,
  ownerDocument?: Document
) {
  publishSerializedRule(
    key,
    selector,
    buildDynamicStyleRule(selector, declarations),
    nonce,
    ownerDocument
  );
}

function prepareRule(
  key: string,
  selector: string,
  declarations: Record<string, StyleValue>,
  nonce?: string,
  ownerDocument?: Document
) {
  const rule = buildDynamicStyleRule(selector, declarations);
  if (rule) registerSSRStyle(`askr-dynamic:${nonce ?? ''}:${key}`, rule);
  return {
    rule,
    publish: () =>
      publishSerializedRule(key, selector, rule, nonce, ownerDocument),
  };
}

/** Validate and collect server CSS now, then publish DOM CSS after commit. */
export function prepareDynamicStyleRule(
  key: string,
  selector: string,
  declarations: Record<string, StyleValue>,
  nonce?: string,
  ownerDocument?: Document
) {
  return prepareRule(key, selector, declarations, nonce, ownerDocument).publish;
}

/** Publish render-derived browser CSS only after its render commits. */
export function setCommittedDynamicStyleRule(
  key: string,
  selector: string,
  declarations: Record<string, StyleValue>,
  nonce?: string,
  ownerDocument?: Document
) {
  const { rule, publish } = prepareRule(
    key,
    selector,
    declarations,
    nonce,
    ownerDocument
  );
  watch(() => [key, selector, rule, nonce] as const, publish);
}

export function removeDynamicStyleRule(key: string, ownerDocument?: Document) {
  const targetDocument =
    ownerDocument ?? (typeof document === 'undefined' ? undefined : document);
  if (!targetDocument) return;
  const documentRegistries = registries.get(targetDocument);
  if (!documentRegistries) return;
  for (const [nonce, registry] of documentRegistries) {
    if (!registry.rules.delete(key)) continue;
    if (registry.rules.size === 0) {
      registry.element.remove();
      documentRegistries.delete(nonce);
    } else {
      syncRegistry(registry);
    }
  }
}

export function removeDynamicStyleRuleWhenUnused(
  key: string,
  selector: string,
  ownerDocument?: Document
) {
  const removeIfUnused = () => {
    const targetDocument =
      ownerDocument ?? (typeof document === 'undefined' ? undefined : document);
    if (!targetDocument || !targetDocument.querySelector(selector)) {
      removeDynamicStyleRule(key, ownerDocument);
    }
  };

  if (typeof queueMicrotask === 'function') {
    queueMicrotask(removeIfUnused);
  } else {
    setTimeout(removeIfUnused, 0);
  }
}
