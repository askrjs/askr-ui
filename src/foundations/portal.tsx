export interface PortalOptions {
  container?: Element;
}

export function Portal(options: PortalOptions = {}) {
  const container = options.container || document.body;
  const el = document.createElement('div');
  container.appendChild(el);

  function unmount() {
    if (el.parentElement) el.parentElement.removeChild(el);
  }

  return { element: el, unmount };
}
