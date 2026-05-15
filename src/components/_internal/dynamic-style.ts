type StyleValue = number | string | null | undefined;

const dynamicRules = new Map<string, string>();
let dynamicStyleElement: HTMLStyleElement | null = null;

function escapeCssString(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function getDynamicStyleElement() {
  if (typeof document === 'undefined') {
    return null;
  }

  if (dynamicStyleElement?.isConnected) {
    return dynamicStyleElement;
  }

  const existing = document.querySelector<HTMLStyleElement>(
    'style[data-askr-dynamic-styles]'
  );

  if (existing) {
    dynamicStyleElement = existing;
    return existing;
  }

  const created = document.createElement('style');
  created.setAttribute('data-askr-dynamic-styles', 'true');
  document.head.appendChild(created);
  dynamicStyleElement = created;
  return created;
}

function syncDynamicStyleElement() {
  const style = getDynamicStyleElement();

  if (!style) {
    return;
  }

  style.textContent = Array.from(dynamicRules.values()).join('\n');
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

    const declaration = `${name}: ${String(value)};`;

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
  return `[${name}="${escapeCssString(value)}"]`;
}

export function setDynamicStyleRule(
  key: string,
  selector: string,
  declarations: Record<string, StyleValue>
) {
  const rule = buildDynamicStyleRule(selector, declarations);

  if (!rule) {
    removeDynamicStyleRule(key);
    return;
  }

  if (dynamicRules.get(key) === rule && dynamicStyleElement?.isConnected) {
    return;
  }

  dynamicRules.set(key, rule);
  syncDynamicStyleElement();
}

export function removeDynamicStyleRule(key: string) {
  if (!dynamicRules.delete(key)) {
    return;
  }

  syncDynamicStyleElement();
}
