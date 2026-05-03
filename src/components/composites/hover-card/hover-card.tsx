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
  HoverCardRootContext,
  readHoverCardRootContext,
  resolveHoverCardPositionOptions,
  type HoverCardPositionOptions,
  type HoverCardRootContextValue,
} from './hover-card.shared';
import type { HoverCardProps } from './hover-card.types';

function scheduleHoverCardPortalSync(callback: () => void) {
  queueMicrotask(callback);
}

function HoverCardRootView(props: { children?: unknown }) {
  const root = readHoverCardRootContext();
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
      {PortalHost ? <PortalHost key="hover-card-root-portal" /> : null}
    </>
  );
}

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
  const triggerId = resolvePartId(hoverCardId, 'trigger');
  const contentId = resolvePartId(hoverCardId, 'content');
  const portal = getPersistentPortal(hoverCardId);
  const overlayNodes = getOverlayNodes(hoverCardId);
  let contentPosition: HoverCardPositionOptions =
    resolveHoverCardPositionOptions();
  let openTimer: ReturnType<typeof setTimeout> | undefined;
  let closeTimer: ReturnType<typeof setTimeout> | undefined;

  const clearTimers = () => {
    if (openTimer) {
      clearTimeout(openTimer);
      openTimer = undefined;
    }

    if (closeTimer) {
      clearTimeout(closeTimer);
      closeTimer = undefined;
    }
  };

  const rootContext: HoverCardRootContextValue = {
    hoverCardId,
    open: openState(),
    setOpen: (nextOpen: boolean) => {
      clearTimers();
      openState.set(nextOpen);

      if (!nextOpen) {
        clearOverlayPosition(hoverCardId);
        return;
      }

      scheduleHoverCardPortalSync(() => {
        if (overlayNodes.content) {
          syncOverlayPosition(hoverCardId, contentPosition);
        }
      });
    },
    scheduleOpen: () => {
      if (openTimer) {
        clearTimeout(openTimer);
      }

      if (openState()) {
        return;
      }

      openTimer = setTimeout(() => {
        rootContext.setOpen(true);
      }, openDelay);
    },
    scheduleClose: () => {
      if (closeTimer) {
        clearTimeout(closeTimer);
      }

      closeTimer = setTimeout(() => {
        rootContext.setOpen(false);
      }, closeDelay);
    },
    cancelClose: clearTimers,
    triggerId,
    contentId,
    portal,
    registerContentPosition: (nextPosition: HoverCardPositionOptions) => {
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
        syncOverlayPosition(hoverCardId, contentPosition);
      }
    },
    clearPosition: () => {
      clearOverlayPosition(hoverCardId);
    },
  };

  return (
    <HoverCardRootContext.Scope value={rootContext}>
      <HoverCardRootView>{children}</HoverCardRootView>
    </HoverCardRootContext.Scope>
  );
}
