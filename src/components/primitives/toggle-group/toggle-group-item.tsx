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
import {
  isDisclosureValueOpen,
  toggleDisclosureValue,
} from '../../_internal/disclosure';
import { resolvePartId } from '../../_internal/id';
import {
  readToggleGroupRenderContext,
  readToggleGroupRootContext,
} from './toggle-group.shared';
import type {
  ToggleGroupItemAsChildProps,
  ToggleGroupItemProps,
} from './toggle-group.types';

export function ToggleGroupItem(props: ToggleGroupItemProps): JSX.Element;
export function ToggleGroupItem(
  props: ToggleGroupItemAsChildProps
): JSX.Element;
export function ToggleGroupItem(
  props: ToggleGroupItemProps | ToggleGroupItemAsChildProps
) {
  const {
    asChild,
    children,
    disabled = false,
    onPress,
    ref,
    type,
    value,
    ...rest
  } = props;
  const root = readToggleGroupRootContext();
  const renderContext = readToggleGroupRenderContext();
  const itemIndex = renderContext.claimItemIndex();
  const itemId = resolvePartId(root.groupId, `item-${itemIndex}`);
  const collection = getCompositeCollection(root.groupId);
  const disabledItemIndexes = disabledIndexes(root.items);
  const nav = rovingFocus({
    currentIndex: root.currentIndex,
    itemCount: Math.max(root.items.length, 1),
    orientation: root.orientation,
    loop: root.loop,
    isDisabled: (index) => disabledItemIndexes.includes(index),
    onNavigate: (index) => {
      root.setCurrentIndex(index);
      focusSelectedCollectionItem(collection, index);
    },
  });
  const isDisabled = root.disabled || disabled;
  const pressed = isDisclosureValueOpen(root.type, root.value, value);
  const interactionProps = pressable({
    disabled: isDisabled,
    onPress: (event) => {
      onPress?.(event);

      if (!event.defaultPrevented) {
        root.setValue(
          toggleDisclosureValue(root.type, root.value, value, true)
        );
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
        registerCompositeNode(itemId, collection, node, {
          index: itemIndex,
          disabled: isDisabled,
          value,
        });
      }
    ),
    id: itemId,
    'aria-pressed': pressed ? 'true' : 'false',
    'data-slot': 'toggle-group-item',
    'data-state': pressed ? 'on' : 'off',
    'data-disabled': isDisabled ? 'true' : undefined,
    tabIndex: isDisabled && asChild ? -1 : undefined,
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return (
    <button type={type ?? 'button'} {...finalProps}>
      {children}
    </button>
  );
}