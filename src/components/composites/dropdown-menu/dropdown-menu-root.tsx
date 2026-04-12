import { state } from '@askrjs/askr';
import { controllableState } from '@askrjs/askr/foundations';
import { resolveCompoundId, resolvePartId } from '../../_internal/id';
import { beginMenuItemDeclaration } from '../../_internal/menu';
import { getPersistentPortal } from '../../_internal/overlay';
import {
  createDropdownMenuRenderContext,
  DropdownMenuDeclarationContext,
  DropdownMenuRenderContext,
  DropdownMenuRootContext,
  readDropdownMenuRootContext,
  type DropdownMenuRootContextValue,
} from './dropdown-menu.shared';
import type { DropdownMenuProps } from './dropdown-menu.types';

function DropdownMenuDeclarationPassView(props: {
  children?: unknown;
  dropdownMenuId: string;
}) {
  beginMenuItemDeclaration(props.dropdownMenuId);
  return <>{props.children}</>;
}

function DropdownMenuDeclarationContextView(props: {
  children?: unknown;
  dropdownMenuId: string;
  renderContext: ReturnType<typeof createDropdownMenuRenderContext>;
}) {
  return (
    <DropdownMenuRenderContext.Scope value={props.renderContext}>
      <DropdownMenuDeclarationPassView dropdownMenuId={props.dropdownMenuId}>
        {props.children}
      </DropdownMenuDeclarationPassView>
    </DropdownMenuRenderContext.Scope>
  );
}

function DropdownMenuRootView(props: { children?: unknown }) {
  const root = readDropdownMenuRootContext();
  const PortalHost = root.portal;

  return (
    <>
      {props.children}
      {PortalHost ? <PortalHost /> : null}
    </>
  );
}

function DropdownMenuScopeView(props: {
  children?: unknown;
  dropdownMenuId: string;
  declarationRenderContext: ReturnType<typeof createDropdownMenuRenderContext>;
  runtimeRenderContext: ReturnType<typeof createDropdownMenuRenderContext>;
}) {
  return (
    <>
      <DropdownMenuDeclarationContext.Scope value={true}>
        <DropdownMenuDeclarationContextView
          dropdownMenuId={props.dropdownMenuId}
          renderContext={props.declarationRenderContext}
        >
          {props.children}
        </DropdownMenuDeclarationContextView>
      </DropdownMenuDeclarationContext.Scope>
      <DropdownMenuRenderContext.Scope value={props.runtimeRenderContext}>
        <DropdownMenuRootView>{props.children}</DropdownMenuRootView>
      </DropdownMenuRenderContext.Scope>
    </>
  );
}

export function DropdownMenu(props: DropdownMenuProps) {
  const { children, id, open, defaultOpen = false, onOpenChange } = props;
  const openState = controllableState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const dropdownMenuId = resolveCompoundId('dropdown-menu', id, children);
  const currentIndexState = state(0);
  const rootContext: DropdownMenuRootContextValue = {
    dropdownMenuId,
    open: openState(),
    setOpen: openState.set,
    contentId: resolvePartId(dropdownMenuId, 'content'),
    portal: getPersistentPortal(dropdownMenuId),
    currentIndexCandidate: currentIndexState(),
    setCurrentIndex: currentIndexState.set,
  };
  const declarationRenderContext = createDropdownMenuRenderContext();
  const runtimeRenderContext = createDropdownMenuRenderContext();

  return (
    <DropdownMenuRootContext.Scope value={rootContext}>
      <DropdownMenuScopeView
        children={children}
        dropdownMenuId={dropdownMenuId}
        declarationRenderContext={declarationRenderContext}
        runtimeRenderContext={runtimeRenderContext}
      />
    </DropdownMenuRootContext.Scope>
  );
}
