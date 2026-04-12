import { collectJsxElements } from '../../_internal/jsx';
import { resolveCompoundId, resolvePartId } from '../../_internal/id';
import {
  clearOverlayPosition,
  getOverlayNodes,
  getPersistentPortal,
  syncOverlayPosition,
} from '../../_internal/overlay';
import { controllableState } from '@askrjs/askr/foundations';
import { DialogDescription } from './dialog-description';
import {
  DialogRootContext,
  readDialogRootContext,
  resolveDialogPositionOptions,
  type DialogPositionOptions,
  type DialogRootContextValue,
} from './dialog.shared';
import { DialogTitle } from './dialog-title';
import type { DialogProps } from './dialog.types';

function scheduleDialogPortalSync(callback: () => void) {
  queueMicrotask(callback);
}

function DialogRootView(props: { children?: unknown }) {
  const root = readDialogRootContext();
  const PortalHost = root.portal;

  return (
    <>
      {props.children}
      {PortalHost ? <PortalHost /> : null}
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
  const hasTitle = collectJsxElements(
    children,
    (element) => element.type === DialogTitle
  ).length > 0;
  const hasDescription = collectJsxElements(
    children,
    (element) => element.type === DialogDescription
  ).length > 0;

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
    hasTitle,
    hasDescription,
    portal,
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