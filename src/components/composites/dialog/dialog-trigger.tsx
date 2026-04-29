import {
  Slot,
  composeRefs,
  mergeProps,
  pressable,
} from '@askrjs/ui/foundations';
import { readDialogRootContext } from './dialog.shared';
import type {
  DialogTriggerAsChildProps,
  DialogTriggerProps,
} from './dialog.types';

export function DialogTrigger(props: DialogTriggerProps): JSX.Element;
export function DialogTrigger(props: DialogTriggerAsChildProps): JSX.Element;
export function DialogTrigger(
  props: DialogTriggerProps | DialogTriggerAsChildProps
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
  const root = readDialogRootContext();
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
    'aria-haspopup': 'dialog',
    'aria-expanded': root.open ? 'true' : 'false',
    'aria-controls': root.contentId,
    'data-slot': 'dialog-trigger',
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

