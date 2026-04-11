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
} from '../../_internal/composite';
import { resolveCompoundId } from '../../_internal/id';
import { collectJsxElements } from '../../_internal/jsx';
import { RadioGroupItem } from './radio-group-item';
import {
  createRadioGroupRenderContext,
  RadioGroupRenderContext,
  RadioGroupRootContext,
  type RadioGroupItemMetadata,
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
  const finalProps = mergeProps(props as {}, {
    ...nav.container,
  });

  return (
    <>
      <div {...finalProps}>{props.children}</div>
      {props.name ? (
        <input
          type="hidden"
          name={props.name}
          value={props.value}
          disabled={props.disabled}
        />
      ) : null}
    </>
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
  const valueState = controllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  });
  const items = collectJsxElements(
    children,
    (element) => element.type === RadioGroupItem
  ).map(
    (element): RadioGroupItemMetadata => ({
      value: String(element.props?.value ?? ''),
      disabled: disabled || Boolean(element.props?.disabled),
    })
  );
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
    <RadioGroupRootContext.Scope value={rootContext}>
      <RadioGroupScopeView
        renderContext={renderContext}
        name={name}
        disabled={disabled}
        value={valueState()}
      >
        <div {...finalProps}>{children}</div>
      </RadioGroupScopeView>
    </RadioGroupRootContext.Scope>
  );
}

import { readRadioGroupRootContext } from './radio-group.shared';