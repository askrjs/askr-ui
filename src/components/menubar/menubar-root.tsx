import { cspNonce, getSignal, state } from '@askrjs/askr';
import { mergeProps } from '@askrjs/askr/foundations/utilities';
import { rovingFocus } from '../_internal/roving-focus';
import {
  focusCollectionItemWithRestore,
  restorePendingCollectionItemFocus,
  type PendingCollectionFocus,
} from '../_internal/focus';
import { VirtualCompositeOwnerContext } from '../_internal/virtual-composite';
import { resolveCompoundId, resolvePartId } from '../_internal/id';
import { observeCompositeCollection } from '../_internal/composite';
import { setDynamicStyleRule } from '../_internal/dynamic-style';
import {
  handleTypeaheadKeyDown,
  handleTypeaheadKeyUp,
  registerTypeaheadCleanup,
  resetTypeahead,
} from '../_internal/typeahead';
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
import { MenubarMenu } from './menubar-menu';

function assertUniqueMenubarMenuValues(children: unknown) {
  const values = new Set<string>();
  const visit = (child: unknown) => {
    if (Array.isArray(child)) {
      child.forEach(visit);
      return;
    }

    if (typeof child !== 'object' || child === null) return;
    const element = child as {
      type?: unknown;
      props?: { children?: unknown; value?: unknown };
    };
    if (
      element.type === MenubarMenu &&
      typeof element.props?.value === 'string'
    ) {
      if (values.has(element.props.value)) {
        throw new Error(
          `MenubarMenu values must be unique within <Menubar>; received duplicate value "${element.props.value}"`
        );
      }
      values.add(element.props.value);
    }
    visit(element.props?.children);
  };

  visit(children);
}

type MenubarPortalRegistry = {
  byKey: Map<string, MenubarPortalRecord>;
  claims: Map<string, number>;
  claimedSignals: WeakSet<AbortSignal>;
  nextOrdinal: number;
  syncQueued: boolean;
};

const menubarPortalRegistries = new WeakMap<object, MenubarPortalRegistry>();

function getMenubarPortalRegistry(identity: object) {
  const existing = menubarPortalRegistries.get(identity);

  if (existing) {
    return existing;
  }

  const created: MenubarPortalRegistry = {
    byKey: new Map(),
    claims: new Map(),
    claimedSignals: new WeakSet(),
    nextOrdinal: 0,
    syncQueued: false,
  };
  menubarPortalRegistries.set(identity, created);
  return created;
}

/**
 * Renders a part of `menubar`.
 */
export function Menubar(props: MenubarProps) {
  const { children, id, loop = true, ref, ...rest } = props;
  assertUniqueMenubarMenuValues(children);
  const nonce = cspNonce();
  setDynamicStyleRule(
    'menubar:structural-root',
    '[data-askr-menubar-root="true"]',
    { display: 'contents' },
    nonce
  );
  const generatedMenubarId = state(resolveCompoundId('menubar', id, children));
  const generatedMenubarIdValue = generatedMenubarId();
  const menubarId =
    id === undefined
      ? generatedMenubarIdValue
      : resolveCompoundId('menubar', id, children);
  const openPathState = state<string[]>([]);
  const currentTriggerIndexState = state(0);
  const pendingTriggerFocus = state<PendingCollectionFocus>({
    index: null,
  })();
  const identity = state<object>({})();
  const signal = getSignal();
  registerTypeaheadCleanup(identity, signal);
  const portalRegistry = getMenubarPortalRegistry(identity);
  const portalVersionState = state(0);
  portalVersionState();
  const setOpenPath = (path: string[]) => {
    if (path.length === 0) {
      resetTypeahead(identity);
    }
    openPathState.set(path);
  };
  const setCurrentTriggerIndex = (index: number) => {
    if (currentTriggerIndexState() !== index) {
      currentTriggerIndexState.set(index);
    }
  };
  const rootContextBase: MenubarRootStateInput = {
    menubarId,
    currentTriggerIndexCandidate: currentTriggerIndexState(),
  };
  const runtimeRenderContext = createMenubarRootRenderContext();
  const rootState = resolveMenubarRootState(rootContextBase);
  const collection = observeCompositeCollection(menubarId);
  const navigateToTrigger = (index: number) => {
    const liveState = resolveMenubarRootState({
      menubarId,
      currentTriggerIndexCandidate: currentTriggerIndexState(),
    });
    const menuKey = liveState.items.find(
      (item) => item.index === index
    )?.menuKey;
    setCurrentTriggerIndex(index);
    if (openPathState().length > 0 && menuKey) {
      openPathState.set([menuKey]);
    }
    queueMicrotask(() => {
      focusCollectionItemWithRestore(
        pendingTriggerFocus,
        collection,
        index,
        menuKey === undefined
          ? undefined
          : () =>
              document.getElementById(
                resolvePartId(menubarId, `trigger-${menuKey}`)
              )
      );
    });
  };
  const handleRootTypeaheadKeyDown = (event: KeyboardEvent) => {
    const liveState = resolveMenubarRootState({
      menubarId,
      currentTriggerIndexCandidate: currentTriggerIndexState(),
    });

    const currentItemIndex = liveState.items.findIndex(
      (item) => item.index === liveState.currentTriggerIndex
    );
    return handleTypeaheadKeyDown(identity, event, {
      currentIndex: currentItemIndex,
      items: liveState.items,
      onMatch: (matchIndex) => {
        const index = liveState.items[matchIndex]?.index;
        if (index !== undefined) navigateToTrigger(index);
      },
    });
  };
  const queuePortalSync = () => {
    if (portalRegistry.syncQueued) return;
    portalRegistry.syncQueued = true;
    queueMicrotask(() => {
      portalRegistry.syncQueued = false;
      if (!signal.aborted) {
        portalVersionState.set(portalVersionState() + 1);
      }
    });
  };
  const releaseMenuPortal = (menuKey: string) => {
    const claims = (portalRegistry.claims.get(menuKey) ?? 0) - 1;

    if (claims > 0) {
      portalRegistry.claims.set(menuKey, claims);
      return;
    }

    portalRegistry.claims.delete(menuKey);
    if (!portalRegistry.byKey.delete(menuKey)) return;
    if (openPathState()[0] === menuKey) {
      setOpenPath([]);
    }
    queuePortalSync();
  };
  const claimMenuPortal = (menuKey: string, menuSignal: AbortSignal) => {
    if (portalRegistry.claimedSignals.has(menuSignal)) return;
    portalRegistry.claimedSignals.add(menuSignal);
    portalRegistry.claims.set(
      menuKey,
      (portalRegistry.claims.get(menuKey) ?? 0) + 1
    );
    menuSignal.addEventListener(
      'abort',
      () => {
        releaseMenuPortal(menuKey);
      },
      { once: true }
    );
  };
  const ensureMenuPortal = (menuKey: string, menuSignal: AbortSignal) => {
    claimMenuPortal(menuKey, menuSignal);
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
    queuePortalSync();

    return created;
  };
  const rootContext: MenubarRootContextValue = {
    ...rootContextBase,
    ensureMenuPortal,
    openPath: openPathState(),
    getOpenPath: openPathState,
    setOpenPath,
    loop,
    setCurrentTriggerIndex,
    restoreTriggerFocus: (index, node) => {
      restorePendingCollectionItemFocus(pendingTriggerFocus, index, node);
    },
    focusTrigger: navigateToTrigger,
    resolvedState: rootState,
    handleTypeaheadKeyDown: handleRootTypeaheadKeyDown,
    handleTypeaheadKeyUp: (event) => handleTypeaheadKeyUp(identity, event),
  };
  for (const record of portalRegistry.byKey.values()) {
    captureOverlayNonce(record.identity, nonce);
  }
  const nav = rovingFocus({
    currentIndex: rootState.currentTriggerIndex,
    itemCount: Math.max(rootState.itemCount, 1),
    orientation: 'horizontal',
    loop,
    isDisabled: (index) => rootState.disabledTriggerIndexes.includes(index),
    onNavigate: navigateToTrigger,
  });
  const finalProps = mergeProps(rest, {
    ref,
    role: 'menubar',
    'data-slot': 'menubar',
    'data-menubar': 'true',
    onKeyDown: (event: KeyboardEvent) => {
      if (!handleRootTypeaheadKeyDown(event)) {
        nav.container.onKeyDown?.(event);
      }
    },
  });
  return (
    <MenubarRootContext value={rootContext}>
      <MenubarRootRenderContext value={runtimeRenderContext}>
        <VirtualCompositeOwnerContext value>
          <div data-askr-menubar-root="true">
            <div {...finalProps}>{children}</div>
            {
              Array.from(portalRegistry.byKey.entries()).map(
                ([menuKey, record]) => {
                  const PortalHost = getPersistentPortal(record.identity);
                  return (
                    <PortalHost
                      key={resolvePartId(
                        menubarId,
                        `portal-${record.ordinal}-${menuKey}`
                      )}
                    />
                  );
                }
              ) as unknown as JSX.Element
            }
          </div>
        </VirtualCompositeOwnerContext>
      </MenubarRootRenderContext>
    </MenubarRootContext>
  );
}
