import { For, state } from '@askrjs/askr';
import { controllableState } from '@askrjs/ui/foundations';
import { resolveCompoundId, resolvePartId } from '../../_internal/id';
import { toChildArray } from '../../_internal/jsx';
import { getPersistentPortal } from '../../_internal/overlay';
import {
  createDropdownMenuRenderContext,
  DropdownMenuRenderContext,
  DropdownMenuRootContext,
  readDropdownMenuRootContext,
  type DropdownMenuRootContextValue,
} from './dropdown-menu.shared';
import type { DropdownMenuProps } from './dropdown-menu.types';

function DropdownMenuRootView(props: { children?: unknown }) {
  const root = readDropdownMenuRootContext();
  const PortalHost = root.portal;
  const keyedChildren = (
    <For
      each={() => toChildArray(props.children)}
      by={(_child, index) => index}
    >
      {(child) => child as never}
    </For>
  );

  return (
    <>
      {keyedChildren}
      {PortalHost ? <PortalHost key="dropdown-menu-root-portal" /> : null}
    </>
  );
}

function DropdownMenuScopeView(props: {
  children?: unknown;
  runtimeRenderContext: ReturnType<typeof createDropdownMenuRenderContext>;
}) {
  return (
    <DropdownMenuRenderContext.Scope value={props.runtimeRenderContext}>
      <DropdownMenuRootView>{props.children}</DropdownMenuRootView>
    </DropdownMenuRenderContext.Scope>
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
  const runtimeRenderContext = createDropdownMenuRenderContext();

  return (
    <DropdownMenuRootContext.Scope value={rootContext}>
      <DropdownMenuScopeView
        children={children}
        runtimeRenderContext={runtimeRenderContext}
      />
    </DropdownMenuRootContext.Scope>
  );
}

