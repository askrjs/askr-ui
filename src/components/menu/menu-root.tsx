import { state } from '@askrjs/askr';
import { rovingFocus } from '@askrjs/askr/foundations';
import { resolveCompoundId } from '../_internal/id';
import { focusSelectedCollectionItem } from '../_internal/focus';
import { getMenuCollection } from '../_internal/menu';
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
      currentIndexState.set(index);
      focusSelectedCollectionItem(collection, index);
    },
  });
  const rootContext: MenuRootContextValue = {
    ...rootContextBase,
    orientation,
    loop,
    setCurrentIndex: currentIndexState.set,
    resolvedState,
    navigation,
  };
  const renderContext = createMenuRenderContext();

  return (
    <MenuRootContext.Scope value={rootContext}>
      <MenuRenderContext.Scope value={renderContext}>
        {children}
      </MenuRenderContext.Scope>
    </MenuRootContext.Scope>
  );
}
