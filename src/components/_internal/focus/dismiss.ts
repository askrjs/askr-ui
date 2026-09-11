import { getTabbableElements } from './query';

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
