import { resolveCompoundId, resolvePartId } from '../_internal/id';
import {
  captureOverlayNonce,
  clearOverlayPosition,
  createOverlayIdentity,
  getOverlayNodes,
  getPersistentPortal,
  OVERLAY_Z_INDEX,
  primeOverlayStackNode,
  registerOverlayNode,
  setOverlayStackActive,
  syncOverlayPosition,
} from '../_internal/overlay';
import { cspNonce, getSignal, state } from '@askrjs/askr';
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

/**
 * Coordinates the Dialog trigger, portal, overlay, and content.
 *
 * @example
 * ```tsx
 * <Dialog>
 *   <DialogTrigger>Open dialog</DialogTrigger>
 *   <DialogPortal>
 *     <DialogOverlay />
 *     <DialogContent>Confirm action</DialogContent>
 *   </DialogPortal>
 * </Dialog>
 * ```
 */
export function Dialog(props: DialogProps) {
  const {
    children,
    id,
    open,
    defaultOpen = false,
    onOpenChange,
    modal = true,
  } = props;
  const generatedDialogId = state(resolveCompoundId('dialog', id, children));
  const autoDialogId = generatedDialogId();
  const dialogId =
    id === undefined ? autoDialogId : resolveCompoundId('dialog', id, children);
  const overlayIdentity = state(createOverlayIdentity())();
  captureOverlayNonce(overlayIdentity, cspNonce());
  const openState = controllableState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const currentOpen = openState();
  setOverlayStackActive(overlayIdentity, currentOpen, getSignal());
  const backdropStackId = resolvePartId(dialogId, 'backdrop-stack');
  primeOverlayStackNode(
    overlayIdentity,
    'backdrop',
    backdropStackId,
    OVERLAY_Z_INDEX.modalBackdrop
  );
  const contentId = resolvePartId(dialogId, 'content');
  const titleId = resolvePartId(dialogId, 'title');
  const descriptionId = resolvePartId(dialogId, 'description');
  const portal = getPersistentPortal(overlayIdentity);
  const overlayNodes = getOverlayNodes(overlayIdentity);
  const titleNodeOwner = {};
  const descriptionNodeOwner = {};
  const triggerNodeOwner = {};
  const contentNodeOwner = {};
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
    get open() {
      return openState();
    },
    setOpen: (nextOpen: boolean) => {
      openState.set(nextOpen);

      if (!nextOpen) {
        clearOverlayPosition(overlayIdentity);
        return;
      }

      scheduleDialogPortalSync(() => {
        if (overlayNodes.content) {
          syncOverlayPosition(overlayIdentity, dialogId, position);
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
    backdropStackId,
    setTitleNode: (node: HTMLElement | null) => {
      registerOverlayNode(overlayIdentity, 'title', node, titleNodeOwner);
      syncLabelAttributesSoon();
    },
    setDescriptionNode: (node: HTMLElement | null) => {
      registerOverlayNode(
        overlayIdentity,
        'description',
        node,
        descriptionNodeOwner
      );
      syncLabelAttributesSoon();
    },
    setTriggerNode: (node: HTMLElement | null) => {
      registerOverlayNode(overlayIdentity, 'trigger', node, triggerNodeOwner);
    },
    setContentNode: (node: HTMLElement | null) => {
      registerOverlayNode(overlayIdentity, 'content', node, contentNodeOwner);
      syncLabelAttributesSoon();
    },
    syncPosition: () => {
      if (overlayNodes.content) {
        syncOverlayPosition(overlayIdentity, dialogId, position);
      }
    },
    clearPosition: () => {
      clearOverlayPosition(overlayIdentity);
    },
  };

  return (
    <DialogRootContext value={rootContext}>
      {children as JSX.Element}
      {PortalHost ? <PortalHost key="dialog-root-portal" /> : null}
    </DialogRootContext>
  );
}
