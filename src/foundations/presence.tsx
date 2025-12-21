export interface PresenceController {
  element: Element;
  isPresent: boolean;
  setPresent: (present: boolean) => void;
  unmount: () => void;
}

export interface PresenceOptions {
  children?: any;
  exitDuration?: number; // milliseconds
  onExitComplete?: () => void;
}

export function Presence(options: PresenceOptions = {}): PresenceController {
  const { children, exitDuration = 100, onExitComplete } = options;

  const el = document.createElement('div');
  let timer: any = null;
  let present = true;

  if (children != null) {
    if (typeof children === 'string') el.textContent = children;
    else el.appendChild(children);
  }

  function setPresent(p: boolean) {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }

    if (p) {
      // Show: re-append if removed
      if (!document.body.contains(el)) document.body.appendChild(el);
      el.removeAttribute('data-exiting');
      present = true;
      return;
    }

    // Hide: mark exiting and wait before removing
    el.setAttribute('data-exiting', 'true');
    present = false;
    timer = setTimeout(() => {
      if (el.parentElement) el.parentElement.removeChild(el);
      timer = null;
      if (onExitComplete) onExitComplete();
    }, exitDuration);
  }

  function unmount() {
    if (timer) clearTimeout(timer);
    if (el.parentElement) el.parentElement.removeChild(el);
    timer = null;
  }

  return {
    element: el,
    isPresent: present,
    setPresent,
    unmount,
  };
}
