import { cspNonce, state } from '@askrjs/askr';
import { controllableState } from '@askrjs/askr/foundations/state';
import { resolveCompoundId, resolvePartId } from '../_internal/id';
import {
  captureOverlayNonce,
  createOverlayIdentity,
  getPersistentPortal,
} from '../_internal/overlay';
import {
  createDropdownRenderContext,
  DropdownRenderContext,
  DropdownRootContext,
  resolveDropdownState,
  type DropdownRootContextValue,
} from './dropdown.shared';
import type { DropdownProps } from './dropdown.types';

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
  const currentIndexState = state(0);
  const rootContextBase = {
    dropdownId,
    overlayIdentity,
    currentIndexCandidate: currentIndexState(),
  };
  const resolvedState = resolveDropdownState(rootContextBase);
  const rootContext: DropdownRootContextValue = {
    ...rootContextBase,
    open: openState(),
    setOpen: openState.set,
    contentId: resolvePartId(dropdownId, 'content'),
    portal: getPersistentPortal(overlayIdentity),
    setCurrentIndex: currentIndexState.set,
    resolvedState,
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
