import { Fragment } from '@askrjs/askr/jsx-runtime';
import type { JSXElement } from '@askrjs/askr/foundations';

type NodeLike = JSXElement | string | number | boolean | null | undefined | NodeLike[];

type Ref<T> = ((el: T | null) => void) | { current: T | null } | null | undefined;

function setRef<T extends Element>(ref: Ref<T>, el: T | null) {
  if (!ref) return;
  if (typeof ref === 'function') {
    ref(el);
    return;
  }
  try {
    (ref as any).current = el;
  } catch {
    // ignore
  }
}

function applyProps(el: Element, props: Record<string, any>) {
  for (const key of Object.keys(props)) {
    const value = props[key];
    if (key === 'children') continue;

    if (key === 'ref') {
      setRef(props.ref as any, el as any);
      continue;
    }

    if (key.startsWith('on') && typeof value === 'function') {
      const name = key.slice(2).toLowerCase();
      el.addEventListener(name, value as EventListener);
      continue;
    }

    if (value === false || value === null || value === undefined) {
      continue;
    }

    try {
      if (key in (el as any)) {
        (el as any)[key] = value;
      } else {
        el.setAttribute(key, String(value));
      }
    } catch {
      el.setAttribute(key, String(value));
    }
  }
}

function append(parent: Node, child: NodeLike) {
  if (child == null || child === false || child === true) return;
  if (Array.isArray(child)) {
    for (const c of child) append(parent, c);
    return;
  }
  if (typeof child === 'string' || typeof child === 'number') {
    parent.appendChild(document.createTextNode(String(child)));
    return;
  }
  parent.appendChild(render(child));
}

export function render(node: NodeLike): Node {
  if (node == null || node === false || node === true) {
    return document.createTextNode('');
  }

  if (Array.isArray(node)) {
    const frag = document.createDocumentFragment();
    for (const n of node) append(frag, n);
    return frag;
  }

  if (typeof node === 'string' || typeof node === 'number') {
    return document.createTextNode(String(node));
  }

  const el = node as JSXElement;

  if (el.type === Fragment) {
    const frag = document.createDocumentFragment();
    append(frag, (el.props as any).children);
    return frag;
  }

  if (typeof el.type === 'function') {
    const out = (el.type as any)(el.props);
    return render(out);
  }

  if (typeof el.type === 'string') {
    const dom = document.createElement(el.type);
    applyProps(dom, el.props as any);
    append(dom, (el.props as any).children);
    return dom;
  }

  throw new Error('Unsupported element type');
}
