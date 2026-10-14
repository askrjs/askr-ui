import { controllableState } from '@askrjs/askr/foundations/state';
import { cspNonce, getSignal, state } from '@askrjs/askr';
import { task } from '@askrjs/askr/resources';
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
  resolveTooltipPositionOptions,
  TooltipRootContext,
  type TooltipPositionOptions,
  type TooltipRootContextValue,
} from './tooltip.shared';
import type { TooltipProps } from './tooltip.types';
import { OverlayPortalHost } from '../_internal/overlay-portal-host';
import { syncIdAssociation } from '../_internal/id-association';
import {
  createSsrIdRegistration,
  ssrAttributeRootProps,
  type SsrIdRegistration,
} from '../_internal/ssr-id-association';

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
  syncOverlayStackActive(overlayIdentity, openState(), cleanupSignal);
  const focusEntry = state({
    adoptTrigger: false,
    focusRequestSent: false,
    generation: 0,
    releaseFrame: null as number | null,
    frameWindow: null as Window | null,
    listenerDocument: null as Document | null,
    focusListener: null as ((event: FocusEvent) => void) | null,
  })();
  captureOverlayNonce(overlayIdentity, cspNonce());
  const contentId = resolvePartId(tooltipId, 'content');
  const ssrContent = state(createSsrIdRegistration(contentId))();
  const portal = getPersistentPortal(overlayIdentity);
  const overlayNodes = getOverlayNodes(overlayIdentity);
  const association = state({ automatic: true })();
  const syncDescription = () => {
    if (openState()) {
      syncIdAssociation(
        overlayNodes.trigger,
        overlayNodes.content,
        'aria-describedby',
        association.automatic
      );
    } else if (association.automatic) {
      overlayNodes.trigger?.removeAttribute('aria-describedby');
    }
  };
  const triggerNodeOwner = {};
  const contentNodeOwner = {};
  let contentPosition: TooltipPositionOptions = resolveTooltipPositionOptions();
  const releaseTriggerAdoption = () => {
    const generation = focusEntry.generation + 1;
    focusEntry.generation = generation;
    if (focusEntry.releaseFrame !== null) {
      focusEntry.frameWindow?.cancelAnimationFrame(focusEntry.releaseFrame);
    }
    queueMicrotask(() => {
      if (cleanupSignal.aborted) {
        focusEntry.adoptTrigger = false;
        return;
      }
      if (focusEntry.generation !== generation) return;
      const ownerWindow = overlayNodes.trigger?.ownerDocument.defaultView;
      if (!ownerWindow) {
        focusEntry.adoptTrigger = false;
        return;
      }
      focusEntry.frameWindow = ownerWindow;
      focusEntry.releaseFrame = ownerWindow.requestAnimationFrame(() => {
        focusEntry.releaseFrame = null;
        if (focusEntry.generation === generation) {
          focusEntry.adoptTrigger = false;
        }
      });
    });
  };

  const onFocusIn = (event: FocusEvent) => {
    if (!focusEntry.focusRequestSent) return;
    const trigger = overlayNodes.trigger;
    if (
      trigger &&
      event.target &&
      'nodeType' in event.target &&
      trigger.contains(event.target as Node)
    ) {
      return;
    }
    releaseFocusAdoption();
  };

  const releaseFocusAdoption = () => {
    focusEntry.generation += 1;
    if (focusEntry.releaseFrame !== null) {
      focusEntry.frameWindow?.cancelAnimationFrame(focusEntry.releaseFrame);
      focusEntry.releaseFrame = null;
    }
    if (focusEntry.listenerDocument && focusEntry.focusListener) {
      focusEntry.listenerDocument.removeEventListener(
        'focusin',
        focusEntry.focusListener,
        true
      );
      focusEntry.listenerDocument = null;
      focusEntry.focusListener = null;
    }
    focusEntry.focusRequestSent = false;
    focusEntry.adoptTrigger = false;
  };

  task(() => () => releaseFocusAdoption());

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

  const withCommittedIdSync = (
    registration: SsrIdRegistration
  ): SsrIdRegistration => ({
    cell: registration.cell,
    register(renderedId, signal) {
      registration.register(renderedId, signal);
      scheduleTooltipPortalSync(() => {
        if (
          !signal.aborted &&
          overlayNodes.trigger?.isConnected &&
          overlayNodes.content?.isConnected
        ) {
          syncDescription();
        }
      });
    },
  });

  const rootContext: TooltipRootContextValue = {
    tooltipId,
    get open() {
      return openState();
    },
    setOpen: updateOpen,
    openFromFocus: () => {
      // A controlled owner may decline the open request, leaving openState
      // false. Keep the request latched through the focus cycle so delayed
      // trigger ref attachment cannot emit a duplicate open request.
      if (focusEntry.focusRequestSent) return;
      focusEntry.focusRequestSent = true;
      const ownerDocument = overlayNodes.trigger?.ownerDocument;
      if (ownerDocument) {
        focusEntry.listenerDocument = ownerDocument;
        focusEntry.focusListener = onFocusIn;
        ownerDocument.addEventListener('focusin', onFocusIn, true);
      }
      focusEntry.adoptTrigger = true;
      updateOpen(true);
      releaseTriggerAdoption();
    },
    releaseFocusAdoption,
    getTriggerNode: () => overlayNodes.trigger,
    contentId,
    ssrContent: withCommittedIdSync(ssrContent),
    portal,
    registerContentPosition: (nextPosition: TooltipPositionOptions) => {
      contentPosition = nextPosition;
    },
    setTriggerNode: (
      node: HTMLElement | null,
      automaticDescription: boolean
    ) => {
      registerOverlayNode(overlayIdentity, 'trigger', node, triggerNodeOwner);
      if (node && overlayNodes.trigger === node)
        association.automatic = automaticDescription;
      syncDescription();
      if (
        node &&
        focusEntry.focusRequestSent &&
        node.ownerDocument.activeElement !== node
      ) {
        node.focus();
      }
    },
    setContentNode: (node: HTMLElement | null) => {
      registerOverlayNode(overlayIdentity, 'content', node, contentNodeOwner);
      syncDescription();
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
  return (
    <TooltipRootContext value={rootContext} {...ssrAttributeRootProps}>
      <>
        {children}
        <OverlayPortalHost portal={portal} />
      </>
    </TooltipRootContext>
  );
}
