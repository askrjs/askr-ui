// Minimal JSX runtime for tests and example usage.
// Supports: jsx, jsxs, Fragment

export const Fragment = Symbol.for('askr.fragment');

function setProps(el: Element, props: any) {
  for (const key of Object.keys(props)) {
    const val = props[key];
    if (key === 'children') continue;
    if (key === 'ref') {
      if (typeof val === 'function') {
        val(el);
      } else if (val && typeof val === 'object') {
        val.current = el;
      }
      continue;
    }
    if (key.startsWith('on') && typeof val === 'function') {
      const name = key.slice(2).toLowerCase();
      (el as any).addEventListener(name, val as EventListener);
    } else if (val === false || val === null || val === undefined) {
      // skip
    } else {
      try {
        if (key in el) {
          (el as any)[key] = val;
        } else {
          el.setAttribute(key, String(val));
        }
      } catch {
        el.setAttribute(key, String(val));
      }
    }
  }
}

function appendChildren(el: Element, children: any) {
  if (children == null) return;
  if (Array.isArray(children)) {
    for (const c of children) appendChildren(el, c);
    return;
  }
  if (typeof children === 'string' || typeof children === 'number') {
    el.appendChild(document.createTextNode(String(children)));
    return;
  }
  if (children instanceof Node) {
    el.appendChild(children);
    return;
  }
  // If it's an object with `$$dom` (returned by functional components), or element-like
  if (children && (children as any).nodeType) {
    el.appendChild(children as Node);
    return;
  }
}

export function jsx(type: any, props: any, key?: any) {
  return jsxs(type, props, key);
}

export function jsxs(type: any, props: any, key?: any) {
  const { children } = props || {};

  // Host element
  if (typeof type === 'string') {
    const el = document.createElement(type);
    setProps(el, props || {});
    appendChildren(el, children);
    return el;
  }

  // Functional component
  if (typeof type === 'function') {
    return type({ ...props, children });
  }

  // Fragment
  if (type === Fragment) {
    // Return a DocumentFragment
    const frag = document.createDocumentFragment();
    appendChildren(frag as any, children);
    return frag as any as Element;
  }

  throw new Error('Unsupported JSX element type');
}
