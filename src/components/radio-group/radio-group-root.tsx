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
import { resolveCompoundId } from '../_internal/id';
import {
  createRadioGroupRenderContext,
  readRadioGroupRootContext,
  RadioGroupRenderContext,
  RadioGroupRootContext,
  type RadioGroupRootContextValue,
} from './radio-group.shared';
import type { RadioGroupProps } from './radio-group.types';

function RadioGroupRootView(props: {
  children?: unknown;
  name?: string;
  disabled: boolean;
  value: string;
}) {
  const { name, disabled, value } = props;
  const root = readRadioGroupRootContext();
  const collection = getCompositeCollection(root.groupId);
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
  const items = getCompositeCollectionItems(collection).map((item) => ({
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
        value: String(item.value ?? ''),
        disabled: item.disabled,
      }));
      const changed =
        nextItems.length !== items.length ||
        nextItems.some(
          (item, index) =>
            item.value !== items[index]?.value ||
            item.disabled !== items[index]?.disabled
        );

      if (changed) {
        notifyItemsChanged();
      }
    });
  };
  const selectedIndex = items.findIndex((item) => item.value === currentValue);
  const fallbackIndex = firstEnabledCompositeIndex(items);
  const currentIndexState = state(
    selectedIndex >= 0 && !items[selectedIndex]?.disabled
      ? selectedIndex
      : fallbackIndex
  );
  const currentIndexCandidate = currentIndexState();
  const currentIndex =
    selectedIndex >= 0 && !items[selectedIndex]?.disabled
      ? selectedIndex
      : items[currentIndexCandidate] && !items[currentIndexCandidate]?.disabled
        ? currentIndexCandidate
        : fallbackIndex;
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
  };
  const renderContext = createRadioGroupRenderContext();
  const finalProps = mergeProps(rest, {
    ref,
    role: 'radiogroup',
    'data-slot': 'radio-group',
    'data-disabled': disabled ? 'true' : undefined,
    'data-orientation': orientation,
    'aria-orientation': orientation === 'both' ? undefined : orientation,
  });

  return (
    <RadioGroupRootContext value={rootContext}>
      <RadioGroupRenderContext value={renderContext}>
        <RadioGroupRootView
          children={<div {...finalProps}>{children}</div>}
          name={name}
          disabled={disabled}
          value={currentValue}
        />
      </RadioGroupRenderContext>
    </RadioGroupRootContext>
  );
}
