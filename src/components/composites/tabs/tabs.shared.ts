import { defineContext, readContext } from '@askrjs/askr';
import type { getCompositeCollection } from '../../_internal/composite';
import type { TabsActivationMode, TabsOrientation } from './tabs.types';

export type TabsRootContextValue = {
  tabsId: string;
  value: string;
  setValue: (value: string) => void;
  notifyItemsChanged: () => void;
  scheduleItemsSync: () => void;
  orientation: TabsOrientation;
  activationMode: TabsActivationMode;
  loop: boolean;
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  items: { value: string; disabled: boolean }[];
  disabledIndexes: number[];
  itemCount: number;
  collection: ReturnType<typeof getCompositeCollection>;
};

export type TabsRenderContextValue = {
  claimTriggerIndex: () => number;
};

export const TabsRootContext = defineContext<TabsRootContextValue | null>(null);
export const TabsRenderContext =
  defineContext<TabsRenderContextValue | null>(null);

export function readTabsRootContext(): TabsRootContextValue {
  const context = readContext(TabsRootContext);

  if (!context) {
    throw new Error('Tabs components must be used within <Tabs>');
  }

  return context;
}

export function readTabsRenderContext(): TabsRenderContextValue {
  const context = readContext(TabsRenderContext);

  if (!context) {
    throw new Error('TabsTrigger must be used within <Tabs>');
  }

  return context;
}

export function createTabsRenderContext(): TabsRenderContextValue {
  let nextTriggerIndex = 0;

  return {
    claimTriggerIndex: () => {
      const index = nextTriggerIndex;
      nextTriggerIndex += 1;
      return index;
    },
  };
}

export function getTabsTriggerId(tabsId: string, value: string): string {
  return `${tabsId}--trigger--${value}`;
}

export function getTabsContentId(tabsId: string, value: string): string {
  return `${tabsId}--content--${value}`;
}
