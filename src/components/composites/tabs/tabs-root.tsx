import { state } from '@askrjs/askr';
import { controllableState, mergeProps } from '@askrjs/askr/foundations';
import {
  getCompositeCollection,
  getCompositeCollectionItems,
  firstEnabledCompositeIndex,
} from '../../_internal/composite';
import { resolveCompoundId } from '../../_internal/id';
import { collectJsxElements } from '../../_internal/jsx';
import { TabsTrigger } from './tabs-trigger';
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
      <TabsRootView finalProps={props.finalProps}>{props.children}</TabsRootView>
    </TabsRenderContext.Scope>
  );
}

function TabsRootView(props: {
  children?: unknown;
  finalProps: Record<string, unknown>;
}) {
  return <div {...props.finalProps}>{props.children}</div>;
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
  itemsVersion();
  const items = getCompositeCollectionItems(collection).map((item) => ({
    value: String(item.value ?? ''),
    disabled: item.disabled,
  }));
  const initialTriggers =
    value === undefined && defaultValue === undefined
      ? collectJsxElements(children, (element) => element.type === TabsTrigger)
      : [];
  const initialFallbackValue =
    initialTriggers.length > 0
      ? String(
          initialTriggers[
            firstEnabledCompositeIndex(
              initialTriggers.map((element) => ({
                disabled: Boolean(element.props?.disabled),
              }))
            )
          ]?.props?.value ?? ''
        )
      : '';
  const valueState = controllableState({
    value,
    defaultValue: defaultValue ?? initialFallbackValue,
    onChange: onValueChange,
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
  };
  const renderContext = createTabsRenderContext();
  const finalProps = mergeProps(rest, {
    ref,
    'data-slot': 'tabs',
    'data-tabs': 'true',
    'data-orientation': orientation,
  });

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