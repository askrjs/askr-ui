import { controllableState } from '@askrjs/askr/foundations';
import { resolveCompoundId, resolvePartId } from '../_internal/id';
import {
  clearOverlayPosition,
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
  const contentId = resolvePartId(tooltipId, 'content');
  const portal = getPersistentPortal(tooltipId);
  const overlayNodes = getOverlayNodes(tooltipId);
  let contentPosition: TooltipPositionOptions = resolveTooltipPositionOptions();

  const rootContext: TooltipRootContextValue = {
    tooltipId,
    open: openState(),
    setOpen: (nextOpen: boolean) => {
      openState.set(nextOpen);

      if (!nextOpen) {
        clearOverlayPosition(tooltipId);
        return;
      }

      scheduleTooltipPortalSync(() => {
        if (overlayNodes.content) {
          syncOverlayPosition(tooltipId, contentPosition);
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
        syncOverlayPosition(tooltipId, contentPosition);
      }
    },
    clearPosition: () => {
      clearOverlayPosition(tooltipId);
    },
  };
  const PortalHost = portal;

  return (
    <TooltipRootContext.Scope value={rootContext}>
      <>
        {children}
        {PortalHost ? <PortalHost key="tooltip-root-portal" /> : null}
      </>
    </TooltipRootContext.Scope>
  );
}
