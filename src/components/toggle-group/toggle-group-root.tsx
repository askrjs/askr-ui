import { state } from '@askrjs/askr';
import { controllableState } from '@askrjs/askr/foundations/state';
import { mergeProps } from '@askrjs/askr/foundations/utilities';
import { rovingFocus } from '@askrjs/askr/foundations/interactions';
import { focusSelectedCollectionItem } from '../_internal/focus';
import {
  disabledIndexes,
  firstEnabledCompositeIndex,
  getCompositeCollection,
  getCompositeCollectionItems,
} from '../_internal/composite';
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

export function ToggleGroup(props: ToggleGroupProps) {
  const {
    children,
    disabled = false,
    id,
    loop = true,
    orientation = 'horizontal',
    ref,
    type = 'single',
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
      notifyItemsChanged();
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
  const selectedIndex = items.findIndex((item) =>
    isDisclosureValueOpen(type, currentValue, item.value)
  );
  const initialCurrentIndex =
    selectedIndex >= 0 && !items[selectedIndex]?.disabled
      ? selectedIndex
      : firstEnabledCompositeIndex(items);
  const currentIndexState = state(initialCurrentIndex);
  const currentIndexCandidate = currentIndexState();
  const currentIndex =
    items[currentIndexCandidate] && !items[currentIndexCandidate]?.disabled
      ? currentIndexCandidate
      : firstEnabledCompositeIndex(items);
  const disabledItemIndexes = disabledIndexes(items);
  const rootContext: ToggleGroupRootContextValue = {
    groupId,
    type,
    value: currentValue,
    setValue,
    notifyItemsChanged,
    scheduleItemsSync,
    orientation,
    loop,
    disabled,
    currentIndex,
    setCurrentIndex: currentIndexState.set,
    items,
    disabledItemIndexes,
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
    itemCount: Math.max(items.length, 1),
    orientation,
    loop,
    isDisabled: (index) => disabledItemIndexes.includes(index),
    onNavigate: (index) => {
      currentIndexState.set(index);
      focusSelectedCollectionItem(collection, index);
    },
  });
  const mergedProps = mergeProps(finalProps, nav.container);

  return (
    <ToggleGroupRootContext.Scope value={rootContext}>
      <ToggleGroupRenderContext.Scope value={renderContext}>
        <div {...mergedProps}>{children}</div>
      </ToggleGroupRenderContext.Scope>
    </ToggleGroupRootContext.Scope>
  );
}
