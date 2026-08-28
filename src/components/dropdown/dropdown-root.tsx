import { cspNonce, getSignal, state } from '@askrjs/askr';
import { controllableState } from '@askrjs/askr/foundations/state';
import { resolveCompoundId, resolvePartId } from '../_internal/id';
import {
  captureOverlayNonce,
  createOverlayIdentity,
  getPersistentPortal,
  setOverlayStackActive,
} from '../_internal/overlay';
import {
  focusCollectionItemWithRestore,
  restorePendingCollectionItemFocus,
  type PendingCollectionFocus,
} from '../_internal/focus';
import { VirtualCompositeOwnerContext } from '../_internal/virtual-composite';
import { OverlayPortalHost } from '../_internal/overlay-portal-host';
import { observeMenuCollectionCount } from '../_internal/menu';
import {
  handleTypeaheadKeyDown,
  handleTypeaheadKeyUp,
  registerTypeaheadCleanup,
  resetTypeahead,
} from '../_internal/typeahead';
import {
  createDropdownRenderContext,
  DropdownRenderContext,
  DropdownRootContext,
  resolveDropdownState,
  type DropdownRootContextValue,
} from './dropdown.shared';
import type { DropdownProps } from './dropdown.types';

/**
 * Renders a part of `dropdown`.
 */
export function Dropdown(props: DropdownProps) {
  const { children, id, open, defaultOpen = false, onOpenChange } = props;
  const openState = controllableState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const dropdownId = resolveCompoundId('dropdown', id, children);
  const overlayIdentity = state(createOverlayIdentity())();
  const cleanupSignal = getSignal();
  setOverlayStackActive(overlayIdentity, openState(), cleanupSignal);
  captureOverlayNonce(overlayIdentity, cspNonce());
  registerTypeaheadCleanup(overlayIdentity, cleanupSignal);
  const currentIndexState = state(0);
  const pendingFocus = state<PendingCollectionFocus>({ index: null })();
  const setCurrentIndex = (index: number) => {
    if (currentIndexState() !== index) {
      currentIndexState.set(index);
    }
  };
  const rootContextBase = {
    dropdownId,
    overlayIdentity,
    currentIndexCandidate: currentIndexState(),
  };
  const resolvedState = resolveDropdownState(rootContextBase);
  const collection = observeMenuCollectionCount(dropdownId);
  const focusItem = (index: number) => {
    const itemValue = resolveDropdownState({
      dropdownId,
      currentIndexCandidate: currentIndexState(),
    }).items.find((item) => item.index === index)?.value;
    const resolveNode =
      itemValue === undefined
        ? undefined
        : () =>
            document.getElementById(
              resolvePartId(dropdownId, `item-${itemValue}`)
            );
    const focus = () => {
      focusCollectionItemWithRestore(
        pendingFocus,
        collection,
        index,
        resolveNode
      );
    };
    const mounted =
      resolveNode?.() ??
      collection.items().find((item) => item.metadata.index === index)?.node;
    if (mounted) focus();
    else queueMicrotask(focus);
  };
  const setOpen = (nextOpen: boolean) => {
    resetTypeahead(overlayIdentity);
    openState.set(nextOpen);
  };
  const rootContext: DropdownRootContextValue = {
    ...rootContextBase,
    open: openState(),
    setOpen,
    contentId: resolvePartId(dropdownId, 'content'),
    portal: getPersistentPortal(overlayIdentity),
    setCurrentIndex,
    focusItem,
    restoreItemFocus: (index, node) => {
      restorePendingCollectionItemFocus(pendingFocus, index, node);
    },
    resolvedState,
    handleTypeaheadKeyDown: (event) => {
      const liveState = resolveDropdownState({
        dropdownId,
        currentIndexCandidate: currentIndexState(),
      });

      const currentItemIndex = liveState.items.findIndex(
        (item) => item.index === liveState.currentIndex
      );
      return handleTypeaheadKeyDown(overlayIdentity, event, {
        currentIndex: currentItemIndex,
        items: liveState.items,
        onMatch: (matchIndex) => {
          const index = liveState.items[matchIndex]?.index;
          if (index === undefined) return;
          setCurrentIndex(index);
          focusItem(index);
        },
      });
    },
    handleTypeaheadKeyUp: (event) =>
      handleTypeaheadKeyUp(overlayIdentity, event),
  };
  const runtimeRenderContext = createDropdownRenderContext();
  return (
    <DropdownRootContext value={rootContext}>
      <DropdownRenderContext value={runtimeRenderContext}>
        <VirtualCompositeOwnerContext value>
          {children as JSX.Element}
          <OverlayPortalHost portal={rootContext.portal} />
        </VirtualCompositeOwnerContext>
      </DropdownRenderContext>
    </DropdownRootContext>
  );
}
