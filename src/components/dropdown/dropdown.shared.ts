import { defineScope, readScope } from '@askrjs/askr';
import {
  firstEnabledIndex,
  getMenuCollection,
  getMenuCollectionItems,
  type MenuItemMetadata,
} from '../_internal/menu';
import type { OverlayPortal } from '../_internal/overlay';

export type DropdownStateInput = {
  dropdownId: string;
  currentIndexCandidate: number;
};

export type DropdownRootContextValue = {
  dropdownId: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  contentId: string;
  portal: OverlayPortal;
  currentIndexCandidate: number;
  setCurrentIndex: (index: number) => void;
  resolvedState: DropdownResolvedState;
};

export type DropdownRenderContextValue = {
  claimItemIndex: () => number;
};

export type DropdownResolvedState = {
  items: MenuItemMetadata[];
  currentIndex: number;
  disabledIndexes: number[];
};

export const DropdownRootContext =
  defineScope<DropdownRootContextValue | null>(null);
export const DropdownRenderContext =
  defineScope<DropdownRenderContextValue | null>(null);

export function readDropdownRootContext(): DropdownRootContextValue {
  const context = readScope(DropdownRootContext);

  if (!context) {
    throw new Error('Dropdown components must be used within <Dropdown>');
  }

  return context;
}

export function readDropdownRenderContext(): DropdownRenderContextValue {
  const context = readScope(DropdownRenderContext);

  if (!context) {
    throw new Error('DropdownItem must be used within <Dropdown>');
  }

  return context;
}

export function createDropdownRenderContext(): DropdownRenderContextValue {
  let nextItemIndex = 0;

  return {
    claimItemIndex: () => {
      const index = nextItemIndex;
      nextItemIndex += 1;
      return index;
    },
  };
}

export function resolveDropdownState(
  root: DropdownStateInput
): DropdownResolvedState {
  const items = getMenuCollectionItems(getMenuCollection(root.dropdownId));
  const fallbackIndex = firstEnabledIndex(items);
  const allItemsDisabled =
    items.length > 0 && items.every((item) => item.disabled);
  const candidateIndex = root.currentIndexCandidate;
  const currentIndex =
    items[candidateIndex] && !items[candidateIndex]?.disabled
      ? candidateIndex
      : allItemsDisabled
        ? -1
        : fallbackIndex;

  return {
    items,
    currentIndex,
    disabledIndexes: items
      .map((item, index) => (item.disabled ? index : -1))
      .filter((index) => index !== -1),
  };
}
