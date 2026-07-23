import { defineScope, readScope } from '@askrjs/askr';
import {
  disabledIndexes,
  firstEnabledCompositeIndex,
  getCompositeCollection,
  getCompositeCollectionItems,
} from '../_internal/composite';

export type MenubarTriggerMetadata = {
  index: number;
  disabled: boolean;
  menuKey?: string;
};

export type MenubarSurfaceMetadata = {
  index: number;
  disabled: boolean;
};

export type MenubarRootContextValue = {
  menubarId: string;
  portalIdentities: object[];
  openPath: string[];
  getOpenPath: () => string[];
  setOpenPath: (path: string[]) => void;
  loop: boolean;
  portalEpoch: number;
  syncPortals: () => void;
  currentTriggerIndexCandidate: number;
  setCurrentTriggerIndex: (index: number) => void;
  resolvedState: MenubarRootResolvedState;
};

export type MenubarRootStateInput = {
  menubarId: string;
  currentTriggerIndexCandidate: number;
};

export type MenubarRootRenderContextValue = {
  claimMenuIndex: () => number;
};

export type MenubarMenuContextValue = {
  menuKey: string;
  menuIndex: number;
  triggerId: string;
  contentId: string;
  portalId: string;
  overlayIdentity: object;
  path: string[];
};

export type MenubarContentContextValue = {
  contentId: string;
  triggerId: string;
  overlayId: string;
  overlayIdentity: object;
  path: string[];
  currentIndexCandidate: number;
  setCurrentIndex: (index: number) => void;
};

export type MenubarContentRenderContextValue = {
  claimSurfaceIndex: () => number;
};

export type MenubarSubContextValue = {
  surfaceIndex: number;
  triggerId: string;
  contentId: string;
  path: string[];
  overlayIdentity: object;
};

export type MenubarRootResolvedState = {
  items: MenubarTriggerMetadata[];
  currentTriggerIndex: number;
  disabledTriggerIndexes: number[];
};

export type MenubarContentResolvedState = {
  items: MenubarSurfaceMetadata[];
  currentIndex: number;
  disabledItemIndexes: number[];
};

export const MenubarRootContext = defineScope<MenubarRootContextValue | null>(
  null
);
export const MenubarRootRenderContext =
  defineScope<MenubarRootRenderContextValue | null>(null);
export const MenubarMenuContext = defineScope<MenubarMenuContextValue | null>(
  null
);
export const MenubarContentContext =
  defineScope<MenubarContentContextValue | null>(null);
export const MenubarContentRenderContext =
  defineScope<MenubarContentRenderContextValue | null>(null);
export const MenubarSubContext = defineScope<MenubarSubContextValue | null>(
  null
);

export function readMenubarRootContext(): MenubarRootContextValue {
  const context = readScope(MenubarRootContext);

  if (!context) {
    throw new Error('Menubar components must be used within <Menubar>');
  }

  return context;
}

export function readOptionalMenubarRootContext(): MenubarRootContextValue | null {
  return readScope(MenubarRootContext);
}

export function readMenubarRootRenderContext(): MenubarRootRenderContextValue {
  const context = readScope(MenubarRootRenderContext);

  if (!context) {
    throw new Error('MenubarMenu must be used within <Menubar>');
  }

  return context;
}

export function readMenubarMenuContext(): MenubarMenuContextValue {
  const context = readScope(MenubarMenuContext);

  if (!context) {
    throw new Error('Menubar menu parts must be used within <MenubarMenu>');
  }

  return context;
}

export function readMenubarContentContext(): MenubarContentContextValue {
  const context = readScope(MenubarContentContext);

  if (!context) {
    throw new Error('Menubar items must be used within content');
  }

  return context;
}

export function readMenubarContentRenderContext(): MenubarContentRenderContextValue {
  const context = readScope(MenubarContentRenderContext);

  if (!context) {
    throw new Error('Menubar items must be used within content');
  }

  return context;
}

export function readMenubarSubContext(): MenubarSubContextValue {
  const context = readScope(MenubarSubContext);

  if (!context) {
    throw new Error(
      'MenubarSubTrigger and MenubarSubContent must be used within <MenubarSub>'
    );
  }

  return context;
}

export function createMenubarRootRenderContext(): MenubarRootRenderContextValue {
  let nextMenuIndex = 0;

  return {
    claimMenuIndex: () => {
      const index = nextMenuIndex;
      nextMenuIndex += 1;
      return index;
    },
  };
}

export function createMenubarContentRenderContext(): MenubarContentRenderContextValue {
  let nextSurfaceIndex = 0;

  return {
    claimSurfaceIndex: () => {
      const index = nextSurfaceIndex;
      nextSurfaceIndex += 1;
      return index;
    },
  };
}

export function resolveMenubarRootState(
  root: MenubarRootStateInput
): MenubarRootResolvedState {
  const items = getCompositeCollectionItems(
    getCompositeCollection(root.menubarId)
  ).map((item) => ({
    index: item.index,
    disabled: item.disabled,
    menuKey: item.value,
  }));
  const fallbackIndex = firstEnabledCompositeIndex(items);
  const candidateIndex = root.currentTriggerIndexCandidate;
  const currentTriggerIndex =
    items[candidateIndex] && !items[candidateIndex]?.disabled
      ? candidateIndex
      : fallbackIndex;

  return {
    items,
    currentTriggerIndex,
    disabledTriggerIndexes: disabledIndexes(items),
  };
}

export function resolveMenubarContentState(
  content: MenubarContentContextValue
): MenubarContentResolvedState {
  const items = getCompositeCollectionItems(
    getCompositeCollection(content.contentId)
  ).map((item) => ({
    index: item.index,
    disabled: item.disabled,
  }));
  const fallbackIndex = firstEnabledCompositeIndex(items);
  const candidateIndex = content.currentIndexCandidate;
  const currentIndex =
    items[candidateIndex] && !items[candidateIndex]?.disabled
      ? candidateIndex
      : fallbackIndex;

  return {
    items,
    currentIndex,
    disabledItemIndexes: disabledIndexes(items),
  };
}

export function resolveMenubarContentOwner(): {
  contentId: string;
  triggerId: string;
  overlayId: string;
  overlayIdentity: object;
  path: string[];
} {
  const subContext = readScope(MenubarSubContext);

  if (subContext) {
    return {
      contentId: subContext.contentId,
      triggerId: subContext.triggerId,
      overlayId: subContext.triggerId,
      overlayIdentity: subContext.overlayIdentity,
      path: subContext.path,
    };
  }

  const menuContext = readScope(MenubarMenuContext);

  if (menuContext) {
    return {
      contentId: menuContext.contentId,
      triggerId: menuContext.triggerId,
      overlayId: menuContext.triggerId,
      overlayIdentity: menuContext.overlayIdentity,
      path: menuContext.path,
    };
  }

  throw new Error('Menubar content must be used within <MenubarMenu>');
}
