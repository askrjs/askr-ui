import {
  Slot,
  composeRefs,
  mergeProps,
  pressable,
} from '@askrjs/askr/foundations';
import { getOverlayNodes } from '../../_internal/overlay';
import {
  readDropdownMenuDeclarationContext,
  readDropdownMenuRootContext,
} from './dropdown-menu.shared';
import type {
  DropdownMenuPortalProps,
  DropdownMenuTriggerAsChildProps,
  DropdownMenuTriggerProps,
} from './dropdown-menu.types';

export function DropdownMenuTrigger(
  props: DropdownMenuTriggerProps
): JSX.Element | null;
export function DropdownMenuTrigger(
  props: DropdownMenuTriggerAsChildProps
): JSX.Element | null;
export function DropdownMenuTrigger(
  props: DropdownMenuTriggerProps | DropdownMenuTriggerAsChildProps
) {
  if (readDropdownMenuDeclarationContext()) {
    return null;
  }

  const {
    asChild,
    children,
    disabled = false,
    onPress,
    ref,
    type: typeProp,
    ...rest
  } = props;
  const root = readDropdownMenuRootContext();
  const overlayNodes = getOverlayNodes(root.dropdownMenuId);
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
    'data-slot': 'dropdown-menu-trigger',
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

export function DropdownMenuPortal(
  props: DropdownMenuPortalProps
): JSX.Element | null {
  if (readDropdownMenuDeclarationContext()) {
    return <>{props.children}</>;
  }

  const root = readDropdownMenuRootContext();

  return root.portal.render({
    children: props.children,
  }) as JSX.Element | null;
}
