import { defineContext, readContext } from '@askrjs/askr';
import {
  Slot,
  Presence,
  controllableState,
  composeRefs,
  formatId,
  mergeProps,
  pressable,
} from '@askrjs/ui/foundations';
import type { JSXElement } from '@askrjs/ui/foundations';
import type {
  CollapsibleContentAsChildProps,
  CollapsibleContentProps,
  CollapsibleProps,
  CollapsibleTriggerAsChildProps,
  CollapsibleTriggerProps,
} from './collapsible.types';

type CollapsibleRootContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  disabled: boolean;
  contentId: string;
};

const CollapsibleRootContext =
  defineContext<CollapsibleRootContextValue | null>(null);

let pendingFocusRestoreId: string | null = null;

function isJsxElement(value: unknown): value is JSXElement {
  return (
    typeof value === 'object' &&
    value !== null &&
    '$$typeof' in value &&
    'props' in value
  );
}

function toChildArray(children: unknown): unknown[] {
  if (Array.isArray(children)) {
    return children;
  }

  return children === undefined || children === null ? [] : [children];
}

function serializeForId(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map((item) => serializeForId(item)).join('|');
  }

  if (value === undefined || value === null || typeof value === 'boolean') {
    return '';
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }

  if (isJsxElement(value)) {
    const typeName =
      typeof value.type === 'string'
        ? value.type
        : typeof value.type === 'function'
          ? value.type.name || 'component'
          : 'component';
    const propEntries = Object.entries(value.props ?? {})
      .filter(
        ([key, entryValue]) =>
          key !== 'children' &&
          key !== 'ref' &&
          !key.startsWith('on') &&
          (typeof entryValue === 'string' ||
            typeof entryValue === 'number' ||
            typeof entryValue === 'boolean')
      )
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entryValue]) => `${key}:${String(entryValue)}`)
      .join(',');

    return `${typeName}[${propEntries}](${serializeForId(value.props?.children)})`;
  }

  return typeof value;
}

function hashString(value: string): string {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(36);
}

function resolveCollapsibleContentId(props: CollapsibleProps): string {
  const identity =
    props.id ??
    `auto-${hashString(
      [
        props.defaultOpen ? 'open' : 'closed',
        props.disabled ? 'disabled' : 'enabled',
        serializeForId(props.children),
      ].join('|')
    )}`;

  return formatId({
    prefix: 'collapsible-content',
    id: identity,
  });
}

function readCollapsibleRootContext(): CollapsibleRootContextValue {
  const context = readContext(CollapsibleRootContext);

  if (!context) {
    throw new Error('Collapsible components must be used within <Collapsible>');
  }

  return context;
}

export function Collapsible(props: CollapsibleProps) {
  const {
    id,
    children,
    open,
    defaultOpen = false,
    onOpenChange,
    disabled = false,
  } = props;

  const openState = controllableState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const contentId = resolveCollapsibleContentId({
    id,
    children,
    open,
    defaultOpen,
    onOpenChange,
    disabled,
  });
  const rootContext: CollapsibleRootContextValue = {
    open: openState(),
    setOpen: openState.set,
    disabled,
    contentId,
  };

  return (
    <CollapsibleRootContext.Scope value={rootContext}>
      {children}
    </CollapsibleRootContext.Scope>
  );
}

export function CollapsibleTrigger(props: CollapsibleTriggerProps): JSX.Element;
export function CollapsibleTrigger(
  props: CollapsibleTriggerAsChildProps
): JSX.Element;
export function CollapsibleTrigger(
  props: CollapsibleTriggerProps | CollapsibleTriggerAsChildProps
) {
  const { asChild, children, ref, ...rest } = props;
  const root = readCollapsibleRootContext();
  const restoreFocusRef = (node: HTMLElement | null) => {
    if (node && pendingFocusRestoreId === root.contentId) {
      pendingFocusRestoreId = null;
      node.focus();
    }
  };
  const toggleOpen = (event?: Event) => {
    if (
      event &&
      'currentTarget' in event &&
      event.currentTarget === document.activeElement
    ) {
      pendingFocusRestoreId = root.contentId;
    }
    root.setOpen(!root.open);
    if (event && 'currentTarget' in event) {
      (event.currentTarget as HTMLElement | null)?.focus?.();
    }
  };
  const interactionProps = pressable({
    disabled: root.disabled,
    onPress: (event) => toggleOpen(event as Event),
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
      restoreFocusRef
    ),
    'data-slot': 'collapsible-trigger',
    'aria-expanded': root.open ? 'true' : 'false',
    'aria-controls': root.contentId,
    'data-state': root.open ? 'open' : 'closed',
    'data-disabled': root.disabled ? 'true' : undefined,
    onKeyDown: !asChild
      ? (event: KeyboardEvent) => {
          if (event.key === ' ') {
            event.preventDefault();
          }
          if (event.key === 'Enter') {
            toggleOpen(event);
          }
        }
      : undefined,
    onKeyUp: !asChild
      ? (event: KeyboardEvent) => {
          if (event.key === ' ') {
            toggleOpen(event);
          }
        }
      : undefined,
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return (
    <button type="button" {...finalProps}>
      {children}
    </button>
  );
}

export function CollapsibleContent(
  props: CollapsibleContentProps
): JSX.Element | null;
export function CollapsibleContent(
  props: CollapsibleContentAsChildProps
): JSX.Element | null;
export function CollapsibleContent(
  props: CollapsibleContentProps | CollapsibleContentAsChildProps
) {
  const { asChild, children, forceMount = false, ref, ...rest } = props;
  const root = readCollapsibleRootContext();
  const finalProps = mergeProps(rest, {
    ref,
    id: root.contentId,
    'data-slot': 'collapsible-content',
    'data-state': root.open ? 'open' : 'closed',
  });

  return (
    <Presence present={forceMount || root.open}>
      {asChild ? (
        <Slot asChild {...finalProps} children={children} />
      ) : (
        <div {...finalProps}>{children}</div>
      )}
    </Presence>
  );
}

