export interface FocusScopeProps {
  children?: any;
  contain?: boolean; // whether to trap focus inside
  restoreFocus?: boolean; // whether to restore focus to previously focused element on unmount
}

export function FocusScope(props: FocusScopeProps = {}) {
  const { children, contain = true, restoreFocus = true } = props;

  let root: Element | null = null;
  let prevFocused: Element | null = null;

  function onKeyDown(e: KeyboardEvent) {
    if (e.key !== 'Tab') return;
    if (!root) return;

    const focusable = getTabbable(root);
    if (focusable.length === 0) return;

    const active = (document.activeElement as Element) || null;
    const idx = focusable.indexOf(active as HTMLElement);
    const forward = !e.shiftKey;

    // If active is not in scope, send focus to the start/end depending on direction
    if (idx === -1) {
      e.preventDefault();
      if (forward) focusable[0].focus();
      else focusable[focusable.length - 1].focus();
      return;
    }

    if (forward) {
      e.preventDefault();
      if (idx === focusable.length - 1) {
        focusable[0].focus();
      } else {
        focusable[idx + 1].focus();
      }
    } else {
      e.preventDefault();
      if (idx === 0) {
        focusable[focusable.length - 1].focus();
      } else {
        focusable[idx - 1].focus();
      }
    }
  }

  function mount(el: Element) {
    root = el;
    prevFocused = document.activeElement as Element | null;
    if (contain) {
      root.addEventListener('keydown', onKeyDown as EventListener);
    }
  }

  function unmount() {
    if (root && contain) {
      root.removeEventListener('keydown', onKeyDown as EventListener);
    }
    if (restoreFocus && prevFocused instanceof HTMLElement) {
      try {
        (prevFocused as HTMLElement).focus();
      } catch {}
    }
    root = null;
  }

  // Render a wrapper element and attach lifecycle via dataset marker
  const el = document.createElement('div');
  // Mount synchronously to capture current focused element
  mount(el);
  (el as any).__focusScopeUnmount = unmount;

  // Basic imperative render: return the element so consumers can appendChildren
  // Note: This is a headless primitive; in real usage we'd use JSX runtime, but
  // our tests will directly append the element produced by FocusScope below.
  return el as any;
}

function getTabbable(root: Element) {
  const nodes: HTMLElement[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
  let cur = walker.currentNode as Element | null;
  while ((cur = walker.nextNode() as Element | null)) {
    const el = cur as HTMLElement;
    if (isTabbable(el)) nodes.push(el);
  }
  return nodes;
}

function isTabbable(el: HTMLElement) {
  if (el.hasAttribute('disabled')) return false;
  const tab = el.getAttribute('tabindex');
  if (tab !== null && Number(tab) < 0) return false;
  const name = el.tagName.toLowerCase();
  if (name === 'a' && el.hasAttribute('href')) return true;
  if (name === 'button' || name === 'input' || name === 'select' || name === 'textarea') return true;
  if (el.tabIndex >= 0) return true;
  return false;
}