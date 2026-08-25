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
  const portal = getPersistentPortal(overlayIdentity);
  const overlayNodes = getOverlayNodes(overlayIdentity);
  const triggerNodeOwner = {};
  const contentNodeOwner = {};
  let contentPosition: PopoverPositionOptions = resolvePopoverPositionOptions();

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
    portal,
    registerContentPosition: (nextPosition: PopoverPositionOptions) => {
      contentPosition = nextPosition;
    },
    setTriggerNode: (node: HTMLElement | null) => {
      registerOverlayNode(overlayIdentity, 'trigger', node, triggerNodeOwner);
    },
    setContentNode: (node: HTMLElement | null) => {
      registerOverlayNode(overlayIdentity, 'content', node, contentNodeOwner);
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
  const PortalHost = portal;

  return (
    <PopoverRootContext value={rootContext}>
      <>
        {children}
        {PortalHost ? <PortalHost key="popover-root-portal" /> : null}
      </>
    </PopoverRootContext>
  );
}
