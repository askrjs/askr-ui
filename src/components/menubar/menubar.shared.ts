import { defineScope, readScope } from '@askrjs/askr';
import {
  disabledIndexes,
  firstEnabledCompositeIndex,
  getCompositeCollection,
  getCompositeCollectionItems,
} from '../_internal/composite';

/** Menubar Trigger Metadata. */
export type MenubarTriggerMetadata = {
  index: number;
  disabled: boolean;
  menuKey?: string;
  text: string;
};

/** Menubar Surface Metadata. */
export type MenubarSurfaceMetadata = {
  index: number;
  disabled: boolean;
  text: string;
};

/** Shape of the Menubar Root Context Value. */
export type MenubarRootContextValue = {
  menubarId: string;
  ensureMenuPortal: (menuKey: string) => MenubarPortalRecord;
  openPath: string[];
  getOpenPath: () => string[];
  setOpenPath: (path: string[]) => void;
  loop: boolean;
  portalEpoch: number;
  syncPortals: () => void;
  currentTriggerIndexCandidate: number;
  setCurrentTriggerIndex: (index: number) => void;
  restoreTriggerFocus: (index: number, node: HTMLElement | null) => void;
  resolvedState: MenubarRootResolvedState;
  handleTypeaheadKeyDown: (event: KeyboardEvent) => boolean;
  handleTypeaheadKeyUp: (event: KeyboardEvent) => boolean;
};

/** Menubar Portal Record. */
export type MenubarPortalRecord = {
  identity: object;
  ordinal: number;
};

/** Menubar Root State Input. */
export type MenubarRootStateInput = {
  menubarId: string;
  currentTriggerIndexCandidate: number;
};

/** Shape of the Menubar Root Render Context Value. */
export type MenubarRootRenderContextValue = {
  claimMenuIndex: () => number;
};

/** Shape of the Menubar Menu Context Value. */
export type MenubarMenuContextValue = {
  menuKey: string;
  menuIndex: number;
  triggerId: string;
  contentId: string;
  portalId: string;
  overlayIdentity: object;
  path: string[];
};

/** Shape of the Menubar Content Context Value. */
export type MenubarContentContextValue = {
  contentId: string;
  triggerId: string;
  overlayId: string;
  overlayIdentity: object;
  path: string[];
  currentIndexCandidate: number;
  setCurrentIndex: (index: number) => void;
  focusItem: (index: number) => void;
  restoreItemFocus: (index: number, node: HTMLElement | null) => void;
  handleTypeaheadKeyDown: (event: KeyboardEvent) => boolean;
  handleTypeaheadKeyUp: (event: KeyboardEvent) => boolean;
};

/** Shape of the Menubar Content Render Context Value. */
export type MenubarContentRenderContextValue = {
  claimSurfaceIndex: () => number;
};

/** Shape of the Menubar Sub Context Value. */
export type MenubarSubContextValue = {
  surfaceIndex: number;
  triggerId: string;
  contentId: string;
  path: string[];
  overlayIdentity: object;
};

/** Menubar Root Resolved State. */
export type MenubarRootResolvedState = {
  items: MenubarTriggerMetadata[];
  currentTriggerIndex: number;
  disabledTriggerIndexes: number[];
};

/** Menubar Content Resolved State. */
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

/**
 * Reads the Menubar Root Context; throws if called outside its provider.
 */
export function readMenubarRootContext(): MenubarRootContextValue {
  const context = readScope(MenubarRootContext);

  if (!context) {
    throw new Error('Menubar components must be used within <Menubar>');
  }

  return context;
}

/**
 * Reads the Optional Menubar Root Context; throws if called outside its provider.
 */
export function readOptionalMenubarRootContext(): MenubarRootContextValue | null {
  return readScope(MenubarRootContext);
}

/**
 * Reads the Menubar Root Render Context; throws if called outside its provider.
 */
export function readMenubarRootRenderContext(): MenubarRootRenderContextValue {
  const context = readScope(MenubarRootRenderContext);

  if (!context) {
    throw new Error('MenubarMenu must be used within <Menubar>');
  }

  return context;
}

/**
 * Reads the Menubar Menu Context; throws if called outside its provider.
 */
export function readMenubarMenuContext(): MenubarMenuContextValue {
  const context = readScope(MenubarMenuContext);

  if (!context) {
    throw new Error('Menubar menu parts must be used within <MenubarMenu>');
  }

  return context;
}

/**
 * Reads the Menubar Content Context; throws if called outside its provider.
 */
export function readMenubarContentContext(): MenubarContentContextValue {
  const context = readScope(MenubarContentContext);

  if (!context) {
    throw new Error('Menubar items must be used within content');
  }

  return context;
}

/**
 * Reads the Menubar Content Render Context; throws if called outside its provider.
 */
export function readMenubarContentRenderContext(): MenubarContentRenderContextValue {
  const context = readScope(MenubarContentRenderContext);

  if (!context) {
    throw new Error('Menubar items must be used within content');
  }

  return context;
}

/**
 * Reads the Menubar Sub Context; throws if called outside its provider.
 */
export function readMenubarSubContext(): MenubarSubContextValue {
  const context = readScope(MenubarSubContext);

  if (!context) {
    throw new Error(
      'MenubarSubTrigger and MenubarSubContent must be used within <MenubarSub>'
    );
  }

  return context;
}

/**
 * Creates a fresh Menubar Root Render Context instance.
 */
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

/**
 * Creates a fresh Menubar Content Render Context instance.
 */
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

/**
 * Computes the resolved Menubar Root State (collection items, current index,
 * and disabled indexes) from root context input.
 */
export function resolveMenubarRootState(
  root: MenubarRootStateInput
): MenubarRootResolvedState {
  const items = getCompositeCollectionItems(
    getCompositeCollection(root.menubarId)
  ).map((item) => ({
    index: item.index,
    disabled: item.disabled,
    menuKey: item.value,
    text: item.text ?? '',
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

/**
 * Computes the resolved Menubar Content State (collection items, current index,
 * and disabled indexes) from root context input.
 */
export function resolveMenubarContentState(
  content: MenubarContentContextValue
): MenubarContentResolvedState {
  const items = getCompositeCollectionItems(
    getCompositeCollection(content.contentId)
  ).map((item) => ({
    index: item.index,
    disabled: item.disabled,
    text: item.text ?? '',
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

/**
 * Resolves the owning element for Menubar Content Owner.
 */
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
