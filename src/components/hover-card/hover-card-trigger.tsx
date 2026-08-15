import { nativeButtonProps } from '../_internal/native-control';
import { Slot } from '@askrjs/askr/foundations/structures';
import { composeRefs, mergeProps } from '@askrjs/askr/foundations/utilities';
import { hoverable, pressable } from '@askrjs/askr/foundations/interactions';
import { focusFirstDescendant } from '../_internal/focus';
import { readHoverCardRootContext } from './hover-card.shared';
import type {
  HoverCardTriggerAsChildProps,
  HoverCardTriggerProps,
} from './hover-card.types';

/**
 * Renders the `hover-card-trigger` part of `hover-card`.
 *
 * Supports polymorphic rendering via `asChild`.
 */
export function HoverCardTrigger(props: HoverCardTriggerProps): JSX.Element;
export function HoverCardTrigger(
  props: HoverCardTriggerAsChildProps
): JSX.Element;
export function HoverCardTrigger(
  props: HoverCardTriggerProps | HoverCardTriggerAsChildProps
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
  const root = readHoverCardRootContext();
  const hoverProps = hoverable({
    disabled,
    onEnter: () => {
      root.scheduleOpen();
    },
    onLeave: () => {
      root.scheduleClose();
    },
  });
  const interactionProps = pressable({
    disabled,
    onPress,
    isNativeButton: !asChild,
  });
  const finalProps = mergeProps(rest, {
    ...interactionProps,
    ...hoverProps,
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
    'data-slot': 'hover-card-trigger',
    'data-disabled': disabled ? 'true' : undefined,
    'data-state': root.open ? 'open' : 'closed',
    onFocus: () => {
      root.cancelClose();
      root.setOpen(true);
    },
    onFocusIn: () => {
      root.cancelClose();
      root.setOpen(true);
    },
    onBlur: () => {
      root.scheduleClose();
    },
    onKeyDown: (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || event.shiftKey || !root.open) {
        return;
      }
      const content = root.getContentNode();
      if (content && focusFirstDescendant(content)) {
        event.preventDefault();
        root.cancelClose();
      }
    },
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return (
    <button type={typeProp ?? 'button'} {...nativeButtonProps(finalProps)}>
      {children}
    </button>
  );
}
