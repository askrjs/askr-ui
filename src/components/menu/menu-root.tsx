import { getSignal, state } from '@askrjs/askr';
import { rovingFocus } from '../_internal/roving-focus';
import { resolveCompoundId } from '../_internal/id';
import {
  focusCollectionItemWithRestore,
  restorePendingCollectionItemFocus,
  type PendingCollectionFocus,
} from '../_internal/focus';
import { VirtualCompositeOwnerContext } from '../_internal/virtual-composite';
import {
  getMenuCollectionItems,
  observeMenuCollection,
} from '../_internal/menu';
import {
  handleTypeaheadKeyDown,
  handleTypeaheadKeyUp,
  registerTypeaheadCleanup,
} from '../_internal/typeahead';
import {
  createMenuRenderContext,
  MenuRenderContext,
  MenuRootContext,
  resolveMenuState,
  type MenuRootContextValue,
} from './menu.shared';
import type { MenuProps } from './menu.types';

/**
 * Renders a part of `menu`.
 */
export function Menu(props: MenuProps) {
  const { children, id, orientation = 'vertical', loop = true } = props;
  const menuId = resolveCompoundId('menu', id, children);
  const currentIndexState = state(0);
  const typeaheadIdentity = state<object>({})();
  registerTypeaheadCleanup(typeaheadIdentity, getSignal());
  const setCurrentIndex = (index: number) => {
    if (currentIndexState() !== index) {
      currentIndexState.set(index);
    }
  };
  const rootContextBase = {
    menuId,
    currentIndexCandidate: currentIndexState(),
  };
  const resolvedState = resolveMenuState(rootContextBase);
  const collection = observeMenuCollection(menuId);
  const pendingFocus = state<PendingCollectionFocus>({ index: null })();
  const focusItem = (index: number) =>
    focusCollectionItemWithRestore(pendingFocus, collection, index);
  const navigation = rovingFocus({
    currentIndex: resolvedState.currentIndex,
    itemCount: Math.max(resolvedState.itemCount, 1),
    orientation,
    loop,
    isDisabled: (index) => resolvedState.disabledIndexes.includes(index),
    onNavigate: (index) => {
      setCurrentIndex(index);
      focusItem(index);
    },
  });
  const rootContext: MenuRootContextValue = {
    ...rootContextBase,
    orientation,
    loop,
    setCurrentIndex,
    resolvedState,
    navigation,
    focusItem,
    restoreItemFocus: (index, node) =>
      restorePendingCollectionItemFocus(pendingFocus, index, node),
    handleTypeaheadKeyDown: (event) => {
      const items = getMenuCollectionItems(collection);

      const currentItemIndex = items.findIndex(
        (item) => item.index === currentIndexState()
      );
      return handleTypeaheadKeyDown(typeaheadIdentity, event, {
        currentIndex: currentItemIndex,
        items,
        onMatch: (matchIndex) => {
          const index = items[matchIndex]?.index;
          if (index === undefined) return;
          setCurrentIndex(index);
          focusItem(index);
        },
      });
    },
    handleTypeaheadKeyUp: (event) =>
      handleTypeaheadKeyUp(typeaheadIdentity, event),
  };
  const renderContext = createMenuRenderContext();

  return (
    <MenuRootContext value={rootContext}>
      <MenuRenderContext value={renderContext}>
        <VirtualCompositeOwnerContext value>
          {children as JSX.Element}
        </VirtualCompositeOwnerContext>
      </MenuRenderContext>
    </MenuRootContext>
  );
}
