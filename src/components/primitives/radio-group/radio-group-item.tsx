import {
  Slot,
  composeRefs,
  mergeProps,
  pressable,
  rovingFocus,
} from '@askrjs/askr/foundations';
import { focusSelectedCollectionItem } from '../../_internal/focus';
import {
  disabledIndexes,
  getCompositeCollection,
  registerCompositeNode,
} from '../../_internal/composite';
import { resolvePartId } from '../../_internal/id';
import {
  readRadioGroupRenderContext,
  readRadioGroupRootContext,
} from './radio-group.shared';
import type {
  RadioGroupItemAsChildProps,
  RadioGroupItemProps,
} from './radio-group.types';

export function RadioGroupItem(props: RadioGroupItemProps): JSX.Element;
export function RadioGroupItem(props: RadioGroupItemAsChildProps): JSX.Element;
export function RadioGroupItem(
  props: RadioGroupItemProps | RadioGroupItemAsChildProps
) {
  const { asChild, children, value, disabled = false, ref, ...rest } = props;
  const root = readRadioGroupRootContext();
  const renderContext = readRadioGroupRenderContext();
  const itemIndex = renderContext.claimItemIndex();
  const itemId = resolvePartId(root.groupId, `item-${itemIndex}`);
  const collection = getCompositeCollection(root.groupId);
  const isDisabled = root.disabled || disabled;
  const disabledItemIndexes = disabledIndexes(root.items);
  const nav = rovingFocus({
    currentIndex: root.currentIndex,
    itemCount: Math.max(root.items.length, 1),
    orientation: root.orientation,
    loop: root.loop,
    isDisabled: (index) => disabledItemIndexes.includes(index),
    onNavigate: (index) => {
      const next = root.items[index]?.value;

      root.setCurrentIndex(index);
      focusSelectedCollectionItem(collection, index);

      if (next) {
        root.setValue(next);
      }
    },
  });
  const checked = root.value === value;
  const interactionProps = pressable({
    disabled: isDisabled,
    onPress: () => {
      root.setValue(value);
      root.setCurrentIndex(itemIndex);
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
        const changed = registerCompositeNode(itemId, collection, node, {
          index: itemIndex,
          disabled: isDisabled,
          value,
        });

        if (changed) {
          root.scheduleItemsSync();
        }
      }
    ),
    id: itemId,
    role: 'radio',
    'aria-checked': checked ? 'true' : 'false',
    'data-slot': 'radio-group-item',
    'data-disabled': isDisabled ? 'true' : undefined,
    'data-state': checked ? 'checked' : 'unchecked',
    tabIndex: isDisabled && asChild ? -1 : undefined,
    value,
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return (
    <button type="button" {...finalProps}>
      {children}
    </button>
  );
}
