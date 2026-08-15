import { controllableState } from '@askrjs/askr/foundations/state';
import { cspNonce, getSignal, state } from '@askrjs/askr';
import { resolveCompoundId, resolvePartId } from '../_internal/id';
import {
  captureOverlayNonce,
  clearOverlayPosition,
  createOverlayIdentity,
  getOverlayNodes,
  getPersistentPortal,
  syncOverlayPosition,
} from '../_internal/overlay';
import {
  HoverCardRootContext,
  resolveHoverCardPositionOptions,
  type HoverCardPositionOptions,
  type HoverCardRootContextValue,
} from './hover-card.shared';
import type { HoverCardProps } from './hover-card.types';

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
  const focusEntry = state({
    restoreTrigger: false,
    restoreFrame: null as number | null,
    restoreGeneration: 0,
  })();
  captureOverlayNonce(overlayIdentity, cspNonce());
  const triggerId = resolvePartId(hoverCardId, 'trigger');
  const contentId = resolvePartId(hoverCardId, 'content');
  const portal = getPersistentPortal(overlayIdentity);
  const overlayNodes = getOverlayNodes(overlayIdentity);
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
  let openTimer: ReturnType<typeof setTimeout> | undefined;
  let closeTimer: ReturnType<typeof setTimeout> | undefined;

  const clearOpenTimer = () => {
    if (openTimer !== undefined) {
      clearTimeout(openTimer);
      openTimer = undefined;
    }
  };
  const clearCloseTimer = () => {
    if (closeTimer !== undefined) {
      clearTimeout(closeTimer);
      closeTimer = undefined;
    }
  };
  const clearTimers = () => {
    clearOpenTimer();
    clearCloseTimer();
  };
  const cleanupSignal = getSignal();
  cleanupSignal.addEventListener(
    'abort',
    () => {
      clearTimers();
      clearOverlayPosition(overlayIdentity);
      if (focusEntry.restoreFrame !== null) {
        cancelAnimationFrame(focusEntry.restoreFrame);
      }
    },
    { once: true }
  );

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

      openTimer = setTimeout(() => {
        openTimer = undefined;
        rootContext.setOpen(true);
      }, openDelay);
    },
    scheduleClose: () => {
      clearOpenTimer();
      clearCloseTimer();

      closeTimer = setTimeout(() => {
        closeTimer = undefined;
        rootContext.setOpen(false);
      }, closeDelay);
    },
    cancelClose: clearCloseTimer,
    triggerId,
    contentId,
    portal,
    registerContentPosition: (nextPosition: HoverCardPositionOptions) => {
      contentPosition = nextPosition;
    },
    setTriggerNode: (node: HTMLElement | null) => {
      overlayNodes.trigger = node;
      if (node && focusEntry.restoreTrigger) {
        node.focus();
      }
    },
    setContentNode: (node: HTMLElement | null) => {
      overlayNodes.content = node;
    },
    getTriggerNode: () => overlayNodes.trigger,
    getContentNode: () => overlayNodes.content,
    requestTriggerFocus: () => {
      focusTrigger(document.getElementById(triggerId) ?? overlayNodes.trigger);
      if (focusEntry.restoreFrame !== null) {
        cancelAnimationFrame(focusEntry.restoreFrame);
      }
      focusEntry.restoreFrame = requestAnimationFrame(() => {
        focusEntry.restoreFrame = null;
        const trigger =
          document.getElementById(triggerId) ?? overlayNodes.trigger;
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
  const PortalHost = portal;

  return (
    <HoverCardRootContext value={rootContext}>
      <>
        {children}
        {PortalHost ? <PortalHost key="hover-card-root-portal" /> : null}
      </>
    </HoverCardRootContext>
  );
}
