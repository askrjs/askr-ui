/** Realm-independent HTML checks also accept nodes adopted from another document. */
export function isHTMLElement(
  node: EventTarget | null | undefined
): node is HTMLElement {
  return (
    (node as Node | null)?.nodeType === 1 &&
    (node as Element).namespaceURI === 'http://www.w3.org/1999/xhtml'
  );
}

export function getActiveElement(ownerDocument: Document): HTMLElement | null {
  const active = ownerDocument.activeElement;
  return isHTMLElement(active) ? active : null;
}

function flattenedElements(root: ParentNode): HTMLElement[] {
  const result: HTMLElement[] = [];
  const visit = (parent: ParentNode) => {
    for (const child of parent.children) {
      if (!isHTMLElement(child)) {
        continue;
      }
      result.push(child);

      if (child.tagName === 'SLOT') {
        const assigned = (child as HTMLSlotElement).assignedElements({
          flatten: true,
        });
        if (assigned.length > 0) {
          for (const assignedElement of assigned) {
            if (isHTMLElement(assignedElement)) {
              result.push(assignedElement);
              visit(assignedElement);
            }
          }
          continue;
        }
      }

      if (child.shadowRoot) {
        visit(child.shadowRoot);
      } else {
        visit(child);
      }
    }
  };
  visit(root);
  return [...new Set(result)];
}

function isHidden(element: HTMLElement): boolean {
  for (let current: HTMLElement | null = element; current;) {
    if (current.hidden || current.hasAttribute('inert')) {
      return true;
    }
    const style = current.ownerDocument.defaultView?.getComputedStyle(current);
    if (style?.display === 'none' || style?.visibility === 'hidden') {
      return true;
    }
    const root = current.getRootNode();
    current =
      current.parentElement ??
      ('host' in root && isHTMLElement(root.host as Node)
        ? (root.host as HTMLElement)
        : null);
  }
  return false;
}

function isDisabledByFieldset(element: HTMLElement): boolean {
  const fieldset = element.closest('fieldset[disabled]');
  if (!fieldset) {
    return false;
  }
  const firstLegend = Array.from(fieldset.children).find(
    (child): child is HTMLLegendElement => child.tagName === 'LEGEND'
  );
  return !firstLegend?.contains(element);
}

function isInsideClosedDetails(element: HTMLElement): boolean {
  const details = element.closest('details:not([open])');
  return Boolean(details && !element.closest('summary'));
}

function isNaturallyFocusable(element: HTMLElement): boolean {
  const tag = element.tagName;
  if (['BUTTON', 'SELECT', 'TEXTAREA', 'IFRAME'].includes(tag)) return true;
  if (tag === 'INPUT') return (element as HTMLInputElement).type !== 'hidden';
  if (tag === 'A' || tag === 'AREA') return element.hasAttribute('href');
  if (tag === 'AUDIO' || tag === 'VIDEO')
    return element.hasAttribute('controls');
  return element.isContentEditable;
}

function isFocusable(element: HTMLElement): boolean {
  return (
    !element.hasAttribute('disabled') &&
    !isDisabledByFieldset(element) &&
    !isInsideClosedDetails(element) &&
    !isHidden(element) &&
    (element.hasAttribute('tabindex') || isNaturallyFocusable(element))
  );
}

function filterRadioGroups(elements: HTMLElement[]): HTMLElement[] {
  const selected = new Map<string, HTMLInputElement>();
  for (const element of elements) {
    if (
      element.tagName !== 'INPUT' ||
      (element as HTMLInputElement).type !== 'radio'
    ) {
      continue;
    }
    const radio = element as HTMLInputElement;
    const formKey = radio.form?.id ?? '';
    const key = `${formKey}\0${radio.name}`;
    const current = selected.get(key);
    if (!current || radio.checked) {
      selected.set(key, radio);
    }
  }
  return elements.filter(
    (element) =>
      element.tagName !== 'INPUT' ||
      (element as HTMLInputElement).type !== 'radio' ||
      !(element as HTMLInputElement).name ||
      selected.get(
        `${(element as HTMLInputElement).form?.id ?? ''}\0${(element as HTMLInputElement).name}`
      ) === element
  );
}

export function getFocusableElements(root: HTMLElement): HTMLElement[] {
  return flattenedElements(root).filter(isFocusable);
}

export function getTabbableElements(
  root: ParentNode = document
): HTMLElement[] {
  const candidates = filterRadioGroups(
    flattenedElements(root).filter(
      (element) => isFocusable(element) && element.tabIndex >= 0
    )
  );
  const positive = candidates
    .filter((element) => element.tabIndex > 0)
    .sort((left, right) => left.tabIndex - right.tabIndex);
  return [
    ...positive,
    ...candidates.filter((element) => element.tabIndex === 0),
  ];
}

export function focusFirstDescendant(root: HTMLElement): boolean {
  const first = getFocusableElements(root)[0];

  if (!first) {
    return false;
  }

  first.focus();
  return true;
}

export function focusLastDescendant(root: HTMLElement): boolean {
  const elements = getFocusableElements(root);
  const last = elements[elements.length - 1];

  if (!last) {
    return false;
  }

  last.focus();
  return true;
}
