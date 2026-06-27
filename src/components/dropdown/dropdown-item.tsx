import { Slot } from '@askrjs/askr/foundations/structures';
import { composeRefs, mergeProps } from '@askrjs/askr/foundations/utilities';
import { pressable, rovingFocus } from '@askrjs/askr/foundations/interactions';
import { focusSelectedCollectionItem } from '../_internal/focus';
import {
  getMenuCollection,
  registerCollectionNode,
  resolveMenuItemText,
} from '../_internal/menu';
import { resolvePartId } from '../_internal/id';
import {
  readDropdownRenderContext,
  readDropdownRootContext,
} from './dropdown.shared';
import type {
  DropdownItemAsChildProps,
  DropdownItemProps,
} from './dropdown.types';

export function DropdownItem(props: DropdownItemProps): JSX.Element | null;
export function DropdownItem(
  props: DropdownItemAsChildProps
): JSX.Element | null;
export function DropdownItem(
  props: DropdownItemProps | DropdownItemAsChildProps
) {
  const {
    asChild,
    children,
    disabled = false,
    onSelect,
    ref,
    type: typeProp,
    variant,
    ...rest
  } = props;
  const root = readDropdownRootContext();
  const renderContext = readDropdownRenderContext();
  const itemIndex = renderContext.claimItemIndex();
  const itemId = resolvePartId(root.dropdownId, `item-${itemIndex}`);
  const itemText = resolveMenuItemText(children);
  const { items, currentIndex, disabledIndexes } = root.resolvedState;
  const hasEnabledItems = items.some(
    (_item, index) => !disabledIndexes.includes(index)
  );
  const collection = getMenuCollection(root.dropdownId);
  const nav = rovingFocus({
    currentIndex,
    itemCount: Math.max(items.length, 1),
    orientation: 'vertical',
    loop: true,
    isDisabled: (index) => disabledIndexes.includes(index),
    onNavigate: (index) => {
      if (!hasEnabledItems) {
        return;
      }

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
  const setNode = (node: HTMLElement | null) => {
    registerCollectionNode(itemId, collection, node, {
      index: itemIndex,
      disabled,
      text: itemText,
    });
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
    ...nav.item(itemIndex),
    ...(disabled ? { tabIndex: -1 } : {}),
    ref: refHandler,
    id: itemId,
    role: 'menuitem',
    'aria-disabled': disabled ? 'true' : undefined,
    'data-slot': 'dropdown-item',
    'data-disabled': disabled ? 'true' : undefined,
    'data-variant': variant && variant !== 'default' ? variant : undefined,
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
