import { state } from '@askrjs/askr';
import { mergeProps } from '@askrjs/ui/foundations';
import { resource } from '@askrjs/askr/resources';
import {
  getCompositeCollection,
  getCompositeCollectionItems,
  disabledIndexes,
  firstEnabledCompositeIndex,
} from '../../_internal/composite';
import { resolveCompoundId } from '../../_internal/id';
import { isJsxElement, toChildArray } from '../../_internal/jsx';
import {
  createTabsRenderContext,
  TabsRenderContext,
  TabsRootContext,
  type TabsRootContextValue,
} from './tabs.shared';
import type { TabsProps } from './tabs.types';

function TabsScopeView(props: {
  children?: unknown;
  finalProps: Record<string, unknown>;
  renderContext: ReturnType<typeof createTabsRenderContext>;
}) {
  return (
    <TabsRenderContext.Scope value={props.renderContext}>
      <TabsRootView finalProps={props.finalProps}>
        {props.children}
      </TabsRootView>
    </TabsRenderContext.Scope>
  );
}

function TabsRootView(props: {
  children?: unknown;
  finalProps: Record<string, unknown>;
}) {
  const keyedChildren = toChildArray(props.children).map((child, index) => {
    if (!isJsxElement(child) || child.key != null) {
      return child;
    }

    return {
      ...child,
      key: `tabs-root-${index}`,
    };
  });

  return <div {...props.finalProps}>{keyedChildren}</div>;
}

export function Tabs(props: TabsProps) {
  const {
    children,
    id,
    defaultValue,
    onValueChange,
    orientation = 'horizontal',
    activationMode = 'automatic',
    loop = true,
    value,
    ref,
    ...rest
  } = props;
  const tabsId = resolveCompoundId(
    'tabs',
    typeof id === 'string' ? id : undefined,
    children
  );
  const collection = getCompositeCollection(tabsId);
  const itemsVersion = state(0);
  const itemsRevision = itemsVersion();
  const items = getCompositeCollectionItems(collection).map((item) => ({
    value: String(item.value ?? ''),
    disabled: item.disabled,
  }));
  const internalValueState = state(defaultValue ?? '');
  const isControlled = value !== undefined;
  const valueState = (() => {
    const read = () =>
      isControlled ? (value as string) : internalValueState();
    read.set = (nextOrUpdater: string | ((prev: string) => string)) => {
      const prev = read();
      const next =
        typeof nextOrUpdater === 'function'
          ? (nextOrUpdater as (prev: string) => string)(prev)
          : nextOrUpdater;

      if (Object.is(prev, next)) {
        return;
      }

      if (isControlled) {
        onValueChange?.(next);
        return;
      }

      internalValueState.set(nextOrUpdater as never);
      onValueChange?.(next);
    };

    return read as typeof read & {
      set(nextOrUpdater: string | ((prev: string) => string)): void;
    };
  })();
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
  const fallbackIndex =
    selectedIndex >= 0 && !items[selectedIndex]?.disabled
      ? selectedIndex
      : firstEnabledCompositeIndex(items);
  const currentIndexState = state(fallbackIndex);
  const currentIndexCandidate = currentIndexState();
  const currentIndex =
    items[currentIndexCandidate] && !items[currentIndexCandidate]?.disabled
      ? currentIndexCandidate
      : fallbackIndex;
  const disabledIndexList = disabledIndexes(items);
  const rootContext: TabsRootContextValue = {
    tabsId,
    value: valueState(),
    setValue: valueState.set,
    notifyItemsChanged,
    scheduleItemsSync,
    orientation,
    activationMode,
    loop,
    currentIndex,
    setCurrentIndex: currentIndexState.set,
    items,
    disabledIndexes: disabledIndexList,
    itemCount: items.length,
    collection,
  };
  const renderContext = createTabsRenderContext();
  const finalProps = mergeProps(rest, {
    ref,
    'data-slot': 'tabs',
    'data-tabs': 'true',
    'data-orientation': orientation,
  });

  resource(() => {
    if (value !== undefined || defaultValue !== undefined) {
      return null;
    }

    if (valueState() !== '') {
      return null;
    }

    const firstEnabledIndex = firstEnabledCompositeIndex(items);
    const firstEnabledItem = items[firstEnabledIndex];

    if (!firstEnabledItem) {
      return null;
    }

    valueState.set(firstEnabledItem.value);
    return null;
  }, [tabsId, value, defaultValue, itemsRevision]);

  return (
    <TabsRootContext.Scope value={rootContext}>
      <TabsScopeView
        finalProps={finalProps as Record<string, unknown>}
        renderContext={renderContext}
      >
        {children}
      </TabsScopeView>
    </TabsRootContext.Scope>
  );
}

