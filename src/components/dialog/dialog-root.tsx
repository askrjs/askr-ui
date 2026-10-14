import type { JSX } from '@askrjs/askr/jsx-runtime';
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
  syncOverlayStackActive,
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
import { OverlayPortalHost } from '../_internal/overlay-portal-host';
import { syncIdAssociation } from '../_internal/id-association';
import {
  createSsrIdRegistration,
  ssrAttributeRootProps,
  type SsrIdRegistration,
} from '../_internal/ssr-id-association';

function scheduleDialogPortalSync(callback: () => void) {
  queueMicrotask(callback);
}

function syncDialogLabelAttributes(
  content: HTMLElement | null,
  titleNode: HTMLElement | null | undefined,
  descriptionNode: HTMLElement | null | undefined,
  associations: { title: boolean; description: boolean }
) {
  if (!content) return;

  if (associations.title) {
    if (titleNode?.isConnected && titleNode.id) {
      content.setAttribute('aria-labelledby', titleNode.id);
    } else {
      content.removeAttribute('aria-labelledby');
    }
  }

  if (associations.description) {
    if (descriptionNode?.isConnected && descriptionNode.id) {
      content.setAttribute('aria-describedby', descriptionNode.id);
    } else {
      content.removeAttribute('aria-describedby');
    }
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
  const backdropStackId = resolvePartId(dialogId, 'backdrop-stack');
  syncOverlayStackActive(
    overlayIdentity,
    currentOpen,
    getSignal(),
    backdropStackId
  );
  primeOverlayStackNode(
    overlayIdentity,
    'backdrop',
    backdropStackId,
    OVERLAY_Z_INDEX.modalBackdrop
  );
  const contentId = resolvePartId(dialogId, 'content');
  const titleId = resolvePartId(dialogId, 'title');
  const descriptionId = resolvePartId(dialogId, 'description');
  const ssrTitle = state(createSsrIdRegistration())();
  const ssrDescription = state(createSsrIdRegistration())();
  const ssrContent = state(createSsrIdRegistration(contentId))();
  const contentAssociations = state({
    title: true,
    description: true,
    controls: true,
  })();
  const portal = getPersistentPortal(overlayIdentity);
  const overlayNodes = getOverlayNodes(overlayIdentity);
  const titleNodeOwner = {};
  const descriptionNodeOwner = {};
  const triggerNodeOwner = {};
  const contentNodeOwner = {};
  const position: DialogPositionOptions = resolveDialogPositionOptions();
  const syncLabelAttributes = () => {
    syncDialogLabelAttributes(
      overlayNodes.content,
      overlayNodes.title,
      overlayNodes.description,
      contentAssociations
    );
    if (
      contentAssociations.controls &&
      overlayNodes.trigger &&
      overlayNodes.content?.isConnected
    ) {
      syncIdAssociation(
        overlayNodes.trigger,
        overlayNodes.content,
        'aria-controls',
        contentAssociations.controls
      );
    }
  };
  const syncLabelAttributesSoon = () => {
    syncLabelAttributes();
    scheduleDialogPortalSync(syncLabelAttributes);
  };
  const withCommittedIdSync = (
    registration: SsrIdRegistration
  ): SsrIdRegistration => ({
    cell: registration.cell,
    register(renderedId, signal) {
      registration.register(renderedId, signal);
      scheduleDialogPortalSync(() => {
        if (!signal.aborted) syncLabelAttributes();
      });
    },
  });

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
    ssrTitle: withCommittedIdSync(ssrTitle),
    ssrDescription: withCommittedIdSync(ssrDescription),
    ssrContent: withCommittedIdSync(ssrContent),
    getContentId: () =>
      overlayNodes.content?.isConnected
        ? overlayNodes.content.id || undefined
        : ssrContent.cell.value,
    getTitleId: () =>
      overlayNodes.title?.isConnected
        ? overlayNodes.title.id || undefined
        : ssrTitle.cell.value,
    getDescriptionId: () =>
      overlayNodes.description?.isConnected
        ? overlayNodes.description.id || undefined
        : ssrDescription.cell.value,
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
    setTriggerNode: (node, automaticControls) => {
      registerOverlayNode(overlayIdentity, 'trigger', node, triggerNodeOwner);
      if (node && overlayNodes.trigger === node) {
        contentAssociations.controls = automaticControls;
      }
      syncLabelAttributesSoon();
    },
    getTriggerNode: () => overlayNodes.trigger,
    getContentNode: () => overlayNodes.content,
    setContentNode: (node, associations) => {
      registerOverlayNode(overlayIdentity, 'content', node, contentNodeOwner);
      if (node && overlayNodes.content === node) {
        contentAssociations.title = associations.title;
        contentAssociations.description = associations.description;
      }
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
    <DialogRootContext value={rootContext} {...ssrAttributeRootProps}>
      {children as JSX.Element}
      <OverlayPortalHost portal={portal} />
    </DialogRootContext>
  );
}
