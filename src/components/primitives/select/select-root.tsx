import { state } from '@askrjs/askr';
import { controllableState } from '@askrjs/askr/foundations';
import { resolveCompoundId, resolvePartId } from '../../_internal/id';
import { beginMenuItemDeclaration } from '../../_internal/menu';
import { getPersistentPortal } from '../../_internal/overlay';
import {
  createSelectRenderContext,
  readSelectRootContext,
  SelectDeclarationContext,
  SelectRenderContext,
  SelectRootContext,
  type SelectRootContextValue,
} from './select.shared';
import type { SelectProps } from './select.types';

function SelectDeclarationPassView(props: {
  children?: unknown;
  selectId: string;
}) {
  beginMenuItemDeclaration(props.selectId);
  return <>{props.children}</>;
}

function SelectDeclarationContextView(props: {
  children?: unknown;
  selectId: string;
  renderContext: ReturnType<typeof createSelectRenderContext>;
}) {
  return (
    <SelectRenderContext.Scope value={props.renderContext}>
      <SelectDeclarationPassView selectId={props.selectId}>
        {props.children}
      </SelectDeclarationPassView>
    </SelectRenderContext.Scope>
  );
}

function SelectScopeView(props: {
  children?: unknown;
  name?: string;
  disabled: boolean;
  selectId: string;
  declarationRenderContext: ReturnType<typeof createSelectRenderContext>;
  runtimeRenderContext: ReturnType<typeof createSelectRenderContext>;
}) {
  return (
    <>
      <SelectDeclarationContext.Scope value={true}>
        <SelectDeclarationContextView
          selectId={props.selectId}
          renderContext={props.declarationRenderContext}
        >
          {props.children}
        </SelectDeclarationContextView>
      </SelectDeclarationContext.Scope>
      <SelectRenderContext.Scope value={props.runtimeRenderContext}>
        <SelectRootView name={props.name} disabled={props.disabled}>
          {props.children}
        </SelectRootView>
      </SelectRenderContext.Scope>
    </>
  );
}

function SelectRootView(props: {
  children?: unknown;
  name?: string;
  disabled: boolean;
}) {
  const root = readSelectRootContext();
  const PortalHost = root.portal;

  return (
    <>
      {props.children}
      {PortalHost ? <PortalHost /> : null}
      {props.name ? (
        <input
          type="hidden"
          name={props.name}
          value={root.value}
          disabled={props.disabled}
        />
      ) : null}
    </>
  );
}

export function Select(props: SelectProps) {
  const {
    children,
    id,
    value,
    defaultValue = '',
    onValueChange,
    open,
    defaultOpen = false,
    onOpenChange,
    name,
    disabled = false,
  } = props;
  const selectId = resolveCompoundId('select', id, children);
  const valueState = controllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  });
  const openState = controllableState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const currentIndexState = state(0);
  const rootContext: SelectRootContextValue = {
    selectId,
    open: openState(),
    setOpen: openState.set,
    contentId: resolvePartId(selectId, 'content'),
    portal: getPersistentPortal(selectId),
    value: valueState(),
    setValue: valueState.set,
    currentIndexCandidate: currentIndexState(),
    setCurrentIndex: currentIndexState.set,
    disabled,
  };
  const declarationRenderContext = createSelectRenderContext();
  const runtimeRenderContext = createSelectRenderContext();

  return (
    <SelectRootContext.Scope value={rootContext}>
      <SelectScopeView
        children={children}
        name={name}
        disabled={disabled}
        selectId={selectId}
        declarationRenderContext={declarationRenderContext}
        runtimeRenderContext={runtimeRenderContext}
      />
    </SelectRootContext.Scope>
  );
}