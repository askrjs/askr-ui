import { NativeButton } from '../_internal/native-control';
import { Slot } from '@askrjs/askr/foundations/structures';
import { composeRefs, mergeProps } from '@askrjs/askr/foundations/utilities';
import { pressable } from '@askrjs/askr/foundations/interactions';
import { getOverlayNodes } from '../_internal/overlay';
import { runCancelablePress } from '../_internal/press';
import { readDropdownRootContext } from './dropdown.shared';
import type {
  DropdownPortalProps,
  DropdownTriggerAsChildProps,
  DropdownTriggerProps,
} from './dropdown.types';

/**
 * Renders the `dropdown-trigger` part of `dropdown`.
 *
 * Supports polymorphic rendering via `asChild`.
 */
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
    size,
    type: typeProp,
    variant,
    ...rest
  } = props;
  const root = readDropdownRootContext();
  const overlayNodes = getOverlayNodes(root.overlayIdentity);
  const interactionProps = pressable({
    disabled,
    onPress: (event) => {
      runCancelablePress(event, onPress, () => {
        root.setOpen(!root.open);
      });
    },
    isNativeButton: !asChild,
  });
  const handleKeyDown = (event: KeyboardEvent) => {
    interactionProps.onKeyDown?.(event);

    if (
      !event.defaultPrevented &&
      !disabled &&
      (event.key === 'ArrowDown' || event.key === 'ArrowUp')
    ) {
      event.preventDefault();
      root.setOpen(true);
    }
  };
  const setNode = (node: HTMLElement | null) => {
    overlayNodes.trigger = node;
  };
  const refHandler = ref
    ? composeRefs(
        ref as
          | ((value: HTMLElement | null) => void)
          | { current: HTMLElement | null }
          | null
          | undefined,
        setNode
      )
    : setNode;
  const finalProps = mergeProps(rest, {
    ...interactionProps,
    onKeyDown: handleKeyDown,
    ref: refHandler,
    'aria-haspopup': 'menu',
    'aria-expanded': root.open ? 'true' : 'false',
    'aria-controls': root.contentId,
    'data-slot': 'dropdown-trigger',
    'data-disabled': disabled ? 'true' : undefined,
    'data-size': size && size !== 'md' ? size : undefined,
    'data-state': root.open ? 'open' : 'closed',
    'data-variant': variant && variant !== 'default' ? variant : undefined,
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return (
    <NativeButton type={typeProp ?? 'button'} {...finalProps}>
      {children}
    </NativeButton>
  );
}

/**
 * Renders a part of `dropdown`.
 */
export function DropdownPortal(props: DropdownPortalProps): JSX.Element | null {
  const root = readDropdownRootContext();

  return root.portal.render({
    children: props.children,
  }) as JSX.Element | null;
}
