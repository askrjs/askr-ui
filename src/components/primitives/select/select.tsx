import { state } from '@askrjs/askr';
import {
  Presence,
  Slot,
  composeRefs,
  controllableState,
  mergeProps,
  pressable,
  rovingFocus,
} from '@askrjs/askr/foundations';
import { DismissableLayer } from '../../composites/dismissable-layer';
import { FocusScope } from '../../composites/focus-scope';
import { focusSelectedCollectionItem } from '../../_internal/focus';
import { resolveCompoundId, resolvePartId } from '../../_internal/id';
import { collectJsxElements } from '../../_internal/jsx';
import {
  collectItemMetadata,
  firstEnabledIndex,
  getMenuCollection,
  registerCollectionNode,
} from '../../_internal/menu';
import {
  clearOverlayPosition,
  getOverlayNodes,
  getPersistentPortal,
  syncOverlayPosition,
} from '../../_internal/overlay';
import type {
  SelectContentAsChildProps,
  SelectContentProps,
  SelectGroupAsChildProps,
  SelectGroupProps,
  SelectItemAsChildProps,
  SelectItemProps,
  SelectItemTextAsChildProps,
  SelectItemTextProps,
  SelectLabelAsChildProps,
  SelectLabelProps,
  SelectPortalProps,
  SelectProps,
  SelectSeparatorAsChildProps,
  SelectSeparatorProps,
  SelectTriggerAsChildProps,
  SelectTriggerProps,
  SelectValueAsChildProps,
  SelectValueProps,
} from './select.types';
import {
  createSelectRenderContext,
  getSelectDisabledIndexes,
  readSelectGroupContext,
  readSelectRenderContext,
  readSelectRootContext,
  SelectGroupContext,
  SelectRenderContext,
  SelectRootContext,
  type SelectRootContextValue,
} from './select.shared';

function SelectRootScopeView(props: {
  children?: unknown;
  name?: string;
  disabled: boolean;
  renderContext: ReturnType<typeof createSelectRenderContext>;
}) {
  return (
    <SelectRenderContext.Scope value={props.renderContext}>
      <SelectRootView
        name={props.name}
        disabled={props.disabled}
        children={props.children}
      />
    </SelectRenderContext.Scope>
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

function SelectGroupScopeView(props: {
  asChild?: boolean;
  children?: unknown;
  finalProps: Record<string, unknown>;
}) {
  if (props.asChild) {
    return (
      <Slot
        asChild
        {...props.finalProps}
        children={props.children as JSX.Element}
      />
    );
  }

  return <div {...props.finalProps}>{props.children}</div>;
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
  const items = collectItemMetadata(children, SelectItem);
  const effectiveItems = items.map((item) => ({
    disabled: disabled || item.disabled,
  }));
  const selectedIndex = items.findIndex((item) => item.value === valueState());
  const fallbackIndex = firstEnabledIndex(effectiveItems);
  const currentIndexState = state(
    selectedIndex >= 0 && !effectiveItems[selectedIndex]?.disabled
      ? selectedIndex
      : fallbackIndex
  );
  const currentIndexCandidate = currentIndexState();
  const currentIndex =
    selectedIndex >= 0 && !effectiveItems[selectedIndex]?.disabled
      ? selectedIndex
      : effectiveItems[currentIndexCandidate] &&
          !effectiveItems[currentIndexCandidate]?.disabled
        ? currentIndexCandidate
        : fallbackIndex;
  const rootContext: SelectRootContextValue = {
    selectId,
    open: openState(),
    setOpen: openState.set,
    contentId: resolvePartId(selectId, 'content'),
    portal: getPersistentPortal(selectId),
    value: valueState(),
    setValue: valueState.set,
    currentIndex,
    setCurrentIndex: currentIndexState.set,
    items,
    disabled,
    selectedText:
      items.find((item) => item.value === valueState())?.text ?? '',
  };
  const renderContext = createSelectRenderContext();

  return (
    <SelectRootContext.Scope value={rootContext}>
      <SelectRootScopeView
        renderContext={renderContext}
        name={name}
        disabled={disabled}
        children={children}
      />
    </SelectRootContext.Scope>
  );
}

export function SelectTrigger(props: SelectTriggerProps): JSX.Element;
export function SelectTrigger(props: SelectTriggerAsChildProps): JSX.Element;
export function SelectTrigger(
  props: SelectTriggerProps | SelectTriggerAsChildProps
) {
  const { asChild, children, disabled = false, onPress, ref, type, ...rest } =
    props;
  const root = readSelectRootContext();
  const overlayNodes = getOverlayNodes(root.selectId);
  const isDisabled = root.disabled || disabled;
  const interactionProps = pressable({
    disabled: isDisabled,
    onPress: (event) => {
      onPress?.(event);
      if (!event.defaultPrevented) {
        root.setOpen(!root.open);
      }
    },
    isNativeButton: !asChild,
  });
  const finalProps = mergeProps(rest, {
    ...interactionProps,
    ref: composeRefs(
      ref as
        | ((value: HTMLElement | null) => void)
        | { current: HTMLElement | null }
        | null
        | undefined,
      (node: HTMLElement | null) => {
        overlayNodes.trigger = node;
      }
    ),
    'aria-haspopup': 'listbox',
    'aria-expanded': root.open ? 'true' : 'false',
    'aria-controls': root.contentId,
    'data-slot': 'select-trigger',
    'data-disabled': isDisabled ? 'true' : undefined,
    'data-state': root.open ? 'open' : 'closed',
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return (
    <button type={type ?? 'button'} {...finalProps}>
      {children}
    </button>
  );
}

export function SelectValue(props: SelectValueProps): JSX.Element;
export function SelectValue(props: SelectValueAsChildProps): JSX.Element;
export function SelectValue(props: SelectValueProps | SelectValueAsChildProps) {
  const { asChild, children, placeholder, ref, ...rest } = props;
  const root = readSelectRootContext();
  const renderedChildren =
    children ?? (root.selectedText || placeholder || null);
  const finalProps = mergeProps(rest, {
    ref,
    'data-slot': 'select-value',
    'data-placeholder':
      !root.selectedText && placeholder ? 'true' : undefined,
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children as JSX.Element} />;
  }

  return <span {...finalProps}>{renderedChildren}</span>;
}

export function SelectPortal(props: SelectPortalProps): JSX.Element | null {
  const root = readSelectRootContext();

  return root.portal.render({
    children: props.children,
  }) as JSX.Element | null;
}

export function SelectContent(props: SelectContentProps): JSX.Element | null;
export function SelectContent(
  props: SelectContentAsChildProps
): JSX.Element | null;
export function SelectContent(
  props: SelectContentProps | SelectContentAsChildProps
) {
  const {
    asChild,
    children,
    forceMount = false,
    ref,
    side = 'bottom',
    align = 'start',
    sideOffset = 0,
    ...rest
  } = props;
  const root = readSelectRootContext();
  const overlayNodes = getOverlayNodes(root.selectId);
  const collection = getMenuCollection(root.selectId);
  const disabledIndexes = getSelectDisabledIndexes(root.items, root.disabled);
  const nav = rovingFocus({
    currentIndex: root.currentIndex,
    itemCount: Math.max(root.items.length, 1),
    orientation: 'vertical',
    loop: true,
    isDisabled: (index) => disabledIndexes.includes(index),
    onNavigate: (index) => {
      root.setCurrentIndex(index);
      focusSelectedCollectionItem(collection, index);
    },
  });
  const finalProps = mergeProps(rest, {
    ...nav.container,
    ref: composeRefs(
      ref as
        | ((value: HTMLElement | null) => void)
        | { current: HTMLElement | null }
        | null
        | undefined,
      (node: HTMLElement | null) => {
        overlayNodes.content = node;
        if (node && root.open) {
          syncOverlayPosition(root.selectId, {
            side,
            align,
            sideOffset,
            matchTriggerWidth: true,
          });
        } else {
          clearOverlayPosition(root.selectId);
        }

        if (node && root.open) {
          focusSelectedCollectionItem(collection, root.currentIndex);
        }
      }
    ),
    id: root.contentId,
    role: 'listbox',
    'data-slot': 'select-content',
    'data-state': root.open ? 'open' : 'closed',
    'data-side': side,
    'data-align': align,
    'data-side-offset': String(sideOffset),
  });
  const contentNode = asChild ? (
    <Slot asChild {...finalProps} children={children} />
  ) : (
    <div {...finalProps}>{children}</div>
  );

  return (
    <Presence present={forceMount || root.open}>
      <FocusScope restoreFocus>
        <DismissableLayer
          onDismiss={() => {
            root.setOpen(false);
          }}
        >
          {contentNode}
        </DismissableLayer>
      </FocusScope>
    </Presence>
  );
}

export function SelectItem(props: SelectItemProps): JSX.Element;
export function SelectItem(props: SelectItemAsChildProps): JSX.Element;
export function SelectItem(props: SelectItemProps | SelectItemAsChildProps) {
  const {
    asChild,
    children,
    disabled = false,
    value,
    textValue,
    ref,
    type,
    ...rest
  } = props;
  const root = readSelectRootContext();
  const renderContext = readSelectRenderContext();
  const itemIndex = renderContext.claimItemIndex();
  const itemId = resolvePartId(root.selectId, `item-${itemIndex}`);
  const collection = getMenuCollection(root.selectId);
  const disabledIndexes = getSelectDisabledIndexes(root.items, root.disabled);
  const nav = rovingFocus({
    currentIndex: root.currentIndex,
    itemCount: Math.max(root.items.length, 1),
    orientation: 'vertical',
    loop: true,
    isDisabled: (index) => disabledIndexes.includes(index),
    onNavigate: (index) => {
      root.setCurrentIndex(index);
      focusSelectedCollectionItem(collection, index);
    },
  });
  const selected = root.value === value;
  const isDisabled = root.disabled || disabled;
  const interactionProps = pressable({
    disabled: isDisabled,
    onPress: (event) => {
      if (event.defaultPrevented) {
        return;
      }

      root.setValue(value);
      root.setCurrentIndex(itemIndex);
      root.setOpen(false);
    },
    isNativeButton: !asChild,
  });
  const finalProps = mergeProps(rest, {
    ...interactionProps,
    ...nav.item(itemIndex),
    ref: composeRefs(
      ref as
        | ((value: HTMLElement | null) => void)
        | { current: HTMLElement | null }
        | null
        | undefined,
      (node: HTMLElement | null) => {
        registerCollectionNode(itemId, collection, node, {
          index: itemIndex,
          disabled: isDisabled,
          value,
          text: textValue ?? root.items[itemIndex]?.text,
        });
      }
    ),
    id: itemId,
    role: 'option',
    tabIndex: isDisabled ? -1 : undefined,
    'aria-selected': selected ? 'true' : 'false',
    'data-slot': 'select-item',
    'data-state': selected ? 'checked' : 'unchecked',
    'data-disabled': isDisabled ? 'true' : undefined,
    'aria-disabled': isDisabled ? 'true' : undefined,
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children as JSX.Element} />;
  }

  return (
    <button type={type ?? 'button'} {...finalProps}>
      {children}
    </button>
  );
}

export function SelectItemText(props: SelectItemTextProps): JSX.Element;
export function SelectItemText(props: SelectItemTextAsChildProps): JSX.Element;
export function SelectItemText(
  props: SelectItemTextProps | SelectItemTextAsChildProps
) {
  const { asChild, children, ref, ...rest } = props;
  const finalProps = mergeProps(rest, {
    ref,
    'data-slot': 'select-item-text',
    'data-select-item-text': 'true',
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return <span {...finalProps}>{children}</span>;
}

export function SelectGroup(props: SelectGroupProps): JSX.Element;
export function SelectGroup(props: SelectGroupAsChildProps): JSX.Element;
export function SelectGroup(
  props: SelectGroupProps | SelectGroupAsChildProps
) {
  const { asChild, children, ref, ...rest } = props;
  const root = readSelectRootContext();
  const renderContext = readSelectRenderContext();
  const groupIndex = renderContext.claimGroupIndex();
  const groupId = resolvePartId(root.selectId, `group-${groupIndex}`);
  const labelId = `${groupId}-label`;
  const containsLabel =
    collectJsxElements(children, (element) => element.type === SelectLabel)
      .length > 0;
  const finalProps = mergeProps(rest, {
    ref,
    id: groupId,
    role: 'group',
    'aria-labelledby': containsLabel ? labelId : undefined,
    'data-slot': 'select-group',
  });

  return (
    <SelectGroupContext.Scope value={{ groupId, labelId }}>
      <SelectGroupScopeView
        asChild={asChild}
        finalProps={finalProps as Record<string, unknown>}
        children={children}
      />
    </SelectGroupContext.Scope>
  );
}

export function SelectLabel(props: SelectLabelProps): JSX.Element;
export function SelectLabel(props: SelectLabelAsChildProps): JSX.Element;
export function SelectLabel(props: SelectLabelProps | SelectLabelAsChildProps) {
  const { asChild, children, ref, ...rest } = props;
  const groupContext = readSelectGroupContext();
  const finalProps = mergeProps(rest, {
    ref,
    id: groupContext?.labelId,
    'data-slot': 'select-label',
    'data-select-label': 'true',
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return <div {...finalProps}>{children}</div>;
}

export function SelectSeparator(props: SelectSeparatorProps): JSX.Element;
export function SelectSeparator(
  props: SelectSeparatorAsChildProps
): JSX.Element;
export function SelectSeparator(
  props: SelectSeparatorProps | SelectSeparatorAsChildProps
) {
  const { asChild, children, ref, ...rest } = props;
  const finalProps = mergeProps(rest, {
    ref,
    role: 'separator',
    'data-slot': 'select-separator',
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return <div {...finalProps}>{children}</div>;
}
