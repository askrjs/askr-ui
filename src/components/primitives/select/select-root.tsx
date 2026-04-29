import { For, state } from '@askrjs/askr';
import { controllableState } from '@askrjs/ui/foundations';
import { resolveCompoundId, resolvePartId } from '../../_internal/id';
import { collectJsxElements, toChildArray } from '../../_internal/jsx';
import { getPersistentPortal } from '../../_internal/overlay';
import { resolveMenuItemText } from '../../_internal/menu';
import { SelectItem } from './select-item';
import {
  createSelectRenderContext,
  readSelectRootContext,
  SelectRenderContext,
  SelectRootContext,
  type SelectRootContextValue,
} from './select.shared';
import type { SelectProps } from './select.types';

function SelectRootView(props: {
  children?: unknown;
  name?: string;
  disabled: boolean;
}) {
  const root = readSelectRootContext();
  const PortalHost = root.portal;
  const keyedChildren = (
    <For
      each={() => toChildArray(props.children)}
      by={(_child, index) => index}
    >
      {(child) => child as never}
    </For>
  );
  root.portal.render({ children: null });

  return (
    <>
      {keyedChildren}
      {PortalHost ? <PortalHost key="select-root-portal" /> : null}
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
  const declaredItems = collectJsxElements(
    children,
    (element) => element.type === SelectItem
  ).map((element, index) => ({
    disabled: Boolean(element.props?.disabled),
    value:
      typeof element.props?.value === 'string'
        ? element.props.value
        : undefined,
    text: resolveMenuItemText(
      element.props?.children,
      element.props?.textValue as string | undefined
    ),
  }));
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
    declaredItems,
  };
  const runtimeRenderContext = createSelectRenderContext();

  return (
    <SelectRootContext.Scope value={rootContext}>
      <SelectRenderContext.Scope value={runtimeRenderContext}>
        <SelectRootView name={name} disabled={disabled}>
          {children}
        </SelectRootView>
      </SelectRenderContext.Scope>
    </SelectRootContext.Scope>
  );
}

