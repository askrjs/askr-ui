import { cspNonce, getSignal, state } from '@askrjs/askr';
import { mergeProps } from '@askrjs/askr/foundations/utilities';
import { rovingFocus } from '@askrjs/askr/foundations/interactions';
import { focusSelectedCollectionItem } from '../_internal/focus';
import { resolveCompoundId, resolvePartId } from '../_internal/id';
import { getCompositeCollection } from '../_internal/composite';
import {
  captureOverlayNonce,
  createOverlayIdentity,
  getPersistentPortal,
} from '../_internal/overlay';
import {
  createMenubarRootRenderContext,
  MenubarRootContext,
  MenubarRootRenderContext,
  resolveMenubarRootState,
  type MenubarRootStateInput,
  type MenubarRootContextValue,
  type MenubarPortalRecord,
} from './menubar.shared';
import type { MenubarProps } from './menubar.types';

type MenubarPortalRegistry = {
  activeKeys: Set<string>;
  byKey: Map<string, MenubarPortalRecord>;
  nextOrdinal: number;
};

const menubarPortalRegistries = new WeakMap<object, MenubarPortalRegistry>();

function getMenubarPortalRegistry(identity: object) {
  const existing = menubarPortalRegistries.get(identity);

  if (existing) {
    return existing;
  }

  const created: MenubarPortalRegistry = {
    activeKeys: new Set(),
    byKey: new Map(),
    nextOrdinal: 0,
  };
  menubarPortalRegistries.set(identity, created);
  return created;
}

export function Menubar(props: MenubarProps) {
  const { children, id, loop = true, ref, ...rest } = props;
  const nonce = cspNonce();
  const generatedMenubarId = state(resolveCompoundId('menubar', id, children));
  const generatedMenubarIdValue = generatedMenubarId();
  const menubarId =
    id === undefined
      ? generatedMenubarIdValue
      : resolveCompoundId('menubar', id, children);
  const openPathState = state<string[]>([]);
  const portalEpochState = state(0);
  const currentTriggerIndexState = state(0);
  const identity = state<object>({})();
  const portalRegistry = getMenubarPortalRegistry(identity);
  const renderedMenuKeys = new Set<string>();
  const setOpenPath = (path: string[]) => {
    openPathState.set(path);
  };
  const setCurrentTriggerIndex = (index: number) => {
    currentTriggerIndexState.set(index);
  };
  const rootContextBase: MenubarRootStateInput = {
    menubarId,
    currentTriggerIndexCandidate: currentTriggerIndexState(),
  };
  const runtimeRenderContext = createMenubarRootRenderContext();
  const rootState = resolveMenubarRootState(rootContextBase);
  const ensureMenuPortal = (menuKey: string) => {
    if (renderedMenuKeys.has(menuKey)) {
      throw new Error(
        `MenubarMenu values must be unique within <Menubar>; received duplicate value "${menuKey}"`
      );
    }

    renderedMenuKeys.add(menuKey);
    const existing = portalRegistry.byKey.get(menuKey);

    if (existing) {
      return existing;
    }

    const created: MenubarPortalRecord = {
      identity: createOverlayIdentity(),
      ordinal: portalRegistry.nextOrdinal,
    };
    portalRegistry.nextOrdinal += 1;
    portalRegistry.byKey.set(menuKey, created);
    captureOverlayNonce(created.identity, nonce);

    return created;
  };
  const rootContext: MenubarRootContextValue = {
    ...rootContextBase,
    ensureMenuPortal,
    openPath: openPathState(),
    getOpenPath: openPathState,
    setOpenPath,
    loop,
    portalEpoch: portalEpochState(),
    syncPortals: () => {
      portalEpochState.set(portalEpochState() + 1);
    },
    setCurrentTriggerIndex,
    resolvedState: rootState,
  };
  for (const record of portalRegistry.byKey.values()) {
    captureOverlayNonce(record.identity, nonce);
  }
  const collection = getCompositeCollection(menubarId);
  const nav = rovingFocus({
    currentIndex: rootState.currentTriggerIndex,
    itemCount: Math.max(rootState.items.length, 1),
    orientation: 'horizontal',
    loop,
    isDisabled: (index) => rootState.disabledTriggerIndexes.includes(index),
    onNavigate: (index) => {
      currentTriggerIndexState.set(index);
      focusSelectedCollectionItem(collection, index);
    },
  });
  const finalProps = mergeProps(rest, {
    ...nav.container,
    ref,
    role: 'menubar',
    'data-slot': 'menubar',
    'data-menubar': 'true',
  });
  const signal = getSignal();
  queueMicrotask(() => {
    if (signal.aborted) {
      return;
    }

    const activeKeys = portalRegistry.activeKeys;
    const activeKeysChanged =
      activeKeys.size !== renderedMenuKeys.size ||
      Array.from(activeKeys).some((key) => !renderedMenuKeys.has(key));

    if (activeKeysChanged) {
      portalRegistry.activeKeys = renderedMenuKeys;
      portalEpochState.set(portalEpochState() + 1);
    }
  });

  return (
    <MenubarRootContext value={rootContext}>
      <MenubarRootRenderContext value={runtimeRenderContext}>
        <div {...finalProps}>{children}</div>
        {
          Array.from(portalRegistry.activeKeys).map((menuKey) => {
            const record = portalRegistry.byKey.get(menuKey)!;
            const PortalHost = getPersistentPortal(record.identity);
            const portalId = resolvePartId(
              menubarId,
              `portal-${record.ordinal}`
            );

            return (
              <PortalHost
                key={`${menuKey}-${portalId}-${rootContext.portalEpoch}`}
              />
            );
          }) as unknown as JSX.Element
        }
      </MenubarRootRenderContext>
    </MenubarRootContext>
  );
}
