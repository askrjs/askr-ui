import {
  Slot,
  composeRefs,
  hoverable,
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
