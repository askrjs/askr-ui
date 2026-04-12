import { state } from '@askrjs/askr';
import { resolveCompoundId } from '../../_internal/id';
import { beginMenuItemDeclaration } from '../../_internal/menu';
import {
  createMenuRenderContext,
  MenuDeclarationContext,
  MenuRenderContext,
  MenuRootContext,
  type MenuRootContextValue,
} from './menu.shared';
import type { MenuProps } from './menu.types';

function MenuDeclarationPassView(props: {
  children?: unknown;
  menuId: string;
}) {
  beginMenuItemDeclaration(props.menuId);
  return <>{props.children}</>;
}

function MenuDeclarationContextView(props: {
  children?: unknown;
  menuId: string;
  renderContext: ReturnType<typeof createMenuRenderContext>;
}) {
  return (
    <MenuRenderContext.Scope value={props.renderContext}>
      <MenuDeclarationPassView menuId={props.menuId}>
        {props.children}
      </MenuDeclarationPassView>
    </MenuRenderContext.Scope>
  );
}

function MenuRuntimeView(props: { children?: unknown }) {
  return <>{props.children}</>;
}

function MenuScopeView(props: {
  children?: unknown;
  menuId: string;
  declarationRenderContext: ReturnType<typeof createMenuRenderContext>;
  runtimeRenderContext: ReturnType<typeof createMenuRenderContext>;
}) {
  return (
    <>
      <MenuDeclarationContext.Scope value={true}>
        <MenuDeclarationContextView
          menuId={props.menuId}
          renderContext={props.declarationRenderContext}
        >
          {props.children}
        </MenuDeclarationContextView>
      </MenuDeclarationContext.Scope>
      <MenuRenderContext.Scope value={props.runtimeRenderContext}>
        <MenuRuntimeView>{props.children}</MenuRuntimeView>
      </MenuRenderContext.Scope>
    </>
  );
}

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
  const declarationRenderContext = createMenuRenderContext();
  const runtimeRenderContext = createMenuRenderContext();

  return (
    <MenuRootContext.Scope value={rootContext}>
      <MenuScopeView
        children={children}
        menuId={menuId}
        declarationRenderContext={declarationRenderContext}
        runtimeRenderContext={runtimeRenderContext}
      />
    </MenuRootContext.Scope>
  );
}