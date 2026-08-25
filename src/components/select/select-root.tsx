import { cspNonce, getSignal, state } from '@askrjs/askr';
import { controllableState } from '@askrjs/askr/foundations/state';
import { formResetRef } from '../_internal/form-reset';
import { resolveCompoundId, resolvePartId } from '../_internal/id';
import { collectJsxElements } from '../_internal/jsx';
import {
  captureOverlayNonce,
  createOverlayIdentity,
  getOverlayNodes,
  getPersistentPortal,
  setOverlayStackActive,
} from '../_internal/overlay';
import {
  focusCollectionItemWithRestore,
  restorePendingCollectionItemFocus,
  type PendingCollectionFocus,
} from '../_internal/focus';
import { VirtualCompositeOwnerContext } from '../_internal/virtual-composite';
import {
  observeMenuCollectionCount,
  resolveMenuItemText,
} from '../_internal/menu';
import {
  handleTypeaheadKeyDown,
  handleTypeaheadKeyUp,
  registerTypeaheadCleanup,
  resetTypeahead,
} from '../_internal/typeahead';
import { SelectItem } from './select-item';
import {
  createSelectRenderContext,
  SelectRenderContext,
  SelectRootContext,
  resolveSelectState,
  type SelectRootContextValue,
} from './select.shared';
import type { SelectProps } from './select.types';

/**
 * Renders a part of `select`.
 */
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
  const overlayIdentity = state(createOverlayIdentity())();
  const cleanupSignal = getSignal();
  captureOverlayNonce(overlayIdentity, cspNonce());
  registerTypeaheadCleanup(overlayIdentity, cleanupSignal);
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
  const resetRef = formResetRef<Element>(() => {
    if (value === undefined && valueState() !== defaultValue) {
      valueState.set(defaultValue);
    }
  });
  setOverlayStackActive(overlayIdentity, openState(), cleanupSignal);
  const declaredItems = collectJsxElements(
    children,
    (element) => element.type === SelectItem
  ).map((element, index) => ({
    index,
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
  const declaredSelectedIndex = declaredItems.findIndex(
    (item) => item.value === valueState()
  );
  const currentIndexState = state(
    declaredSelectedIndex >= 0 ? declaredSelectedIndex : 0
  );
  const pendingFocus = state<PendingCollectionFocus>({ index: null })();
  const setCurrentIndex = (index: number) => {
    if (currentIndexState() !== index) {
      currentIndexState.set(index);
    }
  };
  const rootContextBase = {
    selectId,
    overlayIdentity,
    value: valueState(),
    open: openState(),
    currentIndexCandidate: currentIndexState(),
    disabled,
    bindFormReset: resetRef,
    declaredItems,
  };
  const collection = observeMenuCollectionCount(selectId);
  const resolvedState = resolveSelectState(rootContextBase);
  const focusItem = (index: number) => {
    const itemValue = resolvedState.items.find(
      (item) => item.index === index
    )?.value;
    const resolveNode =
      itemValue === undefined
        ? undefined
        : () =>
            document.getElementById(
              resolvePartId(selectId, `item-${itemValue}`)
            );
    const focus = () => {
      focusCollectionItemWithRestore(
        pendingFocus,
        collection,
        index,
        resolveNode
      );
    };
    const mounted =
      resolveNode?.() ??
      collection.items().find((item) => item.metadata.index === index)?.node;
    if (mounted) focus();
    else queueMicrotask(focus);
  };
  const setOpen = (nextOpen: boolean) => {
    resetTypeahead(overlayIdentity);

    if (nextOpen && !openState()) {
      const liveClosedState = resolveSelectState({
        ...rootContextBase,
        value: valueState(),
        open: false,
        currentIndexCandidate: currentIndexState(),
      });
      setCurrentIndex(liveClosedState.currentIndex);
    }

    openState.set(nextOpen);
  };
  const rootContext: SelectRootContextValue = {
    ...rootContextBase,
    open: openState(),
    setOpen,
    contentId: resolvePartId(selectId, 'content'),
    portal: getPersistentPortal(overlayIdentity),
    setValue: valueState.set,
    setCurrentIndex,
    focusItem,
    restoreItemFocus: (index, node) => {
      restorePendingCollectionItemFocus(pendingFocus, index, node);
    },
    resolvedState,
    handleTypeaheadKeyDown: (event) =>
      handleTypeaheadKeyDown(overlayIdentity, event, {
        currentIndex: resolvedState.items.findIndex(
          (item) => item.index === resolvedState.currentIndex
        ),
        items: resolvedState.items,
        onMatch: (matchIndex) => {
          const item = resolvedState.items[matchIndex];
          const index = item?.index;
          if (index === undefined) return;
          setCurrentIndex(index);

          if (openState()) {
            focusItem(index);
          } else if (item?.value !== undefined) {
            const trigger = getOverlayNodes(overlayIdentity).trigger;
            const restoreTriggerFocus = trigger === document.activeElement;
            valueState.set(item.value);

            if (restoreTriggerFocus) {
              queueMicrotask(() => {
                queueMicrotask(() => {
                  getOverlayNodes(overlayIdentity).trigger?.focus();
                });
              });
            }
          }
        },
      }),
    handleTypeaheadKeyUp: (event) =>
      handleTypeaheadKeyUp(overlayIdentity, event),
  };
  const runtimeRenderContext = createSelectRenderContext();
  const PortalHost = rootContext.portal;

  // Keep the persistent portal host synchronized before rendering the root surface.
  PortalHost.render({ children: null });

  return (
    <SelectRootContext value={rootContext}>
      <SelectRenderContext value={runtimeRenderContext}>
        <VirtualCompositeOwnerContext value>
          <>
            {children as JSX.Element}
            <PortalHost key="select-root-portal" />
            {name ? (
              <input
                type="hidden"
                name={name}
                value={rootContext.value}
                disabled={disabled}
              />
            ) : null}
          </>
        </VirtualCompositeOwnerContext>
      </SelectRenderContext>
    </SelectRootContext>
  );
}
