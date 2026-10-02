import type { JSX } from '@askrjs/askr/jsx-runtime';
import { nativeButtonProps } from '../_internal/native-control';
import { Slot } from '@askrjs/askr/foundations/structures';
import { composeRefs, mergeProps } from '@askrjs/askr/foundations/utilities';
import { pressable } from '@askrjs/askr/foundations/interactions';
import { runCancelablePress } from '../_internal/press';
import { readPopoverRootContext } from './popover.shared';
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
  const finalProps = mergeProps(rest, {
    ...interactionProps,
    ref: composeRefs(
      ref as
        | ((value: HTMLElement | null) => void)
        | { current: HTMLElement | null }
        | null
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
    return <Slot asChild {...finalProps} children={children} />;
  }

  return (
    <button type={typeProp ?? 'button'} {...nativeButtonProps(finalProps)}>
      {children}
    </button>
  );
}
