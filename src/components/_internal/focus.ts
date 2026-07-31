import type { Collection } from '@askrjs/askr/foundations/structures';

let keyboardModality = true;

export function markKeyboardModality() {
  keyboardModality = true;
}

export function markPointerModality() {
  keyboardModality = false;
}

export function isKeyboardModality() {
  return keyboardModality;
}

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

export function dismissPopupWithTab(
  event: KeyboardEvent,
  trigger: HTMLElement | null,
  excludedRoots: readonly HTMLElement[],
  onDismiss: () => void
): boolean {
  if (event.key !== 'Tab') {
    return false;
  }

  const candidates = getTabbableElements().filter(
    (candidate) =>
      !excludedRoots.some((excludedRoot) => excludedRoot.contains(candidate))
  );
  const triggerIndex = trigger ? candidates.indexOf(trigger) : -1;
  const destination =
    triggerIndex >= 0
      ? candidates[triggerIndex + (event.shiftKey ? -1 : 1)]
      : undefined;

  if (destination) {
    event.preventDefault();
    event.stopPropagation();
  }

  onDismiss();

  if (destination) {
    queueMicrotask(() => {
      queueMicrotask(() => {
        if (destination.isConnected) {
          destination.focus();
        }
      });
    });
  }

  return true;
}

export function moveFocusOutsideCompositeWithTab(
  event: KeyboardEvent,
  composite: HTMLElement
): boolean {
  if (event.key !== 'Tab') {
    return false;
  }

  const candidates = getTabbableElements();
  const activeElement =
    document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
  const activeIndex = activeElement ? candidates.indexOf(activeElement) : -1;

  if (activeIndex < 0 || !composite.contains(activeElement)) {
    return false;
  }

  const direction = event.shiftKey ? -1 : 1;
  let destination: HTMLElement | undefined;

  for (
    let index = activeIndex + direction;
    index >= 0 && index < candidates.length;
    index += direction
  ) {
    const candidate = candidates[index];

    if (candidate && !composite.contains(candidate)) {
      destination = candidate;
      break;
    }
  }

  if (!destination) {
    return false;
  }

  event.preventDefault();
  event.stopPropagation();
  queueMicrotask(() => {
    if (destination?.isConnected) {
      destination.focus();
    }
  });
  return true;
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

export function focusSelectedCollectionItem<
  TMetadata extends { index: number },
>(collection: Collection<HTMLElement, TMetadata>, index: number): boolean {
  const match = collection
    .items()
    .find((item) => item.metadata.index === index)?.node;

  if (!match) {
    return false;
  }

  match.focus();
  return true;
}

export type PendingCollectionFocus = {
  index: number | null;
};

export function focusCollectionItemWithRestore<
  TMetadata extends { index: number },
>(
  pendingFocus: PendingCollectionFocus,
  collection: Collection<HTMLElement, TMetadata>,
  index: number,
  resolveNode?: () => HTMLElement | null
) {
  const focusItem = () => {
    const resolvedNode = resolveNode?.();

    if (resolvedNode) {
      resolvedNode.focus();
      return true;
    }

    return focusSelectedCollectionItem(collection, index);
  };

  pendingFocus.index = index;
  focusItem();
  queueMicrotask(() => {
    queueMicrotask(() => {
      focusItem();
      pendingFocus.index = null;
    });
  });
}

export function restorePendingCollectionItemFocus(
  pendingFocus: PendingCollectionFocus,
  index: number,
  node: HTMLElement | null
) {
  if (node && pendingFocus.index === index) {
    node.focus();
    pendingFocus.index = null;
  }
}
