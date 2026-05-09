type StyleValue = number | string | null | undefined;

const dynamicRules = new Map<string, string>();

function escapeCssString(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function getDynamicStyleElement() {
  if (typeof document === 'undefined') {
    return null;
  }

  const existing = document.querySelector<HTMLStyleElement>(
    'style[data-askr-dynamic-styles]'
  );

  if (existing) {
    return existing;
  }

  const created = document.createElement('style');
  created.setAttribute('data-askr-dynamic-styles', 'true');
  document.head.appendChild(created);
  return created;
}

function syncDynamicStyleElement() {
  const style = getDynamicStyleElement();

  if (!style) {
    return;
  }

  style.textContent = Array.from(dynamicRules.values()).join('\n');
}

export function dynamicAttributeSelector(name: string, value: string) {
  return `[${name}="${escapeCssString(value)}"]`;
}

export function setDynamicStyleRule(
  key: string,
  selector: string,
  declarations: Record<string, StyleValue>
) {
  const body = Object.entries(declarations)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([name, value]) => `${name}: ${String(value)};`)
    .join(' ');

  if (!body) {
    removeDynamicStyleRule(key);
    return;
  }

  dynamicRules.set(key, `${selector} { ${body} }`);
  syncDynamicStyleElement();
}

export function removeDynamicStyleRule(key: string) {
  if (!dynamicRules.delete(key)) {
    return;
  }

  syncDynamicStyleElement();
}
