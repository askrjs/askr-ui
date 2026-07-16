import { defineScope, readScope } from '@askrjs/askr';
import {
  firstEnabledIndex,
  getMenuCollection,
  getMenuCollectionItems,
} from '../_internal/menu';
import type { OverlayPortal } from '../_internal/overlay';

export type SelectStateInput = {
  selectId: string;
  value: string;
  currentIndexCandidate: number;
  disabled: boolean;
  declaredItems: SelectItemMetadata[];
};

export type SelectItemMetadata = {
  disabled: boolean;
  value?: string;
  text: string;
};

export type SelectRootContextValue = {
  selectId: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  contentId: string;
  portal: OverlayPortal;
  value: string;
  setValue: (value: string) => void;
  currentIndexCandidate: number;
  setCurrentIndex: (index: number) => void;
  disabled: boolean;
  declaredItems: SelectItemMetadata[];
  resolvedState: SelectResolvedState;
};

export type SelectRenderContextValue = {
  claimItemIndex: () => number;
  claimGroupIndex: () => number;
};

export type SelectGroupContextValue = {
  groupId: string;
  labelId: string;
};

export type SelectResolvedState = {
  items: SelectItemMetadata[];
  currentIndex: number;
  selectedText: string;
  disabledIndexes: number[];
};

export const SelectRootContext = defineScope<SelectRootContextValue | null>(
  null
);
export const SelectRenderContext =
  defineScope<SelectRenderContextValue | null>(null);
export const SelectGroupContext = defineScope<SelectGroupContextValue | null>(
  null
);

export function readSelectRootContext(): SelectRootContextValue {
  const context = readScope(SelectRootContext);

  if (!context) {
    throw new Error('Select components must be used within <Select>');
  }

  return context;
}

export function readSelectRenderContext(): SelectRenderContextValue {
  const context = readScope(SelectRenderContext);

  if (!context) {
    throw new Error('Select items and groups must be used within <Select>');
  }

  return context;
}

export function readSelectGroupContext(): SelectGroupContextValue | null {
  return readScope(SelectGroupContext);
}

export function createSelectRenderContext(): SelectRenderContextValue {
  let nextItemIndex = 0;
  let nextGroupIndex = 0;

  return {
    claimItemIndex: () => {
      const index = nextItemIndex;
      nextItemIndex += 1;
      return index;
    },
    claimGroupIndex: () => {
      const index = nextGroupIndex;
      nextGroupIndex += 1;
      return index;
    },
  };
}

export function getSelectDisabledIndexes(
  items: SelectItemMetadata[],
  disabled: boolean
): number[] {
  return items
    .map((item, index) => (disabled || item.disabled ? index : -1))
    .filter((index) => index !== -1);
}

export function resolveSelectState(
  root: SelectStateInput
): SelectResolvedState {
  const registeredItems = getMenuCollectionItems(
    getMenuCollection(root.selectId)
  ).map((item) => ({
    disabled: item.disabled,
    value: item.value,
    text: item.text,
  }));
  const items =
    registeredItems.length > 0 ? registeredItems : root.declaredItems;
  const effectiveItems = items.map((item) => ({
    disabled: root.disabled || item.disabled,
  }));
  const selectedIndex = items.findIndex((item) => item.value === root.value);
  const fallbackIndex = firstEnabledIndex(effectiveItems);
  const allItemsDisabled =
    items.length > 0 && effectiveItems.every((item) => item.disabled);
  const candidateIndex = root.currentIndexCandidate;
  const currentIndex =
    selectedIndex >= 0 && !effectiveItems[selectedIndex]?.disabled
      ? selectedIndex
      : effectiveItems[candidateIndex] &&
          !effectiveItems[candidateIndex]?.disabled
        ? candidateIndex
        : allItemsDisabled
          ? -1
          : fallbackIndex;

  return {
    items,
    currentIndex,
    selectedText: items.find((item) => item.value === root.value)?.text ?? '',
    disabledIndexes: getSelectDisabledIndexes(items, root.disabled),
  };
}
