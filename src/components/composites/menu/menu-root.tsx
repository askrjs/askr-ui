import { state } from '@askrjs/askr';
import { resolveCompoundId } from '../../_internal/id';
import {
  createMenuRenderContext,
  MenuRenderContext,
  MenuRootContext,
  type MenuRootContextValue,
} from './menu.shared';
import type { MenuProps } from './menu.types';

export function Menu(props: MenuProps) {
  const { children, id, orientation = 'vertical', loop = true } = props;
  const menuId = resolveCompoundId('menu', id, children);
  const currentIndexState = state(0);
  const rootContext: MenuRootContextValue = {
    menuId,
    orientation,
    loop,
    currentIndexCandidate: currentIndexState(),
    setCurrentIndex: currentIndexState.set,
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
