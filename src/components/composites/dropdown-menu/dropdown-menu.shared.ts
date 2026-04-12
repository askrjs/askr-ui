import { defineContext, readContext } from '@askrjs/askr';
import {
  firstEnabledIndex,
  getMenuItemMetadata,
  type MenuItemMetadata,
} from '../../_internal/menu';
import type { OverlayPortal } from '../../_internal/overlay';

export type DropdownMenuRootContextValue = {
  dropdownMenuId: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  contentId: string;
  portal: OverlayPortal;
  currentIndexCandidate: number;
  setCurrentIndex: (index: number) => void;
};

export type DropdownMenuRenderContextValue = {
  claimItemIndex: () => number;
};

export type DropdownMenuResolvedState = {
  items: MenuItemMetadata[];
  currentIndex: number;
  disabledIndexes: number[];
};

export const DropdownMenuRootContext =
  defineContext<DropdownMenuRootContextValue | null>(null);
export const DropdownMenuRenderContext =
  defineContext<DropdownMenuRenderContextValue | null>(null);
export const DropdownMenuDeclarationContext = defineContext<boolean>(false);

export function readDropdownMenuRootContext(): DropdownMenuRootContextValue {
  const context = readContext(DropdownMenuRootContext);

  if (!context) {
    throw new Error(
      'DropdownMenu components must be used within <DropdownMenu>'
    );
  }

  return context;
}

export function readDropdownMenuRenderContext(): DropdownMenuRenderContextValue {
  const context = readContext(DropdownMenuRenderContext);

  if (!context) {
    throw new Error('DropdownMenuItem must be used within <DropdownMenu>');
  }

  return context;
}

export function readDropdownMenuDeclarationContext(): boolean {
  return Boolean(readContext(DropdownMenuDeclarationContext));
}

export function createDropdownMenuRenderContext(): DropdownMenuRenderContextValue {
  let nextItemIndex = 0;

  return {
    claimItemIndex: () => {
      const index = nextItemIndex;
      nextItemIndex += 1;
      return index;
    },
  };
}

export function resolveDropdownMenuState(
  root: DropdownMenuRootContextValue
): DropdownMenuResolvedState {
  const items = getMenuItemMetadata(root.dropdownMenuId);
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
