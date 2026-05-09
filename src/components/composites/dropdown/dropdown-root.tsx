import { For, state } from '@askrjs/askr';
import { controllableState } from '@askrjs/askr/foundations';
import { resolveCompoundId, resolvePartId } from '../../_internal/id';
import { toChildArray } from '../../_internal/jsx';
import { getPersistentPortal } from '../../_internal/overlay';
import {
  createDropdownRenderContext,
  DropdownRenderContext,
  DropdownRootContext,
  readDropdownRootContext,
  type DropdownRootContextValue,
} from './dropdown.shared';
import type { DropdownProps } from './dropdown.types';

function DropdownRootView(props: { children?: unknown }) {
  const root = readDropdownRootContext();
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
      {PortalHost ? <PortalHost key="dropdown-root-portal" /> : null}
    </>
  );
}

function DropdownScopeView(props: {
  children?: unknown;
  runtimeRenderContext: ReturnType<typeof createDropdownRenderContext>;
}) {
  return (
    <DropdownRenderContext.Scope value={props.runtimeRenderContext}>
      <DropdownRootView>{props.children}</DropdownRootView>
    </DropdownRenderContext.Scope>
  );
}

export function Dropdown(props: DropdownProps) {
  const { children, id, open, defaultOpen = false, onOpenChange } = props;
  const openState = controllableState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const dropdownId = resolveCompoundId('dropdown', id, children);
  const currentIndexState = state(0);
  const rootContext: DropdownRootContextValue = {
    dropdownId,
    open: openState(),
    setOpen: openState.set,
    contentId: resolvePartId(dropdownId, 'content'),
    portal: getPersistentPortal(dropdownId),
    currentIndexCandidate: currentIndexState(),
    setCurrentIndex: currentIndexState.set,
  };
  const runtimeRenderContext = createDropdownRenderContext();

  return (
    <DropdownRootContext.Scope value={rootContext}>
      <DropdownScopeView
        children={children}
        runtimeRenderContext={runtimeRenderContext}
      />
    </DropdownRootContext.Scope>
  );
}
