import { getSignal, state } from '@askrjs/askr';
import { Presence, Slot } from '@askrjs/askr/foundations/structures';
import { composeRefs, mergeProps } from '@askrjs/askr/foundations/utilities';
import { rovingFocus } from '@askrjs/askr/foundations/interactions';
import { DismissableLayer } from '../dismissable-layer';
import { FocusScope } from '../focus-scope';
import {
  dismissPopupWithTab,
  focusCollectionItemWithRestore,
  restorePendingCollectionItemFocus,
  type PendingCollectionFocus,
} from '../_internal/focus';
import { pathIsOpen } from '../_internal/hierarchical-menu';
import {
  getCompositeCollection,
  observeCompositeCollection,
} from '../_internal/composite';
import {
  handleTypeaheadKeyDown,
  handleTypeaheadKeyUp,
  registerTypeaheadCleanup,
} from '../_internal/typeahead';
import {
  clearOverlayPosition,
  getOverlayNodes,
  OVERLAY_Z_INDEX,
  primeOverlayPosition,
  syncOverlayPosition,
} from '../_internal/overlay';
import {
  createMenubarContentRenderContext,
  MenubarContentContext,
  MenubarContentRenderContext,
  readOptionalMenubarRootContext,
  readMenubarSubContext,
  resolveMenubarContentOwner,
  resolveMenubarContentState,
  type MenubarContentContextValue,
} from './menubar.shared';
import type {
  MenubarContentAsChildProps,
  MenubarContentProps,
  MenubarSubContentAsChildProps,
  MenubarSubContentProps,
} from './menubar.types';
import { resolveTextDirection } from '../_internal/direction';

function renderMenubarSurfaceContent(
  props:
    | MenubarContentProps
    | MenubarContentAsChildProps
    | MenubarSubContentProps
    | MenubarSubContentAsChildProps,
  owner: {
    contentId: string;
    triggerId: string;
    overlayId: string;
    overlayIdentity: object;
    path: string[];
  }
) {
  const {
    asChild,
    children,
    forceMount = false,
    ref,
    side = 'bottom',
    align = 'start',
    sideOffset = 0,
    ...rest
  } = props;
  const currentIndexState = state(0);
  const typeaheadIdentity = state<object>({})();
  const pendingFocus = state<PendingCollectionFocus>({ index: null })();
  registerTypeaheadCleanup(typeaheadIdentity, getSignal());
  const setCurrentIndex = (index: number) => {
    if (currentIndexState() !== index) {
      currentIndexState.set(index);
    }
  };
  const collection = observeCompositeCollection(owner.contentId);
  const focusItem = (index: number) => {
    focusCollectionItemWithRestore(pendingFocus, collection, index);
  };
  function handleContentTypeaheadKeyDown(event: KeyboardEvent) {
    const liveState = resolveMenubarContentState(contentContext);

    return handleTypeaheadKeyDown(typeaheadIdentity, event, {
      currentIndex: liveState.currentIndex,
      items: liveState.items,
      onMatch: (index) => {
        contentContext.setCurrentIndex(index);
        contentContext.focusItem(index);
      },
    });
  }
  const contentContext: MenubarContentContextValue = {
    contentId: owner.contentId,
    triggerId: owner.triggerId,
    overlayId: owner.overlayId,
    overlayIdentity: owner.overlayIdentity,
    path: owner.path,
    currentIndexCandidate: currentIndexState(),
    setCurrentIndex,
    focusItem,
    restoreItemFocus: (index, node) => {
      restorePendingCollectionItemFocus(pendingFocus, index, node);
    },
    handleTypeaheadKeyDown: handleContentTypeaheadKeyDown,
    handleTypeaheadKeyUp: (event) =>
      handleTypeaheadKeyUp(typeaheadIdentity, event),
  };
  const runtimeRenderContext = createMenubarContentRenderContext();

  const root = readOptionalMenubarRootContext();

  if (!root) {
    return null;
  }

  const { items, currentIndex, disabledItemIndexes } =
    resolveMenubarContentState(contentContext);
  const open = pathIsOpen(root.openPath, contentContext.path);
  const overlayNodes = getOverlayNodes(contentContext.overlayIdentity);

  if (open) {
    primeOverlayPosition(
      contentContext.overlayIdentity,
      contentContext.overlayId,
      OVERLAY_Z_INDEX.dropdown
    );
  }

  const nav = rovingFocus({
    currentIndex,
    itemCount: Math.max(items.length, 1),
    orientation: 'vertical',
    loop: true,
    isDisabled: (index) => disabledItemIndexes.includes(index),
    onNavigate: (index) => {
      contentContext.setCurrentIndex(index);
      contentContext.focusItem(index);
    },
  });
  const setNode = (node: HTMLElement | null) => {
    overlayNodes.content = node;
    const ensureTriggerRegistered = () => {
      if (overlayNodes.trigger) {
        return overlayNodes.trigger;
      }

      const fallbackTrigger = document.getElementById(contentContext.triggerId);

      if (fallbackTrigger) {
        overlayNodes.trigger = fallbackTrigger as HTMLElement;
      }

      return overlayNodes.trigger;
    };

    const isOpen = () => pathIsOpen(root.getOpenPath(), contentContext.path);

    const syncPosition = (attempt = 0) => {
      if (!node || overlayNodes.content !== node || !node.isConnected) {
        clearOverlayPosition(contentContext.overlayIdentity);
        return;
      }

      if (!isOpen()) {
        clearOverlayPosition(contentContext.overlayIdentity);
        return;
      }

      ensureTriggerRegistered();

      syncOverlayPosition(
        contentContext.overlayIdentity,
        contentContext.overlayId,
        {
          side,
          align,
          sideOffset,
          zIndex: OVERLAY_Z_INDEX.dropdown,
        }
      );

      if (getComputedStyle(node).position === 'fixed') {
        return;
      }

      if (attempt >= 8) return;

      requestAnimationFrame(() => {
        syncPosition(attempt + 1);
      });
    };

    if (node && isOpen()) {
      queueMicrotask(() => {
        syncPosition(0);
      });
    } else {
      clearOverlayPosition(contentContext.overlayIdentity);
    }

    if (node && open) {
      queueMicrotask(() => {
        queueMicrotask(() => {
          if (
            document.getElementById(contentContext.contentId) !== node ||
            !node.isConnected ||
            node.contains(document.activeElement)
          ) {
            return;
          }

          const liveItems = collection.items();
          const target =
            liveItems.find(
              (item) =>
                item.metadata.index === currentIndex && !item.metadata.disabled
            ) ?? liveItems.find((item) => !item.metadata.disabled);

          target?.node.focus();
        });
      });
    }
  };
  const refHandler = ref
    ? composeRefs(
        ref as
          | ((value: HTMLElement | null) => void)
          | { current: HTMLElement | null }
          | null
          | undefined,
        setNode
      )
    : setNode;
  const finalProps = mergeProps(rest, {
    ref: refHandler,
    id: contentContext.contentId,
    role: 'menu',
    'aria-labelledby': contentContext.triggerId,
    'data-slot': 'menubar-content',
    'data-state': open ? 'open' : 'closed',
    'data-side': side,
    'data-align': align,
    'data-side-offset': String(sideOffset),
    'data-askr-overlay-id': open ? contentContext.overlayId : undefined,
    onKeyDown: (event: KeyboardEvent) => {
      if (contentContext.handleTypeaheadKeyDown(event)) {
        return;
      }

      nav.container.onKeyDown?.(event);

      if (event.defaultPrevented) {
        return;
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        root.setOpenPath(contentContext.path.slice(0, -1));
      }

      const closeKey =
        resolveTextDirection(event) === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
      if (event.key === closeKey && contentContext.path.length > 1) {
        event.preventDefault();
        root.setOpenPath(contentContext.path.slice(0, -1));
      }

      const rootTrigger = getCompositeCollection(root.menubarId)
        .items()
        .find((item) => item.metadata.value === contentContext.path[0])?.node;

      dismissPopupWithTab(
        event,
        rootTrigger ?? null,
        Array.from(
          document.querySelectorAll<HTMLElement>(
            '[data-slot="menubar-content"]'
          )
        ),
        () => {
          root.setOpenPath([]);
          queueMicrotask(root.syncPortals);
        }
      );
    },
  });
  return (
    <Presence present={forceMount || open}>
      <MenubarContentContext value={contentContext}>
        <MenubarContentRenderContext value={runtimeRenderContext}>
          <FocusScope restoreFocus>
            <DismissableLayer
              onDismiss={() => {
                root.setOpenPath(contentContext.path.slice(0, -1));
              }}
            >
              {asChild ? (
                <Slot
                  asChild
                  {...finalProps}
                  children={children as JSX.Element}
                />
              ) : (
                <div {...finalProps}>{children}</div>
              )}
            </DismissableLayer>
          </FocusScope>
        </MenubarContentRenderContext>
      </MenubarContentContext>
    </Presence>
  );
}

/**
 * Renders a part of `menubar`.
 */
export function MenubarContent(props: MenubarContentProps): JSX.Element | null;
export function MenubarContent(
  props: MenubarContentAsChildProps
): JSX.Element | null;
export function MenubarContent(
  props: MenubarContentProps | MenubarContentAsChildProps
) {
  return renderMenubarSurfaceContent(props, resolveMenubarContentOwner());
}

/**
 * Renders a part of `menubar`.
 */
export function MenubarSubContent(
  props: MenubarSubContentProps
): JSX.Element | null;
export function MenubarSubContent(
  props: MenubarSubContentAsChildProps
): JSX.Element | null;
export function MenubarSubContent(
  props: MenubarSubContentProps | MenubarSubContentAsChildProps
) {
  const sub = readMenubarSubContext();
  return renderMenubarSurfaceContent(props, {
    contentId: sub.contentId,
    triggerId: sub.triggerId,
    overlayId: sub.triggerId,
    overlayIdentity: sub.overlayIdentity,
    path: sub.path,
  });
}
