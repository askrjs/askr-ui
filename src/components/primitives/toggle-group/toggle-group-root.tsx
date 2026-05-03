import { state } from '@askrjs/askr';
import {
  controllableState,
  mergeProps,
  rovingFocus,
} from '@askrjs/askr/foundations';
import { focusSelectedCollectionItem } from '../../_internal/focus';
import {
  disabledIndexes,
  firstEnabledCompositeIndex,
  getCompositeCollection,
  getCompositeCollectionItems,
} from '../../_internal/composite';
import { isDisclosureValueOpen } from '../../_internal/disclosure';
import { resolveCompoundId } from '../../_internal/id';
import { isJsxElement, toChildArray } from '../../_internal/jsx';
import {
  createToggleGroupRenderContext,
  readToggleGroupRootContext,
  ToggleGroupRenderContext,
  ToggleGroupRootContext,
  type ToggleGroupRootContextValue,
} from './toggle-group.shared';
import type {
  ToggleGroupMultipleProps,
  ToggleGroupProps,
  ToggleGroupSingleProps,
} from './toggle-group.types';

function ToggleGroupScopeView(props: {
  children?: unknown;
  finalProps: Record<string, unknown>;
  renderContext: ReturnType<typeof createToggleGroupRenderContext>;
}) {
  return (
    <ToggleGroupRenderContext.Scope value={props.renderContext}>
      <ToggleGroupRootView
        finalProps={props.finalProps}
        children={props.children}
      />
    </ToggleGroupRenderContext.Scope>
  );
}

function ToggleGroupRootView(props: {
  children?: unknown;
  finalProps: Record<string, unknown>;
}) {
  const root = readToggleGroupRootContext();
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
  const mergedProps = mergeProps(props.finalProps, {
    ...nav.container,
  });
  const keyedChildren = toChildArray(props.children).map((child, index) => {
    if (!isJsxElement(child) || child.key != null) {
      return child;
    }

    return {
      ...child,
      key: `toggle-group-root-${index}`,
    };
  });

  return <div {...mergedProps}>{keyedChildren}</div>;
}

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
  const selectedIndex = items.findIndex((item) =>
    isDisclosureValueOpen(type, valueState(), item.value)
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
  const rootContext: ToggleGroupRootContextValue = {
    groupId,
    type,
    value: valueState(),
    setValue,
    notifyItemsChanged,
    scheduleItemsSync,
    orientation,
    loop,
    disabled,
    currentIndex,
    setCurrentIndex: currentIndexState.set,
    items,
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

  return (
    <ToggleGroupRootContext.Scope value={rootContext}>
      <ToggleGroupScopeView
        finalProps={finalProps as Record<string, unknown>}
        renderContext={renderContext}
      >
        {children}
      </ToggleGroupScopeView>
    </ToggleGroupRootContext.Scope>
  );
}
