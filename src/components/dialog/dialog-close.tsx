import type { JSX } from '@askrjs/askr/jsx-runtime';
import { nativeRef } from '../_internal/native-ref';
import {
  nativeButtonProps,
  withDefaultNativeButtonType,
} from '../_internal/native-control';
import { Slot } from '@askrjs/askr/foundations/structures';
import { mergeProps } from '@askrjs/askr/foundations/utilities';
import type { Ref } from '@askrjs/askr/foundations/utilities';
import { pressable } from '@askrjs/askr/foundations/interactions';
import { runCancelablePress } from '../_internal/press';
import { resolveAsChildRef } from '../_internal/slot-ref';
import {
  omitDialogStateAriaProps,
  readDialogRootContext,
} from './dialog.shared';
import type { DialogCloseAsChildProps, DialogCloseProps } from './dialog.types';

/**
 * Renders the `dialog-close` part of `dialog`.
 *
 * Supports polymorphic rendering via `asChild`.
 */
export function DialogClose(props: DialogCloseProps): JSX.Element;
export function DialogClose(props: DialogCloseAsChildProps): JSX.Element;
export function DialogClose(props: DialogCloseProps | DialogCloseAsChildProps) {
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
      runCancelablePress(event, onPress, () => {
        root.setOpen(false);
      });
    },
    isNativeButton: !asChild,
  });
  const callerProps = omitDialogStateAriaProps(rest, ['aria-disabled']);
  const resolvedRef = asChild
    ? resolveAsChildRef(children, ref as Ref<Element> | undefined)
    : ref;
  const finalProps = mergeProps(callerProps, {
    ...interactionProps,
    ...(resolvedRef === undefined ? {} : { ref: resolvedRef }),
    'data-slot': 'dialog-close',
    'data-dialog-close': 'true',
    'data-disabled': disabled ? 'true' : undefined,
    'data-state': root.open ? 'open' : 'closed',
  });

  if (asChild) {
    return (
      <Slot
        asChild
        {...withDefaultNativeButtonType(children, finalProps, typeProp)}
        children={children}
      />
    );
  }

  return (
    <button
      type={typeProp ?? 'button'}
      {...nativeButtonProps(finalProps)}
      ref={nativeRef<HTMLButtonElement>(props)}
    >
      {children}
    </button>
  );
}
