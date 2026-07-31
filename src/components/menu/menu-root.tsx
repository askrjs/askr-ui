import { getSignal, state } from '@askrjs/askr';
import { rovingFocus } from '@askrjs/askr/foundations/interactions';
import { resolveCompoundId } from '../_internal/id';
import { focusSelectedCollectionItem } from '../_internal/focus';
import { getMenuCollection, getMenuCollectionItems } from '../_internal/menu';
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
  const collection = getMenuCollection(menuId);
  const navigation = rovingFocus({
    currentIndex: resolvedState.currentIndex,
    itemCount: Math.max(resolvedState.items.length, 1),
    orientation,
    loop,
    isDisabled: (index) => resolvedState.disabledIndexes.includes(index),
    onNavigate: (index) => {
      setCurrentIndex(index);
      focusSelectedCollectionItem(collection, index);
    },
  });
  const rootContext: MenuRootContextValue = {
    ...rootContextBase,
    orientation,
    loop,
    setCurrentIndex,
    resolvedState,
    navigation,
    handleTypeaheadKeyDown: (event) => {
      const items = getMenuCollectionItems(collection);

      return handleTypeaheadKeyDown(typeaheadIdentity, event, {
        currentIndex: currentIndexState(),
        items,
        onMatch: (index) => {
          setCurrentIndex(index);
          focusSelectedCollectionItem(collection, index);
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
        {children as JSX.Element}
      </MenuRenderContext>
    </MenuRootContext>
  );
}
