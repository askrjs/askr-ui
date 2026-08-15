import { defineScope, readScope } from '@askrjs/askr';
import {
  firstEnabledIndex,
  getMenuCollection,
  getMenuCollectionItems,
  type MenuItemMetadata,
} from '../_internal/menu';
import type { OverlayPortal } from '../_internal/overlay';

/** Dropdown State Input. */
export type DropdownStateInput = {
  dropdownId: string;
  currentIndexCandidate: number;
};

/** Shape of the Dropdown Root Context Value. */
export type DropdownRootContextValue = {
  dropdownId: string;
  overlayIdentity: object;
  open: boolean;
  setOpen: (open: boolean) => void;
  contentId: string;
  portal: OverlayPortal;
  currentIndexCandidate: number;
  setCurrentIndex: (index: number) => void;
  focusItem: (index: number) => void;
  restoreItemFocus: (index: number, node: HTMLElement | null) => void;
  resolvedState: DropdownResolvedState;
  handleTypeaheadKeyDown: (event: KeyboardEvent) => boolean;
  handleTypeaheadKeyUp: (event: KeyboardEvent) => boolean;
};

/** Shape of the Dropdown Render Context Value. */
export type DropdownRenderContextValue = {
  claimItemIndex: () => number;
};

/** Dropdown Resolved State. */
export type DropdownResolvedState = {
  items: MenuItemMetadata[];
  currentIndex: number;
  disabledIndexes: number[];
};

export const DropdownRootContext = defineScope<DropdownRootContextValue | null>(
  null
);
export const DropdownRenderContext =
  defineScope<DropdownRenderContextValue | null>(null);

/**
 * Reads the Dropdown Root Context; throws if called outside its provider.
 */
export function readDropdownRootContext(): DropdownRootContextValue {
  const context = readScope(DropdownRootContext);

  if (!context) {
    throw new Error('Dropdown components must be used within <Dropdown>');
  }

  return context;
}

/**
 * Reads the Dropdown Render Context; throws if called outside its provider.
 */
export function readDropdownRenderContext(): DropdownRenderContextValue {
  const context = readScope(DropdownRenderContext);

  if (!context) {
    throw new Error('DropdownItem must be used within <Dropdown>');
  }

  return context;
}

/**
 * Creates a fresh Dropdown Render Context instance.
 */
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

/**
 * Computes the resolved Dropdown State (collection items, current index,
 * and disabled indexes) from root context input.
 */
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
