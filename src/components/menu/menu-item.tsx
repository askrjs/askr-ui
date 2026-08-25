import { nativeButtonProps } from '../_internal/native-control';
import { state } from '@askrjs/askr';
import { Slot } from '@askrjs/askr/foundations/structures';
import { composeRefs, mergeProps } from '@askrjs/askr/foundations/utilities';
import { pressable } from '@askrjs/askr/foundations/interactions';
import {
  compositeItemFocusProps,
  repairFocusForDisabledItem,
} from '../_internal/focus';
import {
  getMenuCollection,
  registerCollectionNode,
  resolveMenuItemText,
} from '../_internal/menu';
import { resolvePartId } from '../_internal/id';
import {
  claimVirtualCompositePlacement,
  resolveVirtualCompositePlacement,
} from '../_internal/virtual-composite';
import { runCancelablePress } from '../_internal/press';
import { readMenuRenderContext, readMenuRootContext } from './menu.shared';
import type { MenuItemAsChildProps, MenuItemProps } from './menu.types';

/**
 * Renders the `menu-item` part of `menu` with `role="menuitem"`.
 *
 * Supports polymorphic rendering via `asChild`.
 */
export function MenuItem(props: MenuItemProps): JSX.Element | null;
export function MenuItem(props: MenuItemAsChildProps): JSX.Element | null;
export function MenuItem(props: MenuItemProps | MenuItemAsChildProps) {
  const {
    asChild,
    children,
    disabled = false,
    onSelect,
    ref,
    textValue,
    type: typeProp,
    ...rest
  } = props;
  const root = readMenuRootContext();
  const renderContext = readMenuRenderContext();
  const placement = state<{ index: number; setSize?: number }>({ index: -1 })();
  const scopedVirtualPlacement = claimVirtualCompositePlacement(
    placement,
    renderContext.claimItemIndex,
    renderContext.virtualIdentity
  );
  const itemIndex = scopedVirtualPlacement?.index ?? placement.index;
  const itemId = resolvePartId(root.menuId, `item-${itemIndex}`);
  const itemText = resolveMenuItemText(children, textValue);
  const collection = getMenuCollection(root.menuId);
  const interactionProps = pressable({
    disabled,
    onPress: (event) => {
      runCancelablePress(event, onSelect, () => {
        root.setCurrentIndex(itemIndex);
      });
    },
    isNativeButton: false,
  });
  const itemFocusProps = root.navigation.item(itemIndex);
  const handleKeyDown = (event: KeyboardEvent) => {
    if (!disabled && root.handleTypeaheadKeyDown(event)) {
      return;
    }

    interactionProps.onKeyDown?.(event);
  };
  const handleKeyUp = (event: KeyboardEvent) => {
    if (root.handleTypeaheadKeyUp(event)) {
      return;
    }

    interactionProps.onKeyUp?.(event);
  };
  const registrationOwner = {};
  const focusRepairProps = compositeItemFocusProps();
  const finalProps = mergeProps(rest, {
    ...interactionProps,
    onKeyDown: handleKeyDown,
    onKeyUp: handleKeyUp,
    ...itemFocusProps,
    ref: composeRefs(
      ref as
        | ((value: HTMLElement | null) => void)
        | { current: HTMLElement | null }
        | null
        | undefined,
      (node: HTMLElement | null) => {
        const virtualPlacement =
          scopedVirtualPlacement ??
          (node ? resolveVirtualCompositePlacement(node) : null);
        if (virtualPlacement && !scopedVirtualPlacement) {
          placement.index = virtualPlacement.index;
          placement.setSize = virtualPlacement.setSize;
        }
        const resolvedIndex = virtualPlacement?.index ?? itemIndex;
        registerCollectionNode(
          itemId,
          collection,
          node,
          {
            index: resolvedIndex,
            setSize: virtualPlacement?.setSize ?? placement.setSize,
            disabled,
            text: itemText,
          },
          registrationOwner
        );
        root.restoreItemFocus(resolvedIndex, node);
        repairFocusForDisabledItem({
          collection,
          disabled,
          index: resolvedIndex,
          loop: root.loop,
          node,
          setCurrentIndex: root.setCurrentIndex,
        });
      }
    ),
    id: itemId,
    role: 'menuitem',
    disabled: disabled && !asChild ? true : undefined,
    'aria-disabled': disabled ? 'true' : undefined,
    'data-slot': 'menu-item',
    'data-disabled': disabled ? 'true' : undefined,
    tabIndex: disabled ? -1 : itemFocusProps.tabIndex,
    ...focusRepairProps,
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children as JSX.Element} />;
  }

  return (
    <button type={typeProp ?? 'button'} {...nativeButtonProps(finalProps)}>
      {children}
    </button>
  );
}
