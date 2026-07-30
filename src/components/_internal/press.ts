import type { PressEvent } from './types';

type PressHandler = (event: PressEvent) => void;

function isPolyfilledKeyboardPress(event: PressEvent): boolean {
  return event.defaultPrevented === true;
}

/**
 * Runs a caller's cancelable press callback before a component's default
 * action. The pressable foundation prevents native keyboard defaults before
 * invoking non-native hosts, so expose a fresh cancellation state for that
 * callback while preserving propagation on the original event.
 */
export function runCancelablePress(
  event: PressEvent,
  onPress: PressHandler | undefined,
  defaultAction: () => void
) {
  if (!isPolyfilledKeyboardPress(event)) {
    onPress?.(event);

    if (!event.defaultPrevented) {
      defaultAction();
    }
    return;
  }

  let callerPrevented = false;
  const callerEvent: PressEvent = {
    get defaultPrevented() {
      return callerPrevented;
    },
    preventDefault: () => {
      callerPrevented = true;
      event.preventDefault?.();
    },
    stopPropagation: () => {
      event.stopPropagation?.();
    },
  };

  onPress?.(callerEvent);

  if (!callerPrevented) {
    defaultAction();
  }
}
