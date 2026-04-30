import { For } from '@askrjs/askr';
import { controllableState } from '@askrjs/askr/foundations';
import { resolveCompoundId, resolvePartId } from '../../_internal/id';
import { toChildArray } from '../../_internal/jsx';
import {
  clearOverlayPosition,
  getOverlayNodes,
  getPersistentPortal,
  syncOverlayPosition,
} from '../../_internal/overlay';
import {
  readTooltipRootContext,
  resolveTooltipPositionOptions,
  TooltipRootContext,
  type TooltipPositionOptions,
  type TooltipRootContextValue,
} from './tooltip.shared';
import type { TooltipProps } from './tooltip.types';

function scheduleTooltipPortalSync(callback: () => void) {
  queueMicrotask(callback);
}

function TooltipRootView(props: { children?: unknown }) {
  const root = readTooltipRootContext();
  const PortalHost = root.portal;
  const keyedChildren = (
    <For
      each={() => toChildArray(props.children)}
      by={(_child, index) => index}
    >
      {(child) => child as never}
    </For>
  );

  return (
    <>
      {keyedChildren}
      {PortalHost ? <PortalHost key="tooltip-root-portal" /> : null}
    </>
  );
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

  return (
    <TooltipRootContext.Scope value={rootContext}>
      <TooltipRootView>{children}</TooltipRootView>
    </TooltipRootContext.Scope>
  );
}
