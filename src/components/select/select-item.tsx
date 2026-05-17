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
  readSelectRenderContext,
  readSelectRootContext,
} from './select.shared';
import type {
  SelectItemAsChildProps,
  SelectItemProps,
  SelectItemTextAsChildProps,
  SelectItemTextProps,
} from './select.types';

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
  const itemIndex = renderContext.claimItemIndex();
  const itemText = resolveMenuItemText(children, textValue);
  const isDisabled = root.disabled || disabled;

  const itemId = resolvePartId(root.selectId, `item-${itemIndex}`);
  const { items, currentIndex, disabledIndexes } = root.resolvedState;
  const collection = getMenuCollection(root.selectId);
  const hasEnabledItems =
    items.length > 0 && disabledIndexes.length < items.length;
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
  const selected = root.value === value;
  const interactionProps = pressable({
    disabled: isDisabled,
    onPress: (event) => {
      if (event.defaultPrevented) {
        return;
      }

      root.setValue(value);
      root.setCurrentIndex(itemIndex);
      root.setOpen(false);
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
          disabled: isDisabled,
          value,
          text: itemText,
        });
      }
    ),
    id: itemId,
    role: 'option',
    tabIndex: isDisabled ? -1 : undefined,
    'aria-selected': selected ? 'true' : 'false',
    'data-slot': 'select-item',
    'data-state': selected ? 'checked' : 'unchecked',
    'data-disabled': isDisabled ? 'true' : undefined,
    'aria-disabled': isDisabled ? 'true' : undefined,
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children as JSX.Element} />;
  }

  return (
    <button type={type ?? 'button'} {...finalProps}>
      {children}
    </button>
  );
}

/**
 * SelectItemText marks the item text node so Select can resolve labels and
 * style the text slot directly.
 */
export function SelectItemText(props: SelectItemTextProps): JSX.Element;
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
