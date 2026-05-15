import {
  Slot,
  composeRefs,
  mergeProps,
  pressable,
} from '@askrjs/askr/foundations';
import { getOverlayNodes } from '../_internal/overlay';
import { readDropdownRootContext } from './dropdown.shared';
import type {
  DropdownPortalProps,
  DropdownTriggerAsChildProps,
  DropdownTriggerProps,
} from './dropdown.types';

export function DropdownTrigger(
  props: DropdownTriggerProps
): JSX.Element | null;
export function DropdownTrigger(
  props: DropdownTriggerAsChildProps
): JSX.Element | null;
export function DropdownTrigger(
  props: DropdownTriggerProps | DropdownTriggerAsChildProps
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
  const root = readDropdownRootContext();
  const overlayNodes = getOverlayNodes(root.dropdownId);
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
        overlayNodes.trigger = node;
      }
    ),
    'aria-haspopup': 'menu',
    'aria-expanded': root.open ? 'true' : 'false',
    'aria-controls': root.contentId,
    'data-slot': 'dropdown-trigger',
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

export function DropdownPortal(props: DropdownPortalProps): JSX.Element | null {
  const root = readDropdownRootContext();

  return root.portal.render({
    children: props.children,
  }) as JSX.Element | null;
}
