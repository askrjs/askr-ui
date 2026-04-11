import { state } from '@askrjs/askr';
import { controllableState, mergeProps, rovingFocus } from '@askrjs/askr/foundations';
import { focusSelectedCollectionItem } from '../../_internal/focus';
import {
  disabledIndexes,
  firstEnabledCompositeIndex,
  getCompositeCollection,
} from '../../_internal/composite';
import { isDisclosureValueOpen } from '../../_internal/disclosure';
import { resolveCompoundId } from '../../_internal/id';
import { collectJsxElements } from '../../_internal/jsx';
import { ToggleGroupItem } from './toggle-group-item';
import {
  createToggleGroupRenderContext,
  readToggleGroupRootContext,
  ToggleGroupRenderContext,
  ToggleGroupRootContext,
  type ToggleGroupItemMetadata,
  type ToggleGroupRootContextValue,
} from './toggle-group.shared';
import type {
  ToggleGroupMultipleProps,
  ToggleGroupProps,
  ToggleGroupSingleProps,
} from './toggle-group.types';

function createToggleGroupValueState(props: ToggleGroupProps) {
  if (props.type === 'multiple') {
    const multipleProps = props as ToggleGroupMultipleProps;
    return controllableState({
      value: multipleProps.value,
      defaultValue: multipleProps.defaultValue ?? [],
      onChange: multipleProps.onValueChange,
    });
  }

  const singleProps = props as ToggleGroupSingleProps;
  return controllableState({
    value: singleProps.value,
    defaultValue: singleProps.defaultValue ?? '',
    onChange: singleProps.onValueChange,
  });
}

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

  return <div {...mergedProps}>{props.children}</div>;
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
  const items = collectJsxElements(
    children,
    (element) => element.type === ToggleGroupItem
  ).map(
    (element): ToggleGroupItemMetadata => ({
      value: element.props?.value as string,
      disabled: disabled || Boolean(element.props?.disabled),
    })
  );
  const valueState = createToggleGroupValueState(props);
  const setValue = (nextValue: string | string[]) => {
    if (type === 'multiple') {
      (valueState.set as (value: string[]) => void)(
        Array.isArray(nextValue)
          ? nextValue
          : nextValue
            ? [nextValue]
            : []
      );
      return;
    }

    (valueState.set as (value: string) => void)(
      Array.isArray(nextValue) ? nextValue[0] ?? '' : nextValue
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