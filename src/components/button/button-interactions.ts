import { pressable } from '@askrjs/askr/foundations/interactions';
import type { PressEvent } from './button.types';

type ButtonInteractionOptions = {
  asChild: boolean;
  children: unknown;
  disabled: boolean;
  onPress?: (event: PressEvent) => void;
};

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
  const isAnchorHost =
    child?.type === 'a' ||
    typeof child?.props?.href === 'string' ||
    typeof child?.props?.to === 'string';

  if (!isAnchorHost) {
    return pressable({
      disabled,
      onPress,
      isNativeButton: !asChild || child?.type === 'button',
    });
  }

  return {
    onClick: (event: PressEvent) => {
      if (disabled) {
        event.preventDefault?.();
        event.stopPropagation?.();
        return;
      }
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
