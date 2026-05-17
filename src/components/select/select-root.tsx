import { state } from '@askrjs/askr';
import { controllableState } from '@askrjs/askr/foundations/state';
import { resolveCompoundId, resolvePartId } from '../_internal/id';
import { collectJsxElements } from '../_internal/jsx';
import { getPersistentPortal } from '../_internal/overlay';
import { resolveMenuItemText } from '../_internal/menu';
import { SelectItem } from './select-item';
import {
  createSelectRenderContext,
  SelectRenderContext,
  SelectRootContext,
  resolveSelectState,
  type SelectRootContextValue,
} from './select.shared';
import type { SelectProps } from './select.types';

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
  ).map((element) => ({
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
  const rootContextBase = {
    selectId,
    value: valueState(),
    currentIndexCandidate: currentIndexState(),
    disabled,
    declaredItems,
  };
  const resolvedState = resolveSelectState(rootContextBase);
  const rootContext: SelectRootContextValue = {
    ...rootContextBase,
    open: openState(),
    setOpen: openState.set,
    contentId: resolvePartId(selectId, 'content'),
    portal: getPersistentPortal(selectId),
    setValue: valueState.set,
    setCurrentIndex: currentIndexState.set,
    resolvedState,
  };
  const runtimeRenderContext = createSelectRenderContext();
  const PortalHost = rootContext.portal;

  // Keep the persistent portal host synchronized before rendering the root surface.
  PortalHost.render({ children: null });

  return (
    <SelectRootContext.Scope value={rootContext}>
      <SelectRenderContext.Scope value={runtimeRenderContext}>
        <>
          {children}
          {PortalHost ? <PortalHost key="select-root-portal" /> : null}
          {name ? (
            <input
              type="hidden"
              name={name}
              value={rootContext.value}
              disabled={disabled}
            />
          ) : null}
        </>
      </SelectRenderContext.Scope>
    </SelectRootContext.Scope>
  );
}
