import type { JSX } from '@askrjs/askr/jsx-runtime';
import {
  nativeButtonProps,
  withDefaultNativeButtonType,
} from '../_internal/native-control';
import { Slot } from '@askrjs/askr/foundations/structures';
import { mergeProps, type Ref } from '@askrjs/askr/foundations/utilities';
import { nativeRef } from '../_internal/native-ref';
import { pressable } from '@askrjs/askr/foundations/interactions';
import { runCancelablePress } from '../_internal/press';
import {
  omitPopoverStateAriaProps,
  readPopoverRootContext,
  resolvePopoverSlotRef,
} from './popover.shared';
import type {
  PopoverCloseAsChildProps,
  PopoverCloseProps,
} from './popover.types';

/**
 * Renders the `popover-close` part of `popover`.
 *
 * Supports polymorphic rendering via `asChild`.
 */
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
  const callerProps = omitPopoverStateAriaProps(rest, ['aria-disabled']);
  const root = readPopoverRootContext();
  const interactionProps = pressable({
    disabled,
    onPress: (event) => {
      runCancelablePress(event, onPress, () => {
        root.setOpen(false);
      });
    },
    isNativeButton: !asChild,
  });
  const finalProps = mergeProps(callerProps, {
    ...interactionProps,
    ref: resolvePopoverSlotRef(asChild, children, ref as Ref<Element>),
    'aria-disabled': disabled ? 'true' : undefined,
    'data-slot': 'popover-close',
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
