import { controllableState } from '@askrjs/askr/foundations/state';
import { cspNonce, state } from '@askrjs/askr';
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
  PopoverRootContext,
  resolvePopoverPositionOptions,
  type PopoverPositionOptions,
  type PopoverRootContextValue,
} from './popover.shared';
import type { PopoverProps } from './popover.types';

function schedulePopoverPortalSync(callback: () => void) {
  queueMicrotask(callback);
}

export function Popover(props: PopoverProps) {
  const { children, id, open, defaultOpen = false, onOpenChange } = props;
  const openState = controllableState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const popoverId = resolveCompoundId('popover', id, children);
  const overlayIdentity = state(createOverlayIdentity())();
  captureOverlayNonce(overlayIdentity, cspNonce());
  const triggerId = resolvePartId(popoverId, 'trigger');
  const contentId = resolvePartId(popoverId, 'content');
  const portal = getPersistentPortal(overlayIdentity);
  const overlayNodes = getOverlayNodes(overlayIdentity);
  let contentPosition: PopoverPositionOptions = resolvePopoverPositionOptions();

  const rootContext: PopoverRootContextValue = {
    popoverId,
    open: openState(),
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
      overlayNodes.trigger = node;
    },
    setContentNode: (node: HTMLElement | null) => {
      overlayNodes.content = node;
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
