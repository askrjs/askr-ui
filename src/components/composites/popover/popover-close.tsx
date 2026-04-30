import { Slot, mergeProps, pressable } from '@askrjs/askr/foundations';
import { readPopoverRootContext } from './popover.shared';
import type {
  PopoverCloseAsChildProps,
  PopoverCloseProps,
} from './popover.types';

export function PopoverClose(props: PopoverCloseProps): JSX.Element;
export function PopoverClose(props: PopoverCloseAsChildProps): JSX.Element;
export function PopoverClose(
  props: PopoverCloseProps | PopoverCloseAsChildProps
) {
  const {
    asChild,
    children,
    disabled = false,
    onPress,
    ref,
    type: typeProp,
    ...rest
  } = props;
  const root = readPopoverRootContext();
  const interactionProps = pressable({
    disabled,
    onPress: (event) => {
      onPress?.(event);

      if (!event.defaultPrevented) {
        root.setOpen(false);
      }
    },
    isNativeButton: !asChild,
  });
  const finalProps = mergeProps(rest, {
    ...interactionProps,
    ref,
    'data-slot': 'popover-close',
    'data-disabled': disabled ? 'true' : undefined,
    'data-state': root.open ? 'open' : 'closed',
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return (
    <button type={typeProp ?? 'button'} {...finalProps}>
      {children}
    </button>
  );
}
