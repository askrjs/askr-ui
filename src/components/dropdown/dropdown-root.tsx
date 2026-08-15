import { cspNonce, getSignal, state } from '@askrjs/askr';
import { controllableState } from '@askrjs/askr/foundations/state';
import { resolveCompoundId, resolvePartId } from '../_internal/id';
import {
  captureOverlayNonce,
  createOverlayIdentity,
  getPersistentPortal,
} from '../_internal/overlay';
import {
  focusCollectionItemWithRestore,
  restorePendingCollectionItemFocus,
  type PendingCollectionFocus,
} from '../_internal/focus';
import { getMenuCollection } from '../_internal/menu';
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
  captureOverlayNonce(overlayIdentity, cspNonce());
  registerTypeaheadCleanup(overlayIdentity, getSignal());
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
  const collection = getMenuCollection(dropdownId);
  const focusItem = (index: number) => {
    const itemValue = resolveDropdownState({
      dropdownId,
      currentIndexCandidate: currentIndexState(),
    }).items[index]?.value;
    focusCollectionItemWithRestore(
      pendingFocus,
      collection,
      index,
      itemValue === undefined
        ? undefined
        : () =>
            document.getElementById(
              resolvePartId(dropdownId, `item-${itemValue}`)
            )
    );
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

      return handleTypeaheadKeyDown(overlayIdentity, event, {
        currentIndex: liveState.currentIndex,
        items: liveState.items,
        onMatch: (index) => {
          setCurrentIndex(index);
          focusItem(index);
        },
      });
    },
    handleTypeaheadKeyUp: (event) =>
      handleTypeaheadKeyUp(overlayIdentity, event),
  };
  const runtimeRenderContext = createDropdownRenderContext();
  const PortalHost = rootContext.portal;

  return (
    <DropdownRootContext value={rootContext}>
      <DropdownRenderContext value={runtimeRenderContext}>
        {children as JSX.Element}
        {PortalHost ? <PortalHost key="dropdown-root-portal" /> : null}
      </DropdownRenderContext>
    </DropdownRootContext>
  );
}
