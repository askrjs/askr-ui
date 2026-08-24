import { nativeButtonProps } from '../_internal/native-control';
import { state } from '@askrjs/askr';
import { Presence, Slot } from '@askrjs/askr/foundations/structures';
import { composeRefs, mergeProps } from '@askrjs/askr/foundations/utilities';
import { pressable, rovingFocus } from '@askrjs/askr/foundations/interactions';
import {
  compositeItemFocusProps,
  focusSelectedCollectionItem,
  repairFocusForDisabledItem,
  restorePendingCollectionItemFocus,
  type PendingCollectionFocus,
} from '../_internal/focus';
import { runCancelablePress } from '../_internal/press';
import {
  getCompositeCollectionItems,
  observeCompositeCollection,
  registerCompositeNode,
} from '../_internal/composite';
import {
  isDisclosureValueOpen,
  toggleDisclosureValue,
} from '../_internal/disclosure';
import { resolveCompoundId, resolvePartId } from '../_internal/id';
import type {
  AccordionContentAsChildProps,
  AccordionContentProps,
  AccordionHeaderAsChildProps,
  AccordionHeaderProps,
  AccordionItemProps,
  AccordionMultipleProps,
  AccordionProps,
  AccordionSingleProps,
  AccordionTriggerAsChildProps,
  AccordionTriggerProps,
} from './accordion.types';
import {
  AccordionItemContext,
  AccordionRenderContext,
  AccordionRootContext,
  createAccordionRenderContext,
  readAccordionItemContext,
  readAccordionRenderContext,
  readAccordionRootContext,
  type AccordionRootContextValue,
} from './accordion.shared';

function resolveVirtualAccordionPlacement(node: HTMLElement): {
  index: number;
  setSize?: number;
} | null {
  const listRow = node.closest<HTMLElement>(
    '[data-slot="virtual-list-row"][data-index]'
  );
  if (listRow) {
    const index = Number(listRow.dataset.index);
    const setSize = Number(listRow.getAttribute('aria-setsize'));
    return Number.isInteger(index)
      ? { index, setSize: Number.isInteger(setSize) ? setSize : undefined }
      : null;
  }

  const tableRow = node.closest<HTMLElement>(
    '[data-slot="virtual-table-row"][data-row-index]'
  );
  if (!tableRow) {
    return null;
  }
  const index = Number(tableRow.dataset.rowIndex);
  const rowCount = Number(
    tableRow
      .closest('[data-slot="virtual-table"]')
      ?.querySelector('[role="grid"]')
      ?.getAttribute('aria-rowcount')
  );
  return Number.isInteger(index)
    ? {
        index,
        setSize: Number.isInteger(rowCount)
          ? Math.max(0, rowCount - 1)
          : undefined,
      }
    : null;
}

function focusAccordionItem(
  collection: AccordionRootContextValue['collection'],
  pendingFocus: PendingCollectionFocus,
  index: number
) {
  if (focusSelectedCollectionItem(collection, index)) {
    pendingFocus.index = null;
    return;
  }

  pendingFocus.index = index;
  const active =
    document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
  const row = active?.closest<HTMLElement>(
    '[data-slot="virtual-list-row"], [data-slot="virtual-table-row"]'
  );
  const viewport = row?.closest<HTMLElement>(
    '[data-slot="virtual-list"], [data-slot="virtual-table"]'
  );
  const rowHeight = Number(
    row?.getAttribute('data-askr-virtual-list-row-height') ??
      row?.getAttribute('data-askr-virtual-table-row-height')
  );
  if (viewport && Number.isFinite(rowHeight) && rowHeight > 0) {
    viewport.scrollTop = index * rowHeight;
    viewport.dispatchEvent(new Event('scroll'));
  }
}

/**
 * Renders a part of `accordion`.
 */
export function Accordion(props: AccordionProps) {
  const {
    children,
    collapsible = false,
    id,
    loop = true,
    orientation = 'vertical',
    ref,
    type = 'single',
    value: _value,
    defaultValue: _defaultValue,
    onValueChange: _onValueChange,
    ...rest
  } = props;
  const accordionId = resolveCompoundId('accordion', id, children);
  const isControlled =
    type === 'multiple'
      ? (props as AccordionMultipleProps).value !== undefined
      : (props as AccordionSingleProps).value !== undefined;
  const internalValueState = state(
    type === 'multiple'
      ? ((props as AccordionMultipleProps).defaultValue ?? [])
      : ((props as AccordionSingleProps).defaultValue ?? '')
  );
  internalValueState();
  const valueState = (() => {
    const read = () => {
      if (type === 'multiple') {
        return isControlled
          ? ((props as AccordionMultipleProps).value ?? [])
          : internalValueState();
      }

      return isControlled
        ? ((props as AccordionSingleProps).value ?? '')
        : internalValueState();
    };

    read.set = (
      nextOrUpdater:
        | string
        | string[]
        | ((prev: string | string[]) => string | string[])
    ) => {
      const prev = read();
      const next =
        typeof nextOrUpdater === 'function'
          ? (nextOrUpdater as (prev: string | string[]) => string | string[])(
              prev
            )
          : nextOrUpdater;

      if (Object.is(prev, next)) {
        return;
      }

      if (type === 'multiple') {
        const nextValue = Array.isArray(next) ? next : next ? [next] : [];

        if (isControlled) {
          (props as AccordionMultipleProps).onValueChange?.(nextValue);
          return;
        }

        internalValueState.set(nextValue);
        (props as AccordionMultipleProps).onValueChange?.(nextValue);
        return;
      }

      const nextValue = Array.isArray(next)
        ? (next[0] ?? '')
        : String(next ?? '');

      if (isControlled) {
        (props as AccordionSingleProps).onValueChange?.(nextValue);
        return;
      }

      internalValueState.set(nextValue);
      (props as AccordionSingleProps).onValueChange?.(nextValue);
    };

    return read as typeof read & {
      set(
        nextOrUpdater:
          | string
          | string[]
          | ((prev: string | string[]) => string | string[])
      ): void;
    };
  })();
  const collection = observeCompositeCollection(accordionId);
  const items = getCompositeCollectionItems(collection).filter(
    (item): item is typeof item & { value: string } =>
      typeof item.value === 'string'
  );
  const currentOpenItem = items.find((item) =>
    isDisclosureValueOpen(type, valueState(), item.value)
  );
  const currentIndexState = state(0);
  const fallbackItem = items.find((item) => !item.disabled);
  const fallbackIndex = fallbackItem?.index ?? 0;
  const candidateIndex = currentIndexState();
  const candidateItem = items.find((item) => item.index === candidateIndex);
  const currentIndex =
    currentOpenItem && !currentOpenItem.disabled
      ? currentOpenItem.index
      : candidateItem && !candidateItem.disabled
        ? candidateIndex
        : fallbackIndex;
  const disabledIndexList = items
    .filter((item) => item.disabled)
    .map((item) => item.index);
  const itemCount = items.reduce(
    (count, item) => Math.max(count, item.setSize ?? item.index + 1),
    items.length
  );
  const pendingFocus = state<PendingCollectionFocus>({ index: null })();
  const currentValue = valueState();
  const setValue: AccordionRootContextValue['setValue'] = (nextValue) => {
    if (type === 'multiple') {
      (valueState.set as (value: string[]) => void)(
        Array.isArray(nextValue) ? nextValue : nextValue ? [nextValue] : []
      );
      return;
    }

    (valueState.set as (value: string) => void)(
      Array.isArray(nextValue) ? (nextValue[0] ?? '') : nextValue
    );
  };
  const rootContext: AccordionRootContextValue = {
    accordionId,
    type,
    value: currentValue,
    setValue,
    orientation,
    loop,
    collapsible,
    currentIndex,
    setCurrentIndex: currentIndexState.set,
    disabledIndexes: disabledIndexList,
    itemCount,
    collection,
    pendingFocus,
  };
  const renderContext = createAccordionRenderContext();
  const finalProps = mergeProps(rest, {
    ref,
    'data-slot': 'accordion',
    'data-accordion': 'true',
    'data-orientation': orientation,
  });
  const nav = rovingFocus({
    currentIndex,
    itemCount: Math.max(itemCount, 1),
    orientation,
    loop,
    isDisabled: (index) => disabledIndexList.includes(index),
    onNavigate: (index) => {
      focusAccordionItem(collection, pendingFocus, index);
      currentIndexState.set(index);
    },
  });
  const mergedProps = mergeProps(finalProps, nav.container);

  return (
    <AccordionRootContext value={rootContext}>
      <AccordionRenderContext value={renderContext}>
        <div {...mergedProps}>{children}</div>
      </AccordionRenderContext>
    </AccordionRootContext>
  );
}

/**
 * Renders the `accordion-item` part of `accordion`.
 */
export function AccordionItem(props: AccordionItemProps): JSX.Element {
  const { children, disabled = false, ref, value, ...rest } = props;
  const root = readAccordionRootContext();
  const renderContext = readAccordionRenderContext();
  const placement = state<{ index: number; setSize?: number }>({
    index: -1,
  })();
  if (placement.index < 0) {
    placement.index = renderContext.claimItemIndex();
  }
  const itemIndex = placement.index;
  const itemId = resolvePartId(root.accordionId, `item-${value}`);
  const triggerId = resolvePartId(itemId, 'trigger');
  const contentId = resolvePartId(itemId, 'content');
  const itemDisabled = Boolean(disabled);
  const open = isDisclosureValueOpen(root.type, root.value, value);
  const itemContext = {
    accordionId: root.accordionId,
    itemIndex,
    itemSetSize: placement.setSize,
    itemValue: value,
    itemDisabled,
    itemId,
    triggerId,
    contentId,
  };
  const finalProps = mergeProps(rest, {
    ref: composeRefs(ref, (node: HTMLDivElement | null) => {
      if (!node) {
        return;
      }
      const nextPlacement = resolveVirtualAccordionPlacement(node);
      if (nextPlacement) {
        placement.index = nextPlacement.index;
        placement.setSize = nextPlacement.setSize;
      }
    }),
    id: itemId,
    'data-slot': 'accordion-item',
    'data-state': open ? 'open' : 'closed',
    'data-disabled': itemDisabled ? 'true' : undefined,
    'data-orientation': root.orientation,
  });

  return (
    <AccordionItemContext value={itemContext}>
      <div {...finalProps}>{children}</div>
    </AccordionItemContext>
  );
}

/**
 * Renders the `accordion-header` part of `accordion`.
 *
 * Supports polymorphic rendering via `asChild`.
 */
export function AccordionHeader(props: AccordionHeaderProps): JSX.Element;
export function AccordionHeader(
  props: AccordionHeaderAsChildProps
): JSX.Element;
export function AccordionHeader(
  props: AccordionHeaderProps | AccordionHeaderAsChildProps
) {
  const { asChild, children, ref, ...rest } = props;
  const finalProps = mergeProps(rest, {
    ref,
    'data-slot': 'accordion-header',
    'data-accordion-header': 'true',
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return <h3 {...finalProps}>{children}</h3>;
}

/**
 * Renders the `accordion-trigger` part of `accordion`.
 *
 * Supports polymorphic rendering via `asChild`.
 */
export function AccordionTrigger(props: AccordionTriggerProps): JSX.Element;
export function AccordionTrigger(
  props: AccordionTriggerAsChildProps
): JSX.Element;
export function AccordionTrigger(
  props: AccordionTriggerProps | AccordionTriggerAsChildProps
) {
  const {
    asChild,
    children,
    disabled = false,
    onPress,
    ref,
    type: typeProp,
    ...rest
  } = props;
  const root = readAccordionRootContext();
  const item = readAccordionItemContext();
  const collection = root.collection;
  const nav = rovingFocus({
    currentIndex: root.currentIndex,
    itemCount: Math.max(root.itemCount, 1),
    orientation: root.orientation,
    loop: root.loop,
    isDisabled: (index) => root.disabledIndexes.includes(index),
    onNavigate: (index) => {
      focusAccordionItem(collection, root.pendingFocus, index);
      root.setCurrentIndex(index);
    },
  });
  const open = isDisclosureValueOpen(root.type, root.value, item.itemValue);
  const isDisabled = disabled || item.itemDisabled;
  const interactionProps = pressable({
    disabled: isDisabled,
    onPress: (event) => {
      runCancelablePress(event, onPress, () => {
        root.setValue(
          toggleDisclosureValue(
            root.type,
            root.value,
            item.itemValue,
            root.collapsible
          )
        );
        root.setCurrentIndex(item.itemIndex);
      });
    },
    isNativeButton: !asChild,
  });
  const itemFocusProps = nav.item(item.itemIndex);
  const focusRepairProps = compositeItemFocusProps();
  const registrationOwner = {};
  const finalProps = mergeProps(rest, {
    ...interactionProps,
    ...itemFocusProps,
    ref: composeRefs(
      ref as
        | ((value: HTMLElement | null) => void)
        | { current: HTMLElement | null }
        | null
        | undefined,
      (node: HTMLElement | null) => {
        const nextPlacement = node
          ? resolveVirtualAccordionPlacement(node)
          : null;
        if (nextPlacement) {
          item.itemIndex = nextPlacement.index;
          item.itemSetSize = nextPlacement.setSize;
        }
        registerCompositeNode(
          item.triggerId,
          collection,
          node,
          {
            index: item.itemIndex,
            setSize: item.itemSetSize,
            disabled: isDisabled,
            value: item.itemValue,
          },
          registrationOwner
        );
        repairFocusForDisabledItem({
          collection,
          disabled: isDisabled,
          index: item.itemIndex,
          loop: root.loop,
          node,
          setCurrentIndex: root.setCurrentIndex,
        });
        restorePendingCollectionItemFocus(
          root.pendingFocus,
          item.itemIndex,
          node
        );
      }
    ),
    id: item.triggerId,
    'data-slot': 'accordion-trigger',
    'aria-controls': item.contentId,
    'aria-expanded': open ? 'true' : 'false',
    'data-state': open ? 'open' : 'closed',
    'data-disabled': isDisabled ? 'true' : undefined,
    tabIndex: isDisabled ? -1 : 0,
    ...focusRepairProps,
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return (
    <button type={typeProp ?? 'button'} {...nativeButtonProps(finalProps)}>
      {children}
    </button>
  );
}

/**
 * Renders the `accordion-content` part of `accordion` with `role="region"`.
 *
 * Supports polymorphic rendering via `asChild`.
 */
export function AccordionContent(
  props: AccordionContentProps
): JSX.Element | null;
export function AccordionContent(
  props: AccordionContentAsChildProps
): JSX.Element | null;
export function AccordionContent(
  props: AccordionContentProps | AccordionContentAsChildProps
) {
  const { asChild, children, forceMount = false, ref, ...rest } = props;
  const root = readAccordionRootContext();
  const item = readAccordionItemContext();
  const open = isDisclosureValueOpen(root.type, root.value, item.itemValue);
  const finalProps = mergeProps(rest, {
    ref,
    id: item.contentId,
    role: 'region',
    'aria-labelledby': item.triggerId,
    'data-slot': 'accordion-content',
    'data-state': open ? 'open' : 'closed',
  });

  return (
    <Presence present={forceMount || open}>
      {asChild ? (
        <Slot asChild {...finalProps} children={children} />
      ) : (
        <div {...finalProps}>{children}</div>
      )}
    </Presence>
  );
}
