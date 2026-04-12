import { defineContext, readContext, state } from '@askrjs/askr';
import {
  Presence,
  Slot,
  composeRefs,
  controllableState,
  mergeProps,
  pressable,
  rovingFocus,
} from '@askrjs/askr/foundations';
import { focusSelectedCollectionItem } from '../../_internal/focus';
import {
  getCompositeCollection,
  getCompositeCollectionItems,
  registerCompositeNode,
} from '../../_internal/composite';
import {
  isDisclosureValueOpen,
  toggleDisclosureValue,
} from '../../_internal/disclosure';
import { resolveCompoundId, resolvePartId } from '../../_internal/id';
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

type AccordionRootContextValue = {
  accordionId: string;
  type: 'single' | 'multiple';
  value: string | string[];
  setValue: (value: string | string[]) => void;
  orientation: 'vertical' | 'horizontal';
  loop: boolean;
  collapsible: boolean;
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  registerItem: (itemValue: string) => number;
};

type AccordionItemContextValue = {
  itemValue: string;
  itemIndex: number;
  itemDisabled: boolean;
  itemId: string;
  triggerId: string;
  contentId: string;
};

const AccordionRootContext = defineContext<AccordionRootContextValue | null>(
  null
);
const AccordionItemContext = defineContext<AccordionItemContextValue | null>(
  null
);

function AccordionRootScopeView(props: {
  finalProps: Record<string, unknown>;
  children?: unknown;
}) {
  return <div {...props.finalProps}>{props.children}</div>;
}

function AccordionItemScopeView(props: {
  finalProps: Record<string, unknown>;
  children?: unknown;
}) {
  return <div {...props.finalProps}>{props.children}</div>;
}

function readAccordionRootContext(): AccordionRootContextValue {
  const context = readContext(AccordionRootContext);

  if (!context) {
    throw new Error('Accordion components must be used within <Accordion>');
  }

  return context;
}

function readAccordionItemContext(): AccordionItemContextValue {
  const context = readContext(AccordionItemContext);

  if (!context) {
    throw new Error('AccordionItem must be used within <Accordion>');
  }

  return context;
}

function createAccordionValueState(props: AccordionProps) {
  if (props.type === 'multiple') {
    const multipleProps = props as AccordionMultipleProps;
    return controllableState({
      value: multipleProps.value,
      defaultValue: multipleProps.defaultValue ?? [],
      onChange: multipleProps.onValueChange,
    });
  }

  const singleProps = props as AccordionSingleProps;
  return controllableState({
    value: singleProps.value,
    defaultValue: singleProps.defaultValue ?? '',
    onChange: singleProps.onValueChange,
  });
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
  const valueState = createAccordionValueState(props);
  const currentIndexState = state(0);

  const itemIndexMap = new Map<string, number>();
  let nextItemIndex = 0;

  const registerItem = (itemValue: string): number => {
    const existingIndex = itemIndexMap.get(itemValue);

    if (existingIndex !== undefined) {
      return existingIndex;
    }

    const nextIndex = nextItemIndex;
    itemIndexMap.set(itemValue, nextIndex);
    nextItemIndex += 1;
    return nextIndex;
  };

  const finalProps = mergeProps(rest, {
    ref,
    'data-slot': 'accordion',
    'data-accordion': 'true',
    'data-orientation': orientation,
  });
  const rootContext: AccordionRootContextValue = {
    accordionId,
    type,
    value: valueState(),
    setValue: (nextValue) => {
      (valueState.set as (value: string | string[]) => void)(nextValue);
    },
    orientation,
    loop,
    collapsible,
    currentIndex: Math.max(0, currentIndexState()),
    setCurrentIndex: currentIndexState.set,
    registerItem,
  };

  return (
    <AccordionRootContext.Scope value={rootContext}>
      <AccordionRootScopeView
        finalProps={finalProps as Record<string, unknown>}
      >
        {children}
      </AccordionRootScopeView>
    </AccordionRootContext.Scope>
  );
}

export function AccordionItem(props: AccordionItemProps) {
  const { children, disabled = false, ref, value, ...rest } = props;
  const root = readAccordionRootContext();
  const itemIndex = root.registerItem(value);
  const itemId = resolvePartId(root.accordionId, `item-${itemIndex}`);
  const itemContext: AccordionItemContextValue = {
    itemValue: value,
    itemIndex,
    itemDisabled: disabled,
    itemId,
    triggerId: resolvePartId(itemId, 'trigger'),
    contentId: resolvePartId(itemId, 'content'),
  };
  const open = isDisclosureValueOpen(root.type, root.value, value);
  const finalProps = mergeProps(rest, {
    ref,
    id: itemContext.itemId,
    'data-slot': 'accordion-item',
    'data-state': open ? 'open' : 'closed',
    'data-disabled': disabled ? 'true' : undefined,
    'data-orientation': root.orientation,
  });

  return (
    <AccordionItemContext.Scope value={itemContext}>
      <AccordionItemScopeView
        finalProps={finalProps as Record<string, unknown>}
      >
        {children}
      </AccordionItemScopeView>
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
  readAccordionItemContext();

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

  const collection = getCompositeCollection(root.accordionId);
  const triggerItems = getCompositeCollectionItems(collection);
  const disabledIndexes = triggerItems
    .filter((entry) => entry.disabled)
    .map((entry) => entry.index);
  const triggerCount = triggerItems.length;

  const nav = rovingFocus({
    currentIndex: root.currentIndex,
    itemCount: Math.max(triggerCount, 1),
    orientation: root.orientation,
    loop: root.loop,
    isDisabled: (index) => disabledIndexes.includes(index),
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
