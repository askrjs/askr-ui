import { controllableState } from '@askrjs/askr/foundations/state';
import { cspNonce, getSignal, state } from '@askrjs/askr';
import { resolveCompoundId, resolvePartId } from '../_internal/id';
import {
  captureOverlayNonce,
  clearOverlayPosition,
  createOverlayIdentity,
  getOverlayNodes,
  getPersistentPortal,
  registerOverlayNode,
  setOverlayStackActive,
  syncOverlayPosition,
} from '../_internal/overlay';
import {
  resolveTooltipPositionOptions,
  TooltipRootContext,
  type TooltipPositionOptions,
  type TooltipRootContextValue,
} from './tooltip.shared';
import type { TooltipProps } from './tooltip.types';

function scheduleTooltipPortalSync(callback: () => void) {
  queueMicrotask(callback);
}

/**
 * Renders a part of `tooltip`.
 */
export function Tooltip(props: TooltipProps) {
  const { children, id, open, defaultOpen = false, onOpenChange } = props;
  const openState = controllableState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const tooltipId = resolveCompoundId('tooltip', id, children);
  const overlayIdentity = state(createOverlayIdentity())();
  const cleanupSignal = getSignal();
  setOverlayStackActive(overlayIdentity, openState(), cleanupSignal);
  const focusEntry = state({
    adoptTrigger: false,
    generation: 0,
    releaseFrame: null as number | null,
  })();
  captureOverlayNonce(overlayIdentity, cspNonce());
  const contentId = resolvePartId(tooltipId, 'content');
  const portal = getPersistentPortal(overlayIdentity);
  const overlayNodes = getOverlayNodes(overlayIdentity);
  const triggerNodeOwner = {};
  const contentNodeOwner = {};
  let contentPosition: TooltipPositionOptions = resolveTooltipPositionOptions();
  const releaseTriggerAdoption = () => {
    const generation = focusEntry.generation + 1;
    focusEntry.generation = generation;
    if (focusEntry.releaseFrame !== null) {
      cancelAnimationFrame(focusEntry.releaseFrame);
    }
    queueMicrotask(() => {
      if (cleanupSignal.aborted) {
        focusEntry.adoptTrigger = false;
        return;
      }
      focusEntry.releaseFrame = requestAnimationFrame(() => {
        focusEntry.releaseFrame = null;
        if (focusEntry.generation === generation) {
          focusEntry.adoptTrigger = false;
        }
      });
    });
  };

  cleanupSignal.addEventListener(
    'abort',
    () => {
      if (focusEntry.releaseFrame !== null) {
        cancelAnimationFrame(focusEntry.releaseFrame);
        focusEntry.releaseFrame = null;
      }
      focusEntry.adoptTrigger = false;
      focusEntry.generation += 1;
    },
    { once: true }
  );

  const updateOpen = (nextOpen: boolean) => {
    if (!nextOpen && focusEntry.adoptTrigger) {
      return;
    }
    if (openState() === nextOpen) {
      return;
    }
    openState.set(nextOpen);

    if (!nextOpen) {
      clearOverlayPosition(overlayIdentity);
      return;
    }

    scheduleTooltipPortalSync(() => {
      if (overlayNodes.content) {
        syncOverlayPosition(overlayIdentity, tooltipId, contentPosition);
      }
    });
  };

  const rootContext: TooltipRootContextValue = {
    tooltipId,
    get open() {
      return openState();
    },
    setOpen: updateOpen,
    openFromFocus: () => {
      focusEntry.adoptTrigger = true;
      updateOpen(true);
      releaseTriggerAdoption();
    },
    contentId,
    portal,
    registerContentPosition: (nextPosition: TooltipPositionOptions) => {
      contentPosition = nextPosition;
    },
    setTriggerNode: (node: HTMLElement | null) => {
      registerOverlayNode(overlayIdentity, 'trigger', node, triggerNodeOwner);
      if (node && focusEntry.adoptTrigger && document.activeElement !== node) {
        node.focus();
      }
    },
    setContentNode: (node: HTMLElement | null) => {
      registerOverlayNode(overlayIdentity, 'content', node, contentNodeOwner);
    },
    syncPosition: () => {
      if (overlayNodes.content) {
        syncOverlayPosition(overlayIdentity, tooltipId, contentPosition);
      }
    },
    clearPosition: () => {
      clearOverlayPosition(overlayIdentity);
    },
  };
  const PortalHost = portal;

  return (
    <TooltipRootContext value={rootContext}>
      <>
        {children}
        {PortalHost ? <PortalHost key="tooltip-root-portal" /> : null}
      </>
    </TooltipRootContext>
  );
}
