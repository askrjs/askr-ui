import { For, state } from '@askrjs/askr';
import {
  controllableState,
  mergeProps,
  rovingFocus,
} from '@askrjs/ui/foundations';
import { focusSelectedCollectionItem } from '../../_internal/focus';
import {
  disabledIndexes,
  firstEnabledCompositeIndex,
  getCompositeCollection,
  getCompositeCollectionItems,
} from '../../_internal/composite';
import { resolveCompoundId } from '../../_internal/id';
import { isJsxElement, toChildArray } from '../../_internal/jsx';
import {
  createRadioGroupRenderContext,
  readRadioGroupRootContext,
  RadioGroupRenderContext,
  RadioGroupRootContext,
  type RadioGroupRootContextValue,
} from './radio-group.shared';
import type { RadioGroupProps } from './radio-group.types';

function RadioGroupScopeView(props: {
  children?: unknown;
  name?: string;
  disabled: boolean;
  value: string;
  renderContext: ReturnType<typeof createRadioGroupRenderContext>;
}) {
  return (
    <RadioGroupRenderContext.Scope value={props.renderContext}>
      <RadioGroupRootView
        children={props.children}
        name={props.name}
        disabled={props.disabled}
        value={props.value}
      />
    </RadioGroupRenderContext.Scope>
  );
}

function RadioGroupRootView(props: {
  children?: unknown;
  name?: string;
  disabled: boolean;
  value: string;
}) {
  const { children, name, disabled, value } = props;
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
  const finalProps = mergeProps(
    {},
    {
      ...nav.container,
    }
  );
  const keyedChildren = toChildArray(props.children).map((child, index) => {
    if (!isJsxElement(child) || child.key != null) {
      return child;
    }

    return {
      ...child,
      key: `radio-group-root-${index}`,
    };
  });
  const renderedChildren = [...keyedChildren];

  if (name) {
    renderedChildren.push(
      <input
        key="radio-group-hidden-input"
        type="hidden"
        name={name}
        value={value}
        disabled={disabled}
      />
    );
  }
  const renderedList = (
    <For
      each={() => renderedChildren}
      by={(child, index) =>
        isJsxElement(child) && child.key != null ? String(child.key) : index
      }
    >
      {(child) => child as JSX.Element}
    </For>
  );

  return <div {...finalProps}>{renderedList}</div>;
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
      notifyItemsChanged();
    });
  };
  const selectedIndex = items.findIndex((item) => item.value === valueState());
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
  const keyedChildren = toChildArray(children).map((child, index) => {
    if (!isJsxElement(child) || child.key != null) {
      return child;
    }

    return {
      ...child,
      key: `radio-group-${index}`,
    };
  });

  return (
    <RadioGroupRootContext.Scope value={rootContext}>
      <RadioGroupScopeView
        renderContext={renderContext}
        name={name}
        disabled={disabled}
        value={valueState()}
      >
        <div {...finalProps}>{keyedChildren}</div>
      </RadioGroupScopeView>
    </RadioGroupRootContext.Scope>
  );
}

