import { defineScope, readScope } from '@askrjs/askr';
import type { ToggleGroupOrientation } from './toggle-group.types';

/** Toggle Group Root Item. */
export type ToggleGroupRootItem = {
  value: string;
  disabled: boolean;
};

/** Shape of the Toggle Group Root Context Value. */
export type ToggleGroupRootContextValue = {
  groupId: string;
  type: 'single' | 'multiple';
  value: string | string[];
  getValue: () => string | string[];
  setValue: (value: string | string[]) => void;
  notifyItemsChanged: () => void;
  scheduleItemsSync: () => void;
  orientation: ToggleGroupOrientation;
  loop: boolean;
  disabled: boolean;
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  items: ToggleGroupRootItem[];
  disabledItemIndexes: number[];
};

/** Shape of the Toggle Group Render Context Value. */
export type ToggleGroupRenderContextValue = {
  claimItemIndex: () => number;
};

export const ToggleGroupRootContext =
  defineScope<ToggleGroupRootContextValue | null>(null);

export const ToggleGroupRenderContext =
  defineScope<ToggleGroupRenderContextValue | null>(null);

/**
 * Reads the Toggle Group Root Context; throws if called outside its provider.
 */
export function readToggleGroupRootContext(): ToggleGroupRootContextValue {
  const context = readScope(ToggleGroupRootContext);

  if (!context) {
    throw new Error('ToggleGroup components must be used within <ToggleGroup>');
  }

  return context;
}

/**
 * Reads the Toggle Group Render Context; throws if called outside its provider.
 */
export function readToggleGroupRenderContext(): ToggleGroupRenderContextValue {
  const context = readScope(ToggleGroupRenderContext);

  if (!context) {
    throw new Error('ToggleGroupItem must be used within <ToggleGroup>');
  }

  return context;
}

/**
 * Creates a fresh Toggle Group Render Context instance.
 */
export function createToggleGroupRenderContext(): ToggleGroupRenderContextValue {
  let itemIndex = 0;

  return {
    claimItemIndex: () => itemIndex++,
  };
}

export const ToggleGroupContext = ToggleGroupRootContext;
/** Shape of the Toggle Group Context Value. */
export type ToggleGroupContextValue = ToggleGroupRootContextValue;
/**
 * Reads the Toggle Group Context; throws if called outside its provider.
 */
export function readToggleGroupContext(): ToggleGroupRootContextValue {
  return readToggleGroupRootContext();
}
