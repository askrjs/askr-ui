import { For, state } from '@askrjs/askr';
import { resolveCompoundId, resolvePartId } from '../../_internal/id';
import { toChildArray } from '../../_internal/jsx';
import {
  clearOverlayPosition,
  getOverlayNodes,
  getPersistentPortal,
  syncOverlayPosition,
} from '../../_internal/overlay';
import { controllableState } from '@askrjs/ui/foundations';
import { DialogDescription } from './dialog-description';
import {
  DialogRootContext,
  readDialogRootContext,
  resolveDialogPositionOptions,
  type DialogPositionOptions,
  type DialogRootContextValue,
} from './dialog.shared';
import type { DialogProps } from './dialog.types';

function scheduleDialogPortalSync(callback: () => void) {
  queueMicrotask(callback);
}

function DialogRootView(props: { children?: unknown }) {
  const root = readDialogRootContext();
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
      {PortalHost ? <PortalHost key="dialog-root-portal" /> : null}
    </>
  );
}

export function Dialog(props: DialogProps) {
  const {
    children,
    id,
    open,
    defaultOpen = false,
    onOpenChange,
    modal = true,
  } = props;
  const openState = controllableState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const dialogId = resolveCompoundId('dialog', id, children);
  const contentId = resolvePartId(dialogId, 'content');
  const titleId = resolvePartId(dialogId, 'title');
  const descriptionId = resolvePartId(dialogId, 'description');
  const portal = getPersistentPortal(dialogId);
  const overlayNodes = getOverlayNodes(dialogId);
  const position: DialogPositionOptions = resolveDialogPositionOptions();
  const hasTitleState = state(false);
  const hasDescriptionState = state(false);

  const rootContext: DialogRootContextValue = {
    dialogId,
    open: openState(),
    setOpen: (nextOpen: boolean) => {
      openState.set(nextOpen);

      if (!nextOpen) {
        clearOverlayPosition(dialogId);
        return;
      }

      scheduleDialogPortalSync(() => {
        if (overlayNodes.content) {
          syncOverlayPosition(dialogId, position);
        }
      });
    },
    modal,
    contentId,
    titleId,
    descriptionId,
    hasTitle: hasTitleState(),
    hasDescription: hasDescriptionState(),
    portal,
    setTitleNode: (node: HTMLElement | null) => {
      if (node && !hasTitleState()) {
        hasTitleState.set(true);
      }
    },
    setDescriptionNode: (node: HTMLElement | null) => {
      if (node && !hasDescriptionState()) {
        hasDescriptionState.set(true);
      }
    },
    setTriggerNode: (node: HTMLElement | null) => {
      overlayNodes.trigger = node;
    },
    setContentNode: (node: HTMLElement | null) => {
      overlayNodes.content = node;
    },
    syncPosition: () => {
      if (overlayNodes.content) {
        syncOverlayPosition(dialogId, position);
      }
    },
    clearPosition: () => {
      clearOverlayPosition(dialogId);
    },
  };

  return (
    <DialogRootContext.Scope value={rootContext}>
      <DialogRootView>{children}</DialogRootView>
    </DialogRootContext.Scope>
  );
}

