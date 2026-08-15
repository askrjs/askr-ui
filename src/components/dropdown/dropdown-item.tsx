import { nativeButtonProps } from '../_internal/native-control';
import { Slot } from '@askrjs/askr/foundations/structures';
import { composeRefs, mergeProps } from '@askrjs/askr/foundations/utilities';
import { pressable, rovingFocus } from '@askrjs/askr/foundations/interactions';
import {
  getMenuCollection,
  registerCollectionNode,
  resolveMenuItemText,
} from '../_internal/menu';
import { resolvePartId } from '../_internal/id';
import { runCancelablePress } from '../_internal/press';
import {
  readDropdownRenderContext,
  readDropdownRootContext,
} from './dropdown.shared';
import type {
  DropdownItemAsChildProps,
  DropdownItemProps,
} from './dropdown.types';

/**
 * Renders a part of `dropdown`.
 *
 * Supports polymorphic rendering via `asChild`.
 */
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
    value,
    onSelect,
    ref,
    textValue,
    type: typeProp,
    variant,
    ...rest
  } = props;
  const root = readDropdownRootContext();
  const renderContext = readDropdownRenderContext();
  const itemIndex = renderContext.claimItemIndex();
  const stableItemKey =
    typeof value === 'string' && value.length > 0 ? value : String(itemIndex);
  const itemId = resolvePartId(root.dropdownId, `item-${stableItemKey}`);
  const itemText = resolveMenuItemText(children, textValue);
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
      root.focusItem(index);
    },
  });
  const interactionProps = pressable({
    disabled,
    onPress: (event) => {
      runCancelablePress(event, onSelect, () => {
        root.setCurrentIndex(itemIndex);
        root.setOpen(false);
      });
    },
    isNativeButton: false,
  });
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
  const setNode = (node: HTMLElement | null) => {
    registerCollectionNode(
      itemId,
      collection,
      node,
      {
        index: itemIndex,
        disabled,
        value: stableItemKey,
        text: itemText,
      },
      registrationOwner
    );
    root.restoreItemFocus(itemIndex, node);
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
    onKeyUp: handleKeyUp,
    ...nav.item(itemIndex),
    ...(disabled ? { tabIndex: -1 } : {}),
    ref: refHandler,
    id: itemId,
    role: 'menuitem',
    disabled: disabled && !asChild ? true : undefined,
    'aria-disabled': disabled ? 'true' : undefined,
    'data-slot': 'dropdown-item',
    'data-disabled': disabled ? 'true' : undefined,
    'data-variant': variant && variant !== 'default' ? variant : undefined,
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
