import { defineContext, readContext } from '@askrjs/askr';
import { resolvePartId } from '../../_internal/id';
import type { TabsActivationMode, TabsOrientation } from './tabs.types';

export type TabsTriggerMetadata = {
  value: string;
  disabled: boolean;
};

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
  items: TabsTriggerMetadata[];
};

export type TabsRenderContextValue = {
  claimTriggerIndex: () => number;
};

export const TabsRootContext = defineContext<TabsRootContextValue | null>(null);
export const TabsRenderContext = defineContext<TabsRenderContextValue | null>(
  null
);

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
  return resolvePartId(tabsId, `trigger-${value}`);
}

export function getTabsContentId(tabsId: string, value: string): string {
  return resolvePartId(tabsId, `content-${value}`);
}
