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
  resolveTooltipPositionOptions,
  TooltipRootContext,
  type TooltipPositionOptions,
  type TooltipRootContextValue,
} from './tooltip.shared';
import type { TooltipProps } from './tooltip.types';

function scheduleTooltipPortalSync(callback: () => void) {
  queueMicrotask(callback);
}

export function Tooltip(props: TooltipProps) {
  const { children, id, open, defaultOpen = false, onOpenChange } = props;
  const openState = controllableState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const tooltipId = resolveCompoundId('tooltip', id, children);
  const overlayIdentity = state(createOverlayIdentity())();
  captureOverlayNonce(overlayIdentity, cspNonce());
  const contentId = resolvePartId(tooltipId, 'content');
  const portal = getPersistentPortal(overlayIdentity);
  const overlayNodes = getOverlayNodes(overlayIdentity);
  let contentPosition: TooltipPositionOptions = resolveTooltipPositionOptions();

  const rootContext: TooltipRootContextValue = {
    tooltipId,
    open: openState(),
    setOpen: (nextOpen: boolean) => {
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
    },
    contentId,
    portal,
    registerContentPosition: (nextPosition: TooltipPositionOptions) => {
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
