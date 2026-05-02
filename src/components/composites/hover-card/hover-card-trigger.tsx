import {
  Slot,
  composeRefs,
  mergeProps,
  pressable,
} from '@askrjs/askr/foundations';
import { readHoverCardRootContext } from './hover-card.shared';
import type {
  HoverCardTriggerAsChildProps,
  HoverCardTriggerProps,
} from './hover-card.types';

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
  const interactionProps = pressable({
    disabled,
    onPress: (event) => {
      onPress?.(event);

      if (!event.defaultPrevented) {
        root.setOpen(true);
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
    'data-slot': 'hover-card-trigger',
    'data-disabled': disabled ? 'true' : undefined,
    'data-state': root.open ? 'open' : 'closed',
    onPointerEnter: () => {
      root.scheduleOpen();
    },
    onPointerLeave: () => {
      root.scheduleClose();
    },
    onMouseEnter: () => {
      root.scheduleOpen();
    },
    onMouseLeave: () => {
      root.scheduleClose();
    },
    onMouseOver: () => {
      root.scheduleOpen();
    },
    onMouseOut: () => {
      root.scheduleClose();
    },
    onFocus: () => {
      root.cancelClose();
      root.setOpen(true);
    },
    onBlur: () => {
      root.scheduleClose();
    },
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
