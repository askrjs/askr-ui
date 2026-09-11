function flattenedElements(root: ParentNode): HTMLElement[] {
  const result: HTMLElement[] = [];
  const visit = (parent: ParentNode) => {
    for (const child of parent.children) {
      if (!(child instanceof HTMLElement)) {
        continue;
      }
      result.push(child);

      if (child instanceof HTMLSlotElement) {
        const assigned = child.assignedElements({ flatten: true });
        if (assigned.length > 0) {
          for (const assignedElement of assigned) {
            if (assignedElement instanceof HTMLElement) {
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
    const style = getComputedStyle(current);
    if (style.display === 'none' || style.visibility === 'hidden') {
      return true;
    }
    const root = current.getRootNode();
    current =
      current.parentElement ??
      (root instanceof ShadowRoot ? (root.host as HTMLElement) : null);
  }
  return false;
}

function isDisabledByFieldset(element: HTMLElement): boolean {
  const fieldset = element.closest('fieldset[disabled]');
  if (!fieldset) {
    return false;
  }
  const firstLegend = Array.from(fieldset.children).find(
    (child): child is HTMLLegendElement => child instanceof HTMLLegendElement
  );
  return !firstLegend?.contains(element);
}

function isInsideClosedDetails(element: HTMLElement): boolean {
  const details = element.closest('details:not([open])');
  return Boolean(details && !element.closest('summary'));
}

function isNaturallyFocusable(element: HTMLElement): boolean {
  if (
    element instanceof HTMLButtonElement ||
    element instanceof HTMLSelectElement ||
    element instanceof HTMLTextAreaElement ||
    element instanceof HTMLIFrameElement
  ) {
    return true;
  }
  if (element instanceof HTMLInputElement) {
    return element.type !== 'hidden';
  }
  if (
    (element instanceof HTMLAnchorElement ||
      element instanceof HTMLAreaElement) &&
    element.hasAttribute('href')
  ) {
    return true;
  }
  if (
    element instanceof HTMLAudioElement ||
    element instanceof HTMLVideoElement
  ) {
    return element.hasAttribute('controls');
  }
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
    if (!(element instanceof HTMLInputElement) || element.type !== 'radio') {
      continue;
    }
    const formKey = element.form?.id ?? '';
    const key = `${formKey}\0${element.name}`;
    const current = selected.get(key);
    if (!current || element.checked) {
      selected.set(key, element);
    }
  }
  return elements.filter(
    (element) =>
      !(element instanceof HTMLInputElement) ||
      element.type !== 'radio' ||
      !element.name ||
      selected.get(`${element.form?.id ?? ''}\0${element.name}`) === element
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
