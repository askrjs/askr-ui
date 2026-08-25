import { state } from '@askrjs/askr';
import { controllableState } from '@askrjs/askr/foundations/state';
import { composeRefs, mergeProps } from '@askrjs/askr/foundations/utilities';
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
import { resolveCompoundId } from '../_internal/id';
import {
  createRadioGroupRenderContext,
  readRadioGroupRootContext,
  RadioGroupRenderContext,
  RadioGroupRootContext,
  type RadioGroupRootContextValue,
} from './radio-group.shared';
import type { RadioGroupProps } from './radio-group.types';
import { formResetRef } from '../_internal/form-reset';

function RadioGroupRootView(props: {
  children?: unknown;
  name?: string;
  disabled: boolean;
  value: string;
}) {
  const { name, disabled, value } = props;
  const root = readRadioGroupRootContext();
  const nav = rovingFocus({
    currentIndex: root.currentIndex,
    itemCount: Math.max(root.itemCount, 1),
    orientation: root.orientation,
    loop: root.loop,
    isDisabled: (index) => root.disabledIndexes.includes(index),
    onNavigate: (index) => {
      const next = root.items.find((item) => item.index === index)?.value;

      root.setCurrentIndex(index);
      root.focusItem(index);

      if (next) {
        root.setValue(next);
      }
    },
  });
  const finalProps = nav.container;

  return (
    <div {...finalProps}>
      {props.children}
      {name ? (
        <input type="hidden" name={name} value={value} disabled={disabled} />
      ) : null}
    </div>
  );
}

/**
 * Renders a part of `radio-group`.
 */
export function RadioGroup(props: RadioGroupProps) {
  const {
    children,
    value,
    defaultValue = '',
    onValueChange,
    disabled = false,
    name,
    orientation = 'vertical',
    loop = true,
    id,
    ref,
    ...rest
  } = props;
  const groupId = resolveCompoundId(
    'radio-group',
    typeof id === 'string' ? id : undefined,
    children
  );
  const collection = getCompositeCollection(groupId);
  const itemsVersion = state(0);
  itemsVersion();
  const valueState = controllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  });
  const currentValue = valueState();
  const resetRef = formResetRef(() => {
    if (value === undefined && valueState() !== defaultValue) {
      valueState.set(defaultValue);
    }
  });
  const items = getCompositeCollectionItems(collection).map((item) => ({
    index: item.index,
    setSize: item.setSize,
    value: String(item.value ?? ''),
    disabled: item.disabled,
  }));
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
        value: String(item.value ?? ''),
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
  const selectedIndex = items.find(
    (item) => item.value === currentValue
  )?.index;
  const fallbackIndex = firstEnabledCompositeItemIndex(items);
  const currentIndexState = state(
    selectedIndex !== undefined &&
      !items.find((item) => item.index === selectedIndex)?.disabled
      ? selectedIndex
      : fallbackIndex
  );
  const currentIndexCandidate = currentIndexState();
  const currentItem = items.find(
    (item) => item.index === currentIndexCandidate
  );
  const currentIndex =
    selectedIndex !== undefined &&
    !items.find((item) => item.index === selectedIndex)?.disabled
      ? selectedIndex
      : currentItem && !currentItem.disabled
        ? currentIndexCandidate
        : fallbackIndex;
  const itemCount = compositeItemCount(items);
  const disabledItemIndexes = disabledCompositeItemIndexes(items);
  const pendingFocus = state<PendingCollectionFocus>({ index: null })();
  const focusItem = (index: number) =>
    focusCollectionItemWithRestore(pendingFocus, collection, index);
  const rootContext: RadioGroupRootContextValue = {
    groupId,
    value: valueState(),
    setValue: valueState.set,
    notifyItemsChanged,
    scheduleItemsSync,
    orientation,
    loop,
    disabled,
    currentIndex,
    setCurrentIndex: currentIndexState.set,
    items,
    itemCount,
    disabledIndexes: disabledItemIndexes,
    focusItem,
    restoreItemFocus: (index, node) =>
      restorePendingCollectionItemFocus(pendingFocus, index, node),
  };
  const renderContext = createRadioGroupRenderContext();
  const finalProps = mergeProps(rest, {
    ref: composeRefs(ref, resetRef),
    role: 'radiogroup',
    'data-slot': 'radio-group',
    'data-disabled': disabled ? 'true' : undefined,
    'data-orientation': orientation,
    'aria-orientation': orientation === 'both' ? undefined : orientation,
  });

  return (
    <RadioGroupRootContext value={rootContext}>
      <RadioGroupRenderContext value={renderContext}>
        <VirtualCompositeOwnerContext value>
          <RadioGroupRootView
            children={<div {...finalProps}>{children}</div>}
            name={name}
            disabled={disabled}
            value={currentValue}
          />
        </VirtualCompositeOwnerContext>
      </RadioGroupRenderContext>
    </RadioGroupRootContext>
  );
}
