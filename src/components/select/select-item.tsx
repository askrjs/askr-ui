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
  readSelectRenderContext,
  readSelectRootContext,
} from './select.shared';
import type {
  SelectItemAsChildProps,
  SelectItemProps,
  SelectItemTextAsChildProps,
  SelectItemTextProps,
} from './select.types';

/**
 * Renders a part of `select`.
 *
 * Supports polymorphic rendering via `asChild`.
 */
export function SelectItem(props: SelectItemProps): JSX.Element | null;
export function SelectItem(props: SelectItemAsChildProps): JSX.Element | null;
export function SelectItem(props: SelectItemProps | SelectItemAsChildProps) {
  const {
    asChild,
    children,
    disabled = false,
    value,
    textValue,
    ref,
    type,
    ...rest
  } = props;
  const root = readSelectRootContext();
  const renderContext = readSelectRenderContext();
  const placement = state<{ index: number; setSize?: number }>({ index: -1 })();
  const scopedVirtualPlacement = claimVirtualCompositePlacement(
    placement,
    renderContext.claimItemIndex,
    renderContext.virtualIdentity
  );
  const itemIndex = scopedVirtualPlacement?.index ?? placement.index;
  const itemText = resolveMenuItemText(children, textValue);
  const isDisabled = root.disabled || disabled;

  const itemId = resolvePartId(root.selectId, `item-${value}`);
  const { items, currentIndex, disabledIndexes } = root.resolvedState;
  const collection = getMenuCollection(root.selectId);
  const hasEnabledItems =
    items.length > 0 && disabledIndexes.length < items.length;
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
  const selected = root.value === value;
  const interactionProps = pressable({
    disabled: isDisabled,
    onPress: (event) => {
      runCancelablePress(event, undefined, () => {
        root.setValue(value);
        root.setCurrentIndex(itemIndex);
        root.setOpen(false);
      });
    },
    isNativeButton: false,
  });
  const itemFocusProps = nav.item(itemIndex);
  const focusRepairProps = compositeItemFocusProps();
  const focusNode = state<{ current: HTMLElement | null }>({ current: null })();
  const handleKeyDown = (event: KeyboardEvent) => {
    if (!isDisabled && root.handleTypeaheadKeyDown(event)) {
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
        disabled: isDisabled,
        value,
        text: itemText,
      },
      registrationOwner
    );
    root.restoreItemFocus(resolvedIndex, node);
    repairFocusForDisabledItem({
      collection,
      current: root.open && root.resolvedState.currentIndex === resolvedIndex,
      disabled: isDisabled,
      index: resolvedIndex,
      loop: true,
      node,
      setCurrentIndex: root.setCurrentIndex,
    });
  };
  if (focusNode.current) {
    setNode(focusNode.current);
  }
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
      setNode
    ),
    id: itemId,
    role: 'option',
    disabled: isDisabled && !asChild ? true : undefined,
    'aria-selected': selected ? 'true' : 'false',
    'data-slot': 'select-item',
    'data-state': selected ? 'checked' : 'unchecked',
    'data-disabled': isDisabled ? 'true' : undefined,
    'aria-disabled': isDisabled ? 'true' : undefined,
    tabIndex: isDisabled ? -1 : itemFocusProps.tabIndex,
    ...focusRepairProps,
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children as JSX.Element} />;
  }

  return (
    <button type={type ?? 'button'} {...nativeButtonProps(finalProps)}>
      {children}
    </button>
  );
}

/**
 * SelectItemText marks the item text node so Select can resolve labels and
 * style the text slot directly.
 */
export function SelectItemText(props: SelectItemTextProps): JSX.Element;
/**
 * Renders the `select-item-text` part of `select`.
 *
 * Supports polymorphic rendering via `asChild`.
 */
export function SelectItemText(props: SelectItemTextAsChildProps): JSX.Element;
export function SelectItemText(
  props: SelectItemTextProps | SelectItemTextAsChildProps
) {
  const { asChild, children, ref, ...rest } = props;
  const finalProps = mergeProps(rest, {
    ref,
    'data-slot': 'select-item-text',
    'data-select-item-text': 'true',
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return <span {...finalProps}>{children}</span>;
}
