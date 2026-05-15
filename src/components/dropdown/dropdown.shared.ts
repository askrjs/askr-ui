import { defineContext, readContext } from '@askrjs/askr';
import {
  firstEnabledIndex,
  getMenuCollection,
  getMenuCollectionItems,
  type MenuItemMetadata,
} from '../_internal/menu';
import type { OverlayPortal } from '../_internal/overlay';

export type DropdownRootContextValue = {
  dropdownId: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  contentId: string;
  portal: OverlayPortal;
  currentIndexCandidate: number;
  setCurrentIndex: (index: number) => void;
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
  defineContext<DropdownRootContextValue | null>(null);
export const DropdownRenderContext =
  defineContext<DropdownRenderContextValue | null>(null);

export function readDropdownRootContext(): DropdownRootContextValue {
  const context = readContext(DropdownRootContext);

  if (!context) {
    throw new Error('Dropdown components must be used within <Dropdown>');
  }

  return context;
}

export function readDropdownRenderContext(): DropdownRenderContextValue {
  const context = readContext(DropdownRenderContext);

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
  root: DropdownRootContextValue
): DropdownResolvedState {
  const items = getMenuCollectionItems(getMenuCollection(root.dropdownId));
  const fallbackIndex = firstEnabledIndex(items);
  const candidateIndex = root.currentIndexCandidate;
  const currentIndex =
    items[candidateIndex] && !items[candidateIndex]?.disabled
      ? candidateIndex
      : fallbackIndex;

  return {
    items,
    currentIndex,
    disabledIndexes: items
      .map((item, index) => (item.disabled ? index : -1))
      .filter((index) => index !== -1),
  };
}
