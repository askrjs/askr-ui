import { defineContext, readContext } from '@askrjs/askr';
import {
  disabledIndexes,
  firstEnabledCompositeIndex,
} from '../../_internal/composite';

export type MenubarTriggerMetadata = {
  index: number;
  disabled: boolean;
  menuKey: string;
  triggerId: string;
  contentId: string;
  portalId: string;
};

export type MenubarSurfaceMetadata = {
  index: number;
  disabled: boolean;
};

const menubarTriggerMetadata = new Map<string, MenubarTriggerMetadata[]>();
const menubarSurfaceMetadata = new Map<string, MenubarSurfaceMetadata[]>();

export type MenubarRootContextValue = {
  menubarId: string;
  openPath: string[];
  setOpenPath: (path: string[]) => void;
  loop: boolean;
  portalEpoch: number;
  syncPortals: () => void;
  currentTriggerIndexCandidate: number;
  setCurrentTriggerIndex: (index: number) => void;
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
  path: string[];
};

export type MenubarContentContextValue = {
  contentId: string;
  triggerId: string;
  overlayId: string;
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

export const MenubarRootContext = defineContext<MenubarRootContextValue | null>(
  null
);
export const MenubarRootRenderContext =
  defineContext<MenubarRootRenderContextValue | null>(null);
export const MenubarMenuContext = defineContext<MenubarMenuContextValue | null>(
  null
);
export const MenubarContentContext =
  defineContext<MenubarContentContextValue | null>(null);
export const MenubarContentRenderContext =
  defineContext<MenubarContentRenderContextValue | null>(null);
export const MenubarSubContext = defineContext<MenubarSubContextValue | null>(
  null
);
export const MenubarDeclarationContext = defineContext<boolean>(false);

export function beginMenubarTriggerDeclaration(menubarId: string) {
  menubarTriggerMetadata.set(menubarId, []);
}

export function declareMenubarTriggerMetadata(
  menubarId: string,
  metadata: MenubarTriggerMetadata
) {
  const items = menubarTriggerMetadata.get(menubarId) ?? [];
  items[metadata.index] = metadata;
  menubarTriggerMetadata.set(menubarId, items);
}

export function getMenubarTriggerMetadata(menubarId: string) {
  return (menubarTriggerMetadata.get(menubarId) ?? []).filter(Boolean);
}

export function beginMenubarSurfaceDeclaration(contentId: string) {
  menubarSurfaceMetadata.set(contentId, []);
}

export function declareMenubarSurfaceMetadata(
  contentId: string,
  metadata: MenubarSurfaceMetadata
) {
  const items = menubarSurfaceMetadata.get(contentId) ?? [];
  items[metadata.index] = metadata;
  menubarSurfaceMetadata.set(contentId, items);
}

export function getMenubarSurfaceMetadata(contentId: string) {
  return (menubarSurfaceMetadata.get(contentId) ?? []).filter(Boolean);
}

export function readMenubarRootContext(): MenubarRootContextValue {
  const context = readContext(MenubarRootContext);

  if (!context) {
    throw new Error('Menubar components must be used within <Menubar>');
  }

  return context;
}

export function readOptionalMenubarRootContext(): MenubarRootContextValue | null {
  return readContext(MenubarRootContext);
}

export function readMenubarRootRenderContext(): MenubarRootRenderContextValue {
  const context = readContext(MenubarRootRenderContext);

  if (!context) {
    throw new Error('MenubarMenu must be used within <Menubar>');
  }

  return context;
}

export function readMenubarMenuContext(): MenubarMenuContextValue {
  const context = readContext(MenubarMenuContext);

  if (!context) {
    throw new Error('Menubar menu parts must be used within <MenubarMenu>');
  }

  return context;
}

export function readMenubarContentContext(): MenubarContentContextValue {
  const context = readContext(MenubarContentContext);

  if (!context) {
    throw new Error('Menubar items must be used within content');
  }

  return context;
}

export function readMenubarContentRenderContext(): MenubarContentRenderContextValue {
  const context = readContext(MenubarContentRenderContext);

  if (!context) {
    throw new Error('Menubar items must be used within content');
  }

  return context;
}

export function readMenubarSubContext(): MenubarSubContextValue {
  const context = readContext(MenubarSubContext);

  if (!context) {
    throw new Error(
      'MenubarSubTrigger and MenubarSubContent must be used within <MenubarSub>'
    );
  }

  return context;
}

export function readMenubarDeclarationContext(): boolean {
  return Boolean(readContext(MenubarDeclarationContext));
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
  root: MenubarRootContextValue
): MenubarRootResolvedState {
  const items = getMenubarTriggerMetadata(root.menubarId);
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
  const items = getMenubarSurfaceMetadata(content.contentId);
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
  path: string[];
} {
  const subContext = readContext(MenubarSubContext);

  if (subContext) {
    return {
      contentId: subContext.contentId,
      triggerId: subContext.triggerId,
      overlayId: subContext.triggerId,
      path: subContext.path,
    };
  }

  const menuContext = readContext(MenubarMenuContext);

  if (menuContext) {
    return {
      contentId: menuContext.contentId,
      triggerId: menuContext.triggerId,
      overlayId: menuContext.triggerId,
      path: menuContext.path,
    };
  }

  throw new Error('Menubar content must be used within <MenubarMenu>');
}
