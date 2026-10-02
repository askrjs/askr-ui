import { controllableState } from '@askrjs/askr/foundations/state';
import { cspNonce, getSignal, state } from '@askrjs/askr';
import { watch } from '@askrjs/askr/resources';
import { resolveCompoundId, resolvePartId } from '../_internal/id';
import {
  captureOverlayNonce,
  clearOverlayPosition,
  createOverlayIdentity,
  getOverlayNodes,
  getPersistentPortal,
  registerOverlayNode,
  syncOverlayStackActive,
  syncOverlayPosition,
} from '../_internal/overlay';
import {
  HoverCardRootContext,
  resolveHoverCardPositionOptions,
  type HoverCardPositionOptions,
  type HoverCardRootContextValue,
} from './hover-card.shared';
import type { HoverCardProps } from './hover-card.types';
import { OverlayPortalHost } from '../_internal/overlay-portal-host';
import { syncIdAssociation } from '../_internal/id-association';
import {
  createSsrIdRegistration,
  ssrAttributeRootProps,
  type SsrIdRegistration,
} from '../_internal/ssr-id-association';

function scheduleHoverCardPortalSync(callback: () => void) {
  queueMicrotask(callback);
}

/**
 * Renders a part of `hover-card`.
 */
export function HoverCard(props: HoverCardProps) {
  const {
    children,
    id,
    open,
    defaultOpen = false,
    onOpenChange,
    openDelay = 0,
    closeDelay = 90,
  } = props;
  const openState = controllableState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const hoverCardId = resolveCompoundId('hover-card', id, children);
  const overlayIdentity = state(createOverlayIdentity())();
  const cleanupSignal = getSignal();
  syncOverlayStackActive(overlayIdentity, openState(), cleanupSignal);
  const focusEntry = state({
    restoreTrigger: false,
    restoreFrame: null as number | null,
    restoreWindow: null as Window | null,
    restoreGeneration: 0,
  })();
  const pointerEntry = state({
    document: null as Document | null,
    handler: null as ((event: PointerEvent) => void) | null,
    sync: null as ((event: PointerEvent) => void) | null,
  })();
  captureOverlayNonce(overlayIdentity, cspNonce());
  const triggerId = resolvePartId(hoverCardId, 'trigger');
  const contentId = resolvePartId(hoverCardId, 'content');
  const ssrTrigger = state(createSsrIdRegistration(triggerId))();
  const ssrContent = state(createSsrIdRegistration(contentId))();
  const portal = getPersistentPortal(overlayIdentity);
  const overlayNodes = getOverlayNodes(overlayIdentity);
  const associations = state({ controls: true, label: true })();
  const syncAssociations = () => {
    syncIdAssociation(
      overlayNodes.trigger,
      overlayNodes.content,
      'aria-controls',
      associations.controls
    );
    syncIdAssociation(
      overlayNodes.content,
      overlayNodes.trigger,
      'aria-labelledby',
      associations.label
    );
  };
  const triggerNodeOwner = {};
  const contentNodeOwner = {};
  const focusTrigger = (trigger: HTMLElement | null) => {
    if (!trigger) {
      return;
    }

    const generation = focusEntry.restoreGeneration + 1;
    focusEntry.restoreGeneration = generation;
    focusEntry.restoreTrigger = true;
    try {
      trigger.focus();
    } finally {
      // Release on the third microtask, after the two-microtask trigger adoption pass.
      queueMicrotask(() => {
        queueMicrotask(() => {
          queueMicrotask(() => {
            if (focusEntry.restoreGeneration === generation) {
              focusEntry.restoreTrigger = false;
            }
          });
        });
      });
    }
  };
  let contentPosition: HoverCardPositionOptions =
    resolveHoverCardPositionOptions();
  const timers = state<{
    open: ReturnType<typeof setTimeout> | undefined;
    close: ReturnType<typeof setTimeout> | undefined;
  }>({ open: undefined, close: undefined })();

  const clearOpenTimer = () => {
    if (timers.open !== undefined) {
      clearTimeout(timers.open);
      timers.open = undefined;
    }
  };
  const clearCloseTimer = () => {
    if (timers.close !== undefined) {
      clearTimeout(timers.close);
      timers.close = undefined;
    }
  };
  const clearTimers = () => {
    clearOpenTimer();
    clearCloseTimer();
  };
  cleanupSignal.addEventListener(
    'abort',
    () => {
      clearTimers();
      clearOverlayPosition(overlayIdentity);
      if (focusEntry.restoreFrame !== null) {
        focusEntry.restoreWindow?.cancelAnimationFrame(focusEntry.restoreFrame);
      }
    },
    { once: true }
  );

  const withCommittedIdSync = (
    registration: SsrIdRegistration
  ): SsrIdRegistration => ({
    cell: registration.cell,
    register(renderedId, signal) {
      registration.register(renderedId, signal);
      scheduleHoverCardPortalSync(() => {
        if (
          !signal.aborted &&
          overlayNodes.trigger?.isConnected &&
          overlayNodes.content?.isConnected
        ) {
          syncAssociations();
        }
      });
    },
  });

  const rootContext: HoverCardRootContextValue = {
    hoverCardId,
    get open() {
      return openState();
    },
    setOpen: (nextOpen: boolean) => {
      clearTimers();
      if (nextOpen && focusEntry.restoreTrigger) {
        return;
      }
      openState.set(nextOpen);

      if (!nextOpen) {
        clearOverlayPosition(overlayIdentity);
        return;
      }

      scheduleHoverCardPortalSync(() => {
        if (overlayNodes.content) {
          syncOverlayPosition(overlayIdentity, hoverCardId, contentPosition);
        }
      });
    },
    scheduleOpen: () => {
      clearCloseTimer();
      clearOpenTimer();

      if (openState()) {
        return;
      }

      timers.open = setTimeout(() => {
        timers.open = undefined;
        rootContext.setOpen(true);
      }, openDelay);
    },
    scheduleClose: () => {
      clearOpenTimer();
      clearCloseTimer();

      timers.close = setTimeout(() => {
        timers.close = undefined;
        rootContext.setOpen(false);
      }, closeDelay);
    },
    cancelClose: clearCloseTimer,
    triggerId,
    contentId,
    ssrTrigger: withCommittedIdSync(ssrTrigger),
    ssrContent: withCommittedIdSync(ssrContent),
    portal,
    registerContentPosition: (nextPosition: HoverCardPositionOptions) => {
      contentPosition = nextPosition;
    },
    setTriggerNode: (node: HTMLElement | null, automaticControls: boolean) => {
      registerOverlayNode(overlayIdentity, 'trigger', node, triggerNodeOwner);
      if (node && overlayNodes.trigger === node)
        associations.controls = automaticControls;
      syncAssociations();
      if (node && focusEntry.restoreTrigger) {
        node.focus();
      }
    },
    setContentNode: (node: HTMLElement | null, automaticLabel: boolean) => {
      registerOverlayNode(overlayIdentity, 'content', node, contentNodeOwner);
      if (node && overlayNodes.content === node)
        associations.label = automaticLabel;
      syncAssociations();
    },
    getTriggerNode: () => overlayNodes.trigger,
    getContentNode: () => overlayNodes.content,
    requestTriggerFocus: () => {
      const ownerDocument =
        overlayNodes.trigger?.ownerDocument ??
        overlayNodes.content?.ownerDocument;
      focusTrigger(
        overlayNodes.trigger ?? ownerDocument?.getElementById(triggerId) ?? null
      );
      if (focusEntry.restoreFrame !== null) {
        focusEntry.restoreWindow?.cancelAnimationFrame(focusEntry.restoreFrame);
      }
      const ownerWindow = ownerDocument?.defaultView;
      if (!ownerWindow) return;
      focusEntry.restoreWindow = ownerWindow;
      focusEntry.restoreFrame = ownerWindow.requestAnimationFrame(() => {
        focusEntry.restoreFrame = null;
        const trigger =
          overlayNodes.trigger ??
          ownerDocument?.getElementById(triggerId) ??
          null;
        focusTrigger(trigger);
      });
    },
    syncPosition: () => {
      if (overlayNodes.content) {
        syncOverlayPosition(overlayIdentity, hoverCardId, contentPosition);
      }
    },
    clearPosition: () => {
      clearOverlayPosition(overlayIdentity);
    },
  };

  const syncPointer = (event: PointerEvent) => {
    const target = event.target;
    const isInside =
      target &&
      'nodeType' in target &&
      (overlayNodes.trigger?.contains(target as Node) === true ||
        overlayNodes.content?.contains(target as Node) === true);
    if (isInside) {
      clearCloseTimer();
      return;
    }

    clearOpenTimer();
    if (openState() && timers.close === undefined) {
      rootContext.scheduleClose();
    }
  };

  watch(
    () => syncPointer,
    (committedSync) => {
      pointerEntry.sync = committedSync;
      if (pointerEntry.handler) return;
      pointerEntry.document =
        overlayNodes.trigger?.ownerDocument ??
        overlayNodes.content?.ownerDocument ??
        document;
      pointerEntry.handler = (event: PointerEvent) => {
        pointerEntry.sync?.(event);
      };
      pointerEntry.document.addEventListener(
        'pointerover',
        pointerEntry.handler
      );
      cleanupSignal.addEventListener(
        'abort',
        () => {
          if (pointerEntry.document && pointerEntry.handler) {
            pointerEntry.document.removeEventListener(
              'pointerover',
              pointerEntry.handler
            );
          }
          pointerEntry.document = null;
          pointerEntry.handler = null;
          pointerEntry.sync = null;
        },
        { once: true }
      );
    }
  );

  return (
    <HoverCardRootContext value={rootContext} {...ssrAttributeRootProps}>
      <>
        {children}
        <OverlayPortalHost portal={portal} />
      </>
    </HoverCardRootContext>
  );
}
