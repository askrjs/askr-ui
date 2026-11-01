import type { JSX } from '@askrjs/askr/jsx-runtime';
import {
  nativeButtonProps,
  withDefaultNativeButtonType,
} from '../_internal/native-control';
import { Slot } from '@askrjs/askr/foundations/structures';
import {
  composeRefs,
  mergeProps,
  type Ref,
} from '@askrjs/askr/foundations/utilities';
import { pressable } from '@askrjs/askr/foundations/interactions';
import { runCancelablePress } from '../_internal/press';
import {
  omitPopoverStateAriaProps,
  readPopoverChildRef,
  readPopoverRootContext,
} from './popover.shared';
import {
  registerSsrPartId,
  setSsrIdAssociation,
} from '../_internal/ssr-id-association';
import type {
  PopoverTriggerAsChildProps,
  PopoverTriggerProps,
} from './popover.types';

/**
 * Renders the `popover-trigger` part of `popover`.
 *
 * Supports polymorphic rendering via `asChild`.
 */
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
  const callerProps = omitPopoverStateAriaProps(rest, [
    'aria-disabled',
    'aria-expanded',
    'aria-haspopup',
  ]);
  const root = readPopoverRootContext();
  const interactionProps = pressable({
    disabled,
    onPress: (event) => {
      runCancelablePress(event, onPress, () => {
        root.setOpen(!root.open);
      });
    },
    isNativeButton: !asChild,
  });
  const finalProps = mergeProps(callerProps, {
    ...interactionProps,
    ref: composeRefs(
      ref as Ref<HTMLElement> | undefined,
      (asChild ? readPopoverChildRef(children) : undefined) as
        | Ref<HTMLElement>
        | undefined,
      (node: HTMLElement | null) => {
        root.setTriggerNode(
          node,
          (rest as Record<string, unknown>)['aria-controls'] === undefined
        );
      }
    ),
    id: root.triggerId,
    'aria-haspopup': 'dialog',
    'aria-expanded': root.open ? 'true' : 'false',
    'aria-disabled': disabled ? 'true' : undefined,
    'aria-controls': root.contentId,
    'data-slot': 'popover-trigger',
    'data-disabled': disabled ? 'true' : undefined,
    'data-state': root.open ? 'open' : 'closed',
  });
  registerSsrPartId(finalProps, root.ssrTrigger);
  setSsrIdAssociation(
    finalProps,
    'aria-controls',
    root.ssrContent,
    (rest as Record<string, unknown>)['aria-controls'] === undefined
  );

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
    <button type={typeProp ?? 'button'} {...nativeButtonProps(finalProps)}>
      {children}
    </button>
  );
}
