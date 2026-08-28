import { nativeButtonProps } from '../_internal/native-control';
import { state } from '@askrjs/askr';
import { Slot } from '@askrjs/askr/foundations/structures';
import { composeRefs, mergeProps } from '@askrjs/askr/foundations/utilities';
import { pressable } from '@askrjs/askr/foundations/interactions';
import { rovingFocus } from '../_internal/roving-focus';
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
  const placement = state<{ index: number; setSize?: number }>({ index: -1 })();
  const scopedVirtualPlacement = claimVirtualCompositePlacement(
    placement,
    renderContext.claimItemIndex,
    renderContext.virtualIdentity
  );
  const itemIndex = scopedVirtualPlacement?.index ?? placement.index;
  const stableItemKey =
    typeof value === 'string' && value.length > 0 ? value : String(itemIndex);
  const itemId = resolvePartId(root.dropdownId, `item-${stableItemKey}`);
  const itemText = resolveMenuItemText(children, textValue);
  const { items, currentIndex, disabledIndexes } = root.resolvedState;
  const hasEnabledItems = items.some((item) => !item.disabled);
  const collection = getMenuCollection(root.dropdownId);
  const nav = rovingFocus({
    currentIndex,
    itemCount: Math.max(root.resolvedState.itemCount, 1),
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
  const focusRepairProps = compositeItemFocusProps();
  const focusNode = state<{ current: HTMLElement | null }>({ current: null })();
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
    focusNode.current = node;
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
        value: stableItemKey,
        text: itemText,
      },
      registrationOwner
    );
    root.restoreItemFocus(resolvedIndex, node);
    repairFocusForDisabledItem({
      collection,
      current: root.open && root.resolvedState.currentIndex === resolvedIndex,
      disabled,
      index: resolvedIndex,
      loop: true,
      node,
      setCurrentIndex: root.setCurrentIndex,
    });
  };
  const renderedNode = focusNode.current;
  if (renderedNode) {
    queueMicrotask(() => {
      if (focusNode.current === renderedNode && renderedNode.isConnected) {
        setNode(renderedNode);
      }
    });
  }
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
