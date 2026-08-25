import { state } from '@askrjs/askr';
import { controllableState } from '@askrjs/askr/foundations/state';
import { mergeProps } from '@askrjs/askr/foundations/utilities';
import { rovingFocus } from '../_internal/roving-focus';
import {
  focusCollectionItemWithRestore,
  restorePendingCollectionItemFocus,
  type PendingCollectionFocus,
} from '../_internal/focus';
import {
  getCompositeCollection,
  getCompositeCollectionItems,
} from '../_internal/composite';
import {
  compositeItemCount,
  disabledCompositeItemIndexes,
  firstEnabledCompositeItemIndex,
  VirtualCompositeOwnerContext,
} from '../_internal/virtual-composite';
import { isDisclosureValueOpen } from '../_internal/disclosure';
import { resolveCompoundId } from '../_internal/id';
import {
  createToggleGroupRenderContext,
  ToggleGroupRenderContext,
  ToggleGroupRootContext,
  type ToggleGroupRootContextValue,
} from './toggle-group.shared';
import type {
  ToggleGroupMultipleProps,
  ToggleGroupProps,
  ToggleGroupSingleProps,
} from './toggle-group.types';

/**
 * Renders a part of `toggle-group`.
 */
export function ToggleGroup(props: ToggleGroupProps) {
  const {
    children,
    disabled = false,
    id,
    loop = true,
    orientation = 'horizontal',
    ref,
    type = 'single',
    value: _value,
    defaultValue: _defaultValue,
    onValueChange: _onValueChange,
    ...rest
  } = props;
  const groupId = resolveCompoundId(
    'toggle-group',
    typeof id === 'string' ? id : undefined,
    children
  );
  const collection = getCompositeCollection(groupId);
  const itemsVersion = state(0);
  itemsVersion();
  const items = getCompositeCollectionItems(collection).map((item) => ({
    index: item.index,
    setSize: item.setSize,
    value: item.value as string,
    disabled: item.disabled,
  }));
  const valueState =
    type === 'multiple'
      ? controllableState({
          value: (props as ToggleGroupMultipleProps).value,
          defaultValue: (props as ToggleGroupMultipleProps).defaultValue ?? [],
          onChange: (props as ToggleGroupMultipleProps).onValueChange,
        })
      : controllableState({
          value: (props as ToggleGroupSingleProps).value,
          defaultValue: (props as ToggleGroupSingleProps).defaultValue ?? '',
          onChange: (props as ToggleGroupSingleProps).onValueChange,
        });
  let itemsSyncQueued = false;
  const notifyItemsChanged = () => {
    itemsVersion.set((currentVersion) => currentVersion + 1);
  };
  const scheduleItemsSync = () => {
    if (itemsSyncQueued) {
      return;
    }

    itemsSyncQueued = true;
    queueMicrotask(() => {
      itemsSyncQueued = false;
      const nextItems = getCompositeCollectionItems(collection).map((item) => ({
        index: item.index,
        setSize: item.setSize,
        value: item.value as string,
        disabled: item.disabled,
      }));
      const changed =
        nextItems.length !== items.length ||
        nextItems.some(
          (item, index) =>
            item.index !== items[index]?.index ||
            item.setSize !== items[index]?.setSize ||
            item.value !== items[index]?.value ||
            item.disabled !== items[index]?.disabled
        );

      if (changed) {
        notifyItemsChanged();
      }
    });
  };
  const setValue = (nextValue: string | string[]) => {
    if (type === 'multiple') {
      (valueState.set as (value: string[]) => void)(
        Array.isArray(nextValue) ? nextValue : nextValue ? [nextValue] : []
      );
      return;
    }

    (valueState.set as (value: string) => void)(
      Array.isArray(nextValue) ? (nextValue[0] ?? '') : nextValue
    );
  };
  const currentValue = valueState();
  const selectedIndex = items.find((item) =>
    isDisclosureValueOpen(type, currentValue, item.value)
  )?.index;
  const initialCurrentIndex =
    selectedIndex !== undefined &&
    !items.find((item) => item.index === selectedIndex)?.disabled
      ? selectedIndex
      : firstEnabledCompositeItemIndex(items);
  const itemCount = compositeItemCount(items);
  const selectedIsEnabled =
    selectedIndex !== undefined &&
    !items.find((item) => item.index === selectedIndex)?.disabled;
  const resolvedSelectedIndex = selectedIsEnabled ? selectedIndex : -1;
  // The roving tab stop follows keyboard navigation, and re-seeds to the
  // selection whenever the selected item changes by any path (press,
  // programmatic, or controlled) so a value change still moves the tab stop.
  const roving = state<{ index: number; selected: number }>({
    index: initialCurrentIndex,
    selected: resolvedSelectedIndex,
  })();
  // A version counter, not the index itself: navigating back to a previously
  // stored index must still re-render, which an equal-value state.set skips.
  const rovingVersion = state(0);
  rovingVersion();

  if (roving.selected !== resolvedSelectedIndex) {
    roving.selected = resolvedSelectedIndex;

    if (resolvedSelectedIndex >= 0) {
      roving.index = resolvedSelectedIndex;
    }
  }

  const currentItem = items.find((item) => item.index === roving.index);
  const rovingIsUsable = currentItem
    ? !currentItem.disabled
    : roving.index >= 0 && roving.index < Math.max(itemCount, 1);
  const currentIndex = rovingIsUsable
    ? roving.index
    : selectedIsEnabled
      ? selectedIndex
      : firstEnabledCompositeItemIndex(items);
  const setCurrentIndex = (index: number) => {
    if (roving.index === index) return;
    roving.index = index;
    rovingVersion.set(rovingVersion() + 1);
  };
  const disabledItemIndexes = disabledCompositeItemIndexes(items);
  const pendingFocus = state<PendingCollectionFocus>({ index: null })();
  const focusItem = (index: number) =>
    focusCollectionItemWithRestore(pendingFocus, collection, index);
  const rootContext: ToggleGroupRootContextValue = {
    groupId,
    type,
    value: currentValue,
    getValue: valueState,
    setValue,
    notifyItemsChanged,
    scheduleItemsSync,
    orientation,
    loop,
    disabled,
    currentIndex,
    setCurrentIndex,
    items,
    itemCount,
    disabledItemIndexes,
    focusItem,
    restoreItemFocus: (index, node) =>
      restorePendingCollectionItemFocus(pendingFocus, index, node),
  };
  const renderContext = createToggleGroupRenderContext();
  const finalProps = mergeProps(rest, {
    ref,
    role: 'group',
    'data-slot': 'toggle-group',
    'data-orientation': orientation,
    'data-toggle-group': 'true',
    'data-disabled': disabled ? 'true' : undefined,
  });
  const nav = rovingFocus({
    currentIndex,
    itemCount: Math.max(itemCount, 1),
    orientation,
    loop,
    isDisabled: (index) => disabledItemIndexes.includes(index),
    onNavigate: (index) => {
      setCurrentIndex(index);
      focusItem(index);
    },
  });
  const mergedProps = mergeProps(finalProps, nav.container);

  return (
    <ToggleGroupRootContext value={rootContext}>
      <ToggleGroupRenderContext value={renderContext}>
        <VirtualCompositeOwnerContext value>
          <div {...mergedProps}>{children}</div>
        </VirtualCompositeOwnerContext>
      </ToggleGroupRenderContext>
    </ToggleGroupRootContext>
  );
}
