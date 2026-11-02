import { pressable } from '@askrjs/askr/foundations/interactions';
import type { PressEvent } from './button.types';

type ButtonInteractionOptions = {
  asChild: boolean;
  children: unknown;
  disabled: boolean;
  onPress?: (event: PressEvent) => void;
};

/**
 * Renders a part of `button`.
 *
 * Supports polymorphic rendering via `asChild`.
 */
export function getButtonInteractionProps({
  asChild,
  children,
  disabled,
  onPress,
}: ButtonInteractionOptions) {
  const child =
    asChild && children && typeof children === 'object'
      ? (children as {
          type?: unknown;
          props?: Record<string, unknown>;
        })
      : null;
  // Askr's typed route destinations are objects; Link resolves them through `href`.
  const childTo = child?.props?.to;
  const isAnchorHost =
    child?.type === 'a' ||
    typeof child?.props?.href === 'string' ||
    typeof childTo === 'string' ||
    (typeof childTo === 'object' &&
      childTo !== null &&
      typeof (childTo as { href?: unknown }).href === 'string');
  // A function child hides its host, so an explicit button type is the signal
  // that lets Button preserve native button behavior safely.
  const childButtonType = child?.props?.type;
  const isNativeButtonHost =
    child?.type === 'button' ||
    (typeof child?.type !== 'string' &&
      (childButtonType === 'button' ||
        childButtonType === 'submit' ||
        childButtonType === 'reset'));

  if (!isAnchorHost) {
    return pressable({
      disabled,
      onPress,
      isNativeButton: !asChild || isNativeButtonHost,
    });
  }

  return {
    onClick: (event: PressEvent) => {
      if (disabled) {
        event.preventDefault?.();
        event.stopPropagation?.();
        return;
      }
      if (event.defaultPrevented) return;
      onPress?.(event);
    },
    'aria-disabled': disabled ? 'true' : undefined,
    tabIndex: disabled ? -1 : undefined,
    onKeyDown: disabled
      ? (event: KeyboardEvent) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            event.stopPropagation();
          }
        }
      : undefined,
  };
}
