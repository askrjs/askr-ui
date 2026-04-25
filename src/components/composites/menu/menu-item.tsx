import {
  Slot,
  composeRefs,
  mergeProps,
  pressable,
  rovingFocus,
} from '@askrjs/askr-ui/foundations';
import { focusSelectedCollectionItem } from '../../_internal/focus';
import {
  getMenuCollection,
  registerCollectionNode,
  resolveMenuItemText,
} from '../../_internal/menu';
import { resolvePartId } from '../../_internal/id';
import {
  readMenuRenderContext,
  readMenuRootContext,
  resolveMenuState,
} from './menu.shared';
import type { MenuItemAsChildProps, MenuItemProps } from './menu.types';

export function MenuItem(props: MenuItemProps): JSX.Element | null;
export function MenuItem(props: MenuItemAsChildProps): JSX.Element | null;
export function MenuItem(props: MenuItemProps | MenuItemAsChildProps) {
  const {
    asChild,
    children,
    disabled = false,
    onSelect,
    ref,
    type: typeProp,
    ...rest
  } = props;
  const root = readMenuRootContext();
  const renderContext = readMenuRenderContext();
  const itemIndex = renderContext.claimItemIndex();
  const itemId = resolvePartId(root.menuId, `item-${itemIndex}`);
  const itemText = resolveMenuItemText(children);
  const { items, currentIndex, disabledIndexes } = resolveMenuState(root);
  const collection = getMenuCollection(root.menuId);
  const nav = rovingFocus({
    currentIndex,
    itemCount: Math.max(items.length, 1),
    orientation: root.orientation,
    loop: root.loop,
    isDisabled: (index) => disabledIndexes.includes(index),
    onNavigate: (index) => {
      root.setCurrentIndex(index);
      focusSelectedCollectionItem(collection, index);
    },
  });
  const interactionProps = pressable({
    disabled,
    onPress: (event) => {
      onSelect?.(event);
      if (!event.defaultPrevented) {
        root.setCurrentIndex(itemIndex);
      }
    },
    isNativeButton: !asChild,
  });
  const finalProps = mergeProps(rest, {
    ...interactionProps,
    ...nav.item(itemIndex),
    ref: composeRefs(
      ref as
        | ((value: HTMLElement | null) => void)
        | { current: HTMLElement | null }
        | null
        | undefined,
      (node: HTMLElement | null) => {
        registerCollectionNode(itemId, collection, node, {
          index: itemIndex,
          disabled,
          text: itemText,
        });
      }
    ),
    id: itemId,
    role: 'menuitem',
    'aria-disabled': disabled ? 'true' : undefined,
    'data-slot': 'menu-item',
    'data-disabled': disabled ? 'true' : undefined,
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children as JSX.Element} />;
  }

  return (
    <button type={typeProp ?? 'button'} {...finalProps}>
      {children}
    </button>
  );
}
