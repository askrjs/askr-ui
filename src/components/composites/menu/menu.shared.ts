import { defineContext, readContext } from '@askrjs/askr';
import {
  firstEnabledIndex,
  getMenuCollection,
  getMenuCollectionItems,
  type MenuItemMetadata,
} from '../../_internal/menu';
import type { MenuOwnProps } from './menu.types';

export type MenuRootContextValue = {
  menuId: string;
  orientation: MenuOwnProps['orientation'];
  loop: boolean;
  currentIndexCandidate: number;
  setCurrentIndex: (index: number) => void;
};

export type MenuRenderContextValue = {
  claimItemIndex: () => number;
};

export type MenuResolvedState = {
  items: MenuItemMetadata[];
  currentIndex: number;
  disabledIndexes: number[];
};

export const MenuRootContext = defineContext<MenuRootContextValue | null>(null);
export const MenuRenderContext = defineContext<MenuRenderContextValue | null>(
  null
);

export function readMenuRootContext(): MenuRootContextValue {
  const context = readContext(MenuRootContext);

  if (!context) {
    throw new Error('Menu components must be used within <Menu>');
  }

  return context;
}

export function readMenuRenderContext(): MenuRenderContextValue {
  const context = readContext(MenuRenderContext);

  if (!context) {
    throw new Error('MenuItem must be used within <Menu>');
  }

  return context;
}

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

export function resolveMenuState(
  root: MenuRootContextValue
): MenuResolvedState {
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
