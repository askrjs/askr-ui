type StyleValue = number | string | null | undefined;

const MAX_DYNAMIC_RULES = 512;
type Registry = {
  element: HTMLStyleElement;
  rules: Map<string, string>;
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

function getRegistry(nonce: string | undefined): Registry | null {
  if (typeof document === 'undefined') {
    return null;
  }
  const key = nonce ?? '';
  let documentRegistries = registries.get(document);
  if (!documentRegistries) {
    documentRegistries = new Map();
    registries.set(document, documentRegistries);
  }
  const current = documentRegistries.get(key);
  if (current?.element.isConnected) return current;

  const created = document.createElement('style');
  created.setAttribute('data-askr-dynamic-styles', 'true');
  if (nonce !== undefined) created.nonce = nonce;
  document.head.appendChild(created);
  const registry = { element: created, rules: new Map<string, string>() };
  documentRegistries.set(key, registry);
  return registry;
}

function syncRegistry(registry: Registry) {
  registry.element.textContent = Array.from(registry.rules.values()).join('\n');
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

export function setDynamicStyleRule(
  key: string,
  selector: string,
  declarations: Record<string, StyleValue>,
  nonce?: string
) {
  const rule = buildDynamicStyleRule(selector, declarations);

  if (!rule) {
    removeDynamicStyleRule(key);
    return;
  }

  const registry = getRegistry(nonce);
  if (!registry) return;
  if (registry.rules.get(key) === rule && registry.element.isConnected) {
    return;
  }

  if (!registry.rules.has(key) && registry.rules.size >= MAX_DYNAMIC_RULES) {
    const oldest = registry.rules.keys().next().value as string | undefined;
    if (oldest !== undefined) registry.rules.delete(oldest);
  }
  registry.rules.set(key, rule);
  syncRegistry(registry);
}

export function removeDynamicStyleRule(key: string) {
  if (typeof document === 'undefined') return;
  const documentRegistries = registries.get(document);
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
  selector: string
) {
  const removeIfUnused = () => {
    if (typeof document === 'undefined' || !document.querySelector(selector)) {
      removeDynamicStyleRule(key);
    }
  };

  if (typeof queueMicrotask === 'function') {
    queueMicrotask(removeIfUnused);
  } else {
    setTimeout(removeIfUnused, 0);
  }
}
