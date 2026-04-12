import {
  Slot,
  composeRefs,
  mergeProps,
  pressable,
  rovingFocus,
} from '@askrjs/askr/foundations';
import { focusSelectedCollectionItem } from '../../_internal/focus';
import {
  declareMenuItemMetadata,
  getMenuCollection,
  registerCollectionNode,
  resolveMenuItemText,
} from '../../_internal/menu';
import { resolvePartId } from '../../_internal/id';
import {
  readDropdownMenuDeclarationContext,
  readDropdownMenuRenderContext,
  readDropdownMenuRootContext,
  resolveDropdownMenuState,
} from './dropdown-menu.shared';
import type {
  DropdownMenuItemAsChildProps,
  DropdownMenuItemProps,
} from './dropdown-menu.types';

export function DropdownMenuItem(
  props: DropdownMenuItemProps
): JSX.Element | null;
export function DropdownMenuItem(
  props: DropdownMenuItemAsChildProps
): JSX.Element | null;
export function DropdownMenuItem(
  props: DropdownMenuItemProps | DropdownMenuItemAsChildProps
) {
  const {
    asChild,
    children,
    disabled = false,
    onSelect,
    ref,
    type: typeProp,
    ...rest
  } = props;
  const root = readDropdownMenuRootContext();
  const renderContext = readDropdownMenuRenderContext();
  const itemIndex = renderContext.claimItemIndex();

  if (readDropdownMenuDeclarationContext()) {
    declareMenuItemMetadata(root.dropdownMenuId, {
      index: itemIndex,
      disabled,
      text: resolveMenuItemText(children),
    });
    return null;
  }

  const itemId = resolvePartId(root.dropdownMenuId, `item-${itemIndex}`);
  const { items, currentIndex, disabledIndexes } = resolveDropdownMenuState(root);
  const collection = getMenuCollection(root.dropdownMenuId);
  const nav = rovingFocus({
    currentIndex,
    itemCount: Math.max(items.length, 1),
    orientation: 'vertical',
    loop: true,
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
        root.setOpen(false);
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
          text: resolveMenuItemText(children),
        });
      }
    ),
    id: itemId,
    role: 'menuitem',
    'aria-disabled': disabled ? 'true' : undefined,
    'data-slot': 'dropdown-menu-item',
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