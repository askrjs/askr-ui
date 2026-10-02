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
  PopoverRootContext,
  resolvePopoverPositionOptions,
  type PopoverPositionOptions,
  type PopoverRootContextValue,
} from './popover.shared';
import type { PopoverProps } from './popover.types';
import { OverlayPortalHost } from '../_internal/overlay-portal-host';
import { syncIdAssociation } from '../_internal/id-association';
import {
  createSsrIdRegistration,
  ssrAttributeRootProps,
  type SsrIdRegistration,
} from '../_internal/ssr-id-association';

function schedulePopoverPortalSync(callback: () => void) {
  queueMicrotask(callback);
}

/**
 * Renders a part of `popover`.
 */
export function Popover(props: PopoverProps) {
  const { children, id, open, defaultOpen = false, onOpenChange } = props;
  const openState = controllableState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const popoverId = resolveCompoundId('popover', id, children);
  const overlayIdentity = state(createOverlayIdentity())();
  setOverlayStackActive(overlayIdentity, openState(), getSignal());
  captureOverlayNonce(overlayIdentity, cspNonce());
  const triggerId = resolvePartId(popoverId, 'trigger');
  const contentId = resolvePartId(popoverId, 'content');
  const ssrTrigger = state(createSsrIdRegistration(triggerId))();
  const ssrContent = state(createSsrIdRegistration(contentId))();
  const portal = getPersistentPortal(overlayIdentity);
  const overlayNodes = getOverlayNodes(overlayIdentity);
  const associations = state({ controls: true, label: true })();
  const triggerNodeOwner = {};
  const contentNodeOwner = {};
  let contentPosition: PopoverPositionOptions = resolvePopoverPositionOptions();
  const syncAssociations = () => {
    const trigger = overlayNodes.trigger;
    const content = overlayNodes.content;
    syncIdAssociation(trigger, content, 'aria-controls', associations.controls);
    syncIdAssociation(content, trigger, 'aria-labelledby', associations.label);
  };

  const withCommittedIdSync = (
    registration: SsrIdRegistration
  ): SsrIdRegistration => ({
    cell: registration.cell,
    register(renderedId, signal) {
      registration.register(renderedId, signal);
      schedulePopoverPortalSync(() => {
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

  const rootContext: PopoverRootContextValue = {
    popoverId,
    get open() {
      return openState();
    },
    setOpen: (nextOpen: boolean) => {
      openState.set(nextOpen);

      if (!nextOpen) {
        clearOverlayPosition(overlayIdentity);
        return;
      }

      schedulePopoverPortalSync(() => {
        if (overlayNodes.content) {
          syncOverlayPosition(overlayIdentity, popoverId, contentPosition);
        }
      });
    },
    triggerId,
    contentId,
    ssrTrigger: withCommittedIdSync(ssrTrigger),
    ssrContent: withCommittedIdSync(ssrContent),
    portal,
    registerContentPosition: (nextPosition: PopoverPositionOptions) => {
      contentPosition = nextPosition;
    },
    setTriggerNode: (node: HTMLElement | null, automaticControls: boolean) => {
      registerOverlayNode(overlayIdentity, 'trigger', node, triggerNodeOwner);
      if (node) associations.controls = automaticControls;
      syncAssociations();
    },
    getTriggerNode: () => overlayNodes.trigger,
    getContentNode: () => overlayNodes.content,
    isTriggerTarget: (target: EventTarget | null) =>
      typeof Node !== 'undefined' &&
      target instanceof Node &&
      Boolean(overlayNodes.trigger?.contains(target)),
    setContentNode: (node: HTMLElement | null, automaticLabel: boolean) => {
      registerOverlayNode(overlayIdentity, 'content', node, contentNodeOwner);
      if (node) associations.label = automaticLabel;
      syncAssociations();
    },
    syncPosition: () => {
      if (overlayNodes.content) {
        syncOverlayPosition(overlayIdentity, popoverId, contentPosition);
      }
    },
    clearPosition: () => {
      clearOverlayPosition(overlayIdentity);
    },
  };
  return (
    <PopoverRootContext value={rootContext} {...ssrAttributeRootProps}>
      <>
        {children}
        <OverlayPortalHost portal={portal} />
      </>
    </PopoverRootContext>
  );
}
