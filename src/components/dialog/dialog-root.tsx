import { resolveCompoundId, resolvePartId } from '../_internal/id';
import {
  clearOverlayPosition,
  getOverlayNodes,
  getPersistentPortal,
  syncOverlayPosition,
} from '../_internal/overlay';
import { controllableState } from '@askrjs/askr/foundations/state';
import {
  DialogRootContext,
  resolveDialogPositionOptions,
  type DialogPositionOptions,
  type DialogRootContextValue,
} from './dialog.shared';
import type { DialogProps } from './dialog.types';

function scheduleDialogPortalSync(callback: () => void) {
  queueMicrotask(callback);
}

function syncDialogLabelAttributes(
  content: HTMLElement | null,
  titleId: string,
  titleNode: HTMLElement | null | undefined,
  descriptionId: string,
  descriptionNode: HTMLElement | null | undefined
) {
  if (!content) return;

  if (titleNode?.isConnected) {
    content.setAttribute('aria-labelledby', titleId);
  } else if (content.getAttribute('aria-labelledby') === titleId) {
    content.removeAttribute('aria-labelledby');
  }

  if (descriptionNode?.isConnected) {
    content.setAttribute('aria-describedby', descriptionId);
  } else if (content.getAttribute('aria-describedby') === descriptionId) {
    content.removeAttribute('aria-describedby');
  }
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
  const dialogId = resolveCompoundId('dialog', id, children);
  const openState = controllableState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const contentId = resolvePartId(dialogId, 'content');
  const titleId = resolvePartId(dialogId, 'title');
  const descriptionId = resolvePartId(dialogId, 'description');
  const portal = getPersistentPortal(dialogId);
  const overlayNodes = getOverlayNodes(dialogId);
  const position: DialogPositionOptions = resolveDialogPositionOptions();
  const PortalHost = portal;
  const syncLabelAttributes = () => {
    syncDialogLabelAttributes(
      overlayNodes.content,
      titleId,
      overlayNodes.title,
      descriptionId,
      overlayNodes.description
    );
  };
  const syncLabelAttributesSoon = () => {
    syncLabelAttributes();
    scheduleDialogPortalSync(syncLabelAttributes);
  };

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
    hasTitle: Boolean(overlayNodes.title?.isConnected),
    hasDescription: Boolean(overlayNodes.description?.isConnected),
    portal,
    setTitleNode: (node: HTMLElement | null) => {
      overlayNodes.title = node;
      syncLabelAttributesSoon();
    },
    setDescriptionNode: (node: HTMLElement | null) => {
      overlayNodes.description = node;
      syncLabelAttributesSoon();
    },
    setTriggerNode: (node: HTMLElement | null) => {
      overlayNodes.trigger = node;
    },
    setContentNode: (node: HTMLElement | null) => {
      overlayNodes.content = node;
      syncLabelAttributesSoon();
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
    <DialogRootContext value={rootContext}>
      {children as JSX.Element}
      {PortalHost ? <PortalHost key="dialog-root-portal" /> : null}
    </DialogRootContext>
  );
}
