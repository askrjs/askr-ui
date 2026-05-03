import { state } from '@askrjs/askr';
import {
  Presence,
  Slot,
  composeRefs,
  mergeProps,
  pressable,
  rovingFocus,
} from '@askrjs/askr/foundations';
import { focusSelectedCollectionItem } from '../../_internal/focus';
import {
  disabledIndexes,
  firstEnabledCompositeIndex,
  getCompositeCollection,
  getCompositeCollectionItems,
  registerCompositeNode,
} from '../../_internal/composite';
import {
  isDisclosureValueOpen,
  toggleDisclosureValue,
} from '../../_internal/disclosure';
import { resolveCompoundId, resolvePartId } from '../../_internal/id';
import { isJsxElement, toChildArray } from '../../_internal/jsx';
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

function AccordionRootView(props: {
  children?: unknown;
  finalProps: Record<string, unknown>;
}) {
  const keyedChildren = toChildArray(props.children).map((child, index) => {
    if (!isJsxElement(child) || child.key != null) {
      return child;
    }

    return {
      ...child,
      key: `accordion-root-${index}`,
    };
  });

  return <div {...props.finalProps}>{keyedChildren}</div>;
}

function AccordionItemView(props: {
  children?: unknown;
  finalProps: Record<string, unknown>;
}) {
  const keyedChildren = toChildArray(props.children).map((child, index) => {
    if (!isJsxElement(child) || child.key != null) {
      return child;
    }

    return {
      ...child,
      key: `accordion-item-${index}`,
    };
  });

  return <div {...props.finalProps}>{keyedChildren}</div>;
}

export function Accordion(props: AccordionProps) {
  const {
    children,
    collapsible = false,
    id,
    loop = true,
    orientation = 'vertical',
    ref,
    type = 'single',
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
  const collection = getCompositeCollection(accordionId);
  const items = getCompositeCollectionItems(collection).filter(
    (item): item is typeof item & { value: string } =>
      typeof item.value === 'string'
  );
  const currentOpenIndex = items.findIndex((item) =>
    isDisclosureValueOpen(type, valueState(), item.value)
  );
  const currentIndexState = state(0);
  const fallbackIndex = firstEnabledCompositeIndex(items);
  const candidateIndex = currentIndexState();
  const currentIndex =
    currentOpenIndex >= 0 && !items[currentOpenIndex]?.disabled
      ? currentOpenIndex
      : items[candidateIndex] && !items[candidateIndex]?.disabled
        ? candidateIndex
        : fallbackIndex;
  const disabledIndexList = disabledIndexes(items);
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
    value: valueState(),
    setValue,
    orientation,
    loop,
    collapsible,
    currentIndex,
    setCurrentIndex: currentIndexState.set,
    disabledIndexes: disabledIndexList,
    itemCount: items.length,
    collection,
  };
  const renderContext = createAccordionRenderContext();
  const finalProps = mergeProps(rest, {
    ref,
    'data-slot': 'accordion',
    'data-accordion': 'true',
    'data-orientation': orientation,
  });

  return (
    <AccordionRootContext.Scope value={rootContext}>
      <AccordionRenderContext.Scope value={renderContext}>
        <AccordionRootView finalProps={finalProps}>
          {children}
        </AccordionRootView>
      </AccordionRenderContext.Scope>
    </AccordionRootContext.Scope>
  );
}

export function AccordionItem(props: AccordionItemProps): JSX.Element {
  const { children, disabled = false, ref, value, ...rest } = props;
  const root = readAccordionRootContext();
  const renderContext = readAccordionRenderContext();
  const itemIndex = renderContext.claimItemIndex();
  const itemId = resolvePartId(root.accordionId, `item-${itemIndex}`);
  const triggerId = resolvePartId(itemId, 'trigger');
  const contentId = resolvePartId(itemId, 'content');
  const itemDisabled = Boolean(disabled);
  const open = isDisclosureValueOpen(root.type, root.value, value);
  const itemContext = {
    accordionId: root.accordionId,
    itemIndex,
    itemValue: value,
    itemDisabled,
    itemId,
    triggerId,
    contentId,
  };
  const finalProps = mergeProps(rest, {
    ref,
    id: itemId,
    'data-slot': 'accordion-item',
    'data-state': open ? 'open' : 'closed',
    'data-disabled': itemDisabled ? 'true' : undefined,
    'data-orientation': root.orientation,
  });

  return (
    <AccordionItemContext.Scope value={itemContext}>
      <AccordionItemView finalProps={finalProps}>{children}</AccordionItemView>
    </AccordionItemContext.Scope>
  );
}

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
      root.setCurrentIndex(index);
      focusSelectedCollectionItem(collection, index);
    },
  });
  const open = isDisclosureValueOpen(root.type, root.value, item.itemValue);
  const isDisabled = disabled || item.itemDisabled;
  const interactionProps = pressable({
    disabled: isDisabled,
    onPress: (event) => {
      onPress?.(event);

      if (!event.defaultPrevented) {
        root.setValue(
          toggleDisclosureValue(
            root.type,
            root.value,
            item.itemValue,
            root.collapsible
          )
        );
        root.setCurrentIndex(item.itemIndex);
      }
    },
    isNativeButton: !asChild,
  });
  const finalProps = mergeProps(rest, {
    ...interactionProps,
    ...nav.item(item.itemIndex),
    ref: composeRefs(
      ref as
        | ((value: HTMLElement | null) => void)
        | { current: HTMLElement | null }
        | null
        | undefined,
      (node: HTMLElement | null) => {
        registerCompositeNode(item.triggerId, collection, node, {
          index: item.itemIndex,
          disabled: isDisabled,
          value: item.itemValue,
        });
      }
    ),
    id: item.triggerId,
    'data-slot': 'accordion-trigger',
    'aria-controls': item.contentId,
    'aria-expanded': open ? 'true' : 'false',
    'data-state': open ? 'open' : 'closed',
    'data-disabled': isDisabled ? 'true' : undefined,
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return (
    <button type={typeProp ?? 'button'} {...finalProps}>
      {children}
    </button>
  );
}

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
