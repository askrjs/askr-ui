import { defineContext, readContext } from '@askrjs/askr';
import type { ToggleGroupOrientation } from './toggle-group.types';

export type ToggleGroupRootItem = {
  value: string;
  disabled: boolean;
};

export type ToggleGroupRootContextValue = {
  groupId: string;
  type: 'single' | 'multiple';
  value: string | string[];
  setValue: (value: string | string[]) => void;
  notifyItemsChanged: () => void;
  scheduleItemsSync: () => void;
  orientation: ToggleGroupOrientation;
  loop: boolean;
  disabled: boolean;
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  items: ToggleGroupRootItem[];
};

export type ToggleGroupRenderContextValue = {
  claimItemIndex: () => number;
};

export const ToggleGroupRootContext =
  defineContext<ToggleGroupRootContextValue | null>(null);

export const ToggleGroupRenderContext =
  defineContext<ToggleGroupRenderContextValue | null>(null);

export function readToggleGroupRootContext(): ToggleGroupRootContextValue {
  const context = readContext(ToggleGroupRootContext);

  if (!context) {
    throw new Error('ToggleGroup components must be used within <ToggleGroup>');
  }

  return context;
}

export function readToggleGroupRenderContext(): ToggleGroupRenderContextValue {
  const context = readContext(ToggleGroupRenderContext);

  if (!context) {
    throw new Error('ToggleGroupItem must be used within <ToggleGroup>');
  }

  return context;
}

export function createToggleGroupRenderContext(): ToggleGroupRenderContextValue {
  let itemIndex = 0;

  return {
    claimItemIndex: () => itemIndex++,
  };
}

export const ToggleGroupContext = ToggleGroupRootContext;
export type ToggleGroupContextValue = ToggleGroupRootContextValue;
export function readToggleGroupContext(): ToggleGroupRootContextValue {
  return readToggleGroupRootContext();
}
