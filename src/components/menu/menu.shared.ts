import { defineScope, readScope } from '@askrjs/askr';
import type { RovingFocusResult } from '@askrjs/askr/foundations/interactions';
import {
  firstEnabledIndex,
  getMenuCollection,
  getMenuCollectionItems,
  type MenuItemMetadata,
} from '../_internal/menu';
import type { MenuOwnProps } from './menu.types';

/** Menu State Input. */
export type MenuStateInput = {
  menuId: string;
  currentIndexCandidate: number;
};

/** Shape of the Menu Root Context Value. */
export type MenuRootContextValue = {
  menuId: string;
  orientation: MenuOwnProps['orientation'];
  loop: boolean;
  currentIndexCandidate: number;
  setCurrentIndex: (index: number) => void;
  resolvedState: MenuResolvedState;
  navigation: RovingFocusResult;
  handleTypeaheadKeyDown: (event: KeyboardEvent) => boolean;
  handleTypeaheadKeyUp: (event: KeyboardEvent) => boolean;
};

/** Shape of the Menu Render Context Value. */
export type MenuRenderContextValue = {
  claimItemIndex: () => number;
};

/** Menu Resolved State. */
export type MenuResolvedState = {
  items: MenuItemMetadata[];
  currentIndex: number;
  disabledIndexes: number[];
};

export const MenuRootContext = defineScope<MenuRootContextValue | null>(null);
export const MenuRenderContext = defineScope<MenuRenderContextValue | null>(
  null
);

/**
 * Reads the Menu Root Context; throws if called outside its provider.
 */
export function readMenuRootContext(): MenuRootContextValue {
  const context = readScope(MenuRootContext);

  if (!context) {
    throw new Error('Menu components must be used within <Menu>');
  }

  return context;
}

/**
 * Reads the Menu Render Context; throws if called outside its provider.
 */
export function readMenuRenderContext(): MenuRenderContextValue {
  const context = readScope(MenuRenderContext);

  if (!context) {
    throw new Error('MenuItem must be used within <Menu>');
  }

  return context;
}

/**
 * Creates a fresh Menu Render Context instance.
 */
export function createMenuRenderContext(): MenuRenderContextValue {
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
 * Computes the resolved Menu State (collection items, current index,
 * and disabled indexes) from root context input.
 */
export function resolveMenuState(root: MenuStateInput): MenuResolvedState {
  const items = getMenuCollectionItems(getMenuCollection(root.menuId));
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
