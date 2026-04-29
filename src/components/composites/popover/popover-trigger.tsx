import {
  Slot,
  composeRefs,
  mergeProps,
  pressable,
} from '@askrjs/ui/foundations';
import { readPopoverRootContext } from './popover.shared';
import type {
  PopoverTriggerAsChildProps,
  PopoverTriggerProps,
} from './popover.types';

export function PopoverTrigger(props: PopoverTriggerProps): JSX.Element;
export function PopoverTrigger(props: PopoverTriggerAsChildProps): JSX.Element;
export function PopoverTrigger(
  props: PopoverTriggerProps | PopoverTriggerAsChildProps
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
        root.setOpen(!root.open);
      }
    },
    isNativeButton: !asChild,
  });
  const finalProps = mergeProps(rest, {
    ...interactionProps,
    ref: composeRefs(
      ref as
        | ((value: HTMLElement | null) => void)
        | { current: HTMLElement | null }
        | null
        | undefined,
      (node: HTMLElement | null) => {
        root.setTriggerNode(node);
      }
    ),
    id: root.triggerId,
    'aria-haspopup': 'dialog',
    'aria-expanded': root.open ? 'true' : 'false',
    'aria-controls': root.contentId,
    'data-slot': 'popover-trigger',
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

