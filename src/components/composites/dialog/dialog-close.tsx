import {
  Slot,
  mergeProps,
  pressable,
} from '@askrjs/askr/foundations';
import { readDialogRootContext } from './dialog.shared';
import type {
  DialogCloseAsChildProps,
  DialogCloseProps,
} from './dialog.types';

export function DialogClose(props: DialogCloseProps): JSX.Element;
export function DialogClose(props: DialogCloseAsChildProps): JSX.Element;
export function DialogClose(
  props: DialogCloseProps | DialogCloseAsChildProps
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
        root.setOpen(false);
      }
    },
    isNativeButton: !asChild,
  });
  const finalProps = mergeProps(rest, {
    ...interactionProps,
    ref,
    'data-slot': 'dialog-close',
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