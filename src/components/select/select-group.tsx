import type { JSX } from '@askrjs/askr/jsx-runtime';
import { Slot } from '@askrjs/askr/foundations/structures';
import { composeRefs, mergeProps } from '@askrjs/askr/foundations/utilities';
import { state } from '@askrjs/askr';
import { nativeRef } from '../_internal/native-ref';
import { resolvePartId } from '../_internal/id';
import { isJsxElement } from '../_internal/jsx';
import {
  readSelectGroupContext,
  readSelectRenderContext,
  readSelectRootContext,
  SelectGroupContext,
} from './select.shared';
import type {
  SelectGroupAsChildProps,
  SelectGroupProps,
  SelectLabelAsChildProps,
  SelectLabelProps,
  SelectSeparatorAsChildProps,
  SelectSeparatorProps,
} from './select.types';

const SSR_CHILDREN_BEFORE_ATTRS = Symbol.for('askr.ssr.children-before-attrs');

function declaredSelectGroupLabelId(
  children: unknown,
  fallbackId: string
): string | undefined {
  if (Array.isArray(children)) {
    for (const child of children) {
      const id = declaredSelectGroupLabelId(child, fallbackId);
      if (id !== undefined) return id;
    }
    return undefined;
  }
  if (!isJsxElement(children) || children.type === SelectGroup) {
    return undefined;
  }
  if (children.type === SelectLabel) {
    const id = children.props?.id;
    // Reactive IDs are resolved by the label's own attribute, once. Legacy SSR
    // keeps the generated literal fallback until that child has rendered.
    if (id === undefined || typeof id === 'function') return fallbackId;
    return id === null || id === '' ? undefined : String(id);
  }
  return declaredSelectGroupLabelId(children.props?.children, fallbackId);
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

/**
 * Renders the `select-group` part of `select` with `role="group"`.
 *
 * Supports polymorphic rendering via `asChild`.
 */
export function SelectGroup(props: SelectGroupProps): JSX.Element;
export function SelectGroup(props: SelectGroupAsChildProps): JSX.Element;
export function SelectGroup(props: SelectGroupProps | SelectGroupAsChildProps) {
  const { asChild, children, ref, ...rest } = props;
  const root = readSelectRootContext();
  const renderContext = readSelectRenderContext();
  const groupIndex = renderContext.claimGroupIndex();
  const groupId = resolvePartId(root.selectId, `group-${groupIndex}`);
  const labelId = `${groupId}-label`;
  const renderedLabel = {
    id: declaredSelectGroupLabelId(children, labelId),
    resolved: false,
  };
  const callerLabelledBy = (rest as Record<string, unknown>)['aria-labelledby'];
  const association = state<{
    node: Element | null;
    labels: Set<Element>;
    ownedId: string | undefined;
  }>({ node: null, labels: new Set(), ownedId: renderedLabel.id })();
  const syncLabel = () => {
    const node = association.node;
    if (!node || callerLabelledBy !== undefined) {
      return;
    }
    const currentLabel = node.getAttribute('aria-labelledby');
    if (
      currentLabel !== null &&
      currentLabel !== association.ownedId &&
      currentLabel !== renderedLabel.id
    ) {
      return;
    }
    const label = [...association.labels].find(
      (label) =>
        label.id !== '' && label.closest('[data-slot="select-group"]') === node
    );
    if (label) {
      node.setAttribute('aria-labelledby', label.id);
      association.ownedId = label.id;
    } else if (currentLabel === association.ownedId) {
      node.removeAttribute('aria-labelledby');
      association.ownedId = undefined;
    }
  };
  const registerLabel = (node: Element | null, previous: Element | null) => {
    if (previous) association.labels.delete(previous);
    if (node) association.labels.add(node);
    syncLabel();
  };
  const finalProps = mergeProps(rest, {
    ref: composeRefs(
      ref as
        | ((node: Element | null) => void)
        | { current: Element | null }
        | null
        | undefined,
      (node: Element | null) => {
        association.node = node;
        syncLabel();
      }
    ),
    id: groupId,
    role: 'group',
    'aria-labelledby':
      callerLabelledBy === undefined
        ? () => renderedLabel.id
        : callerLabelledBy,
    'data-slot': 'select-group',
  });

  // Newer SSR renderers can evaluate this subtree once before the late label
  // attribute. Older renderers ignore the marker and retain literal labeling.
  (finalProps as Record<PropertyKey, unknown>)[SSR_CHILDREN_BEFORE_ATTRS] =
    true;
  const registerRenderedLabel = (id: unknown) => {
    if (!renderedLabel.resolved) {
      renderedLabel.id =
        id === null || id === undefined || id === '' ? undefined : String(id);
      renderedLabel.resolved = true;
    }
  };
  return (
    <SelectGroupContext
      value={{ groupId, labelId, registerLabel, registerRenderedLabel }}
    >
      <SelectGroupScopeView
        asChild={asChild}
        finalProps={finalProps as Record<string, unknown>}
        children={children}
      />
    </SelectGroupContext>
  );
}

/**
 * Renders the `select-label` part of `select`.
 *
 * Supports polymorphic rendering via `asChild`.
 */
export function SelectLabel(props: SelectLabelProps): JSX.Element | null;
export function SelectLabel(props: SelectLabelAsChildProps): JSX.Element | null;
export function SelectLabel(props: SelectLabelProps | SelectLabelAsChildProps) {
  const { asChild, children, ref, ...rest } = props;
  const groupContext = readSelectGroupContext();
  const labelNode = state<{ current: Element | null }>({ current: null })();
  const finalProps = mergeProps(rest, {
    ref: composeRefs(
      ref as
        | ((node: Element | null) => void)
        | { current: Element | null }
        | null
        | undefined,
      (node: Element | null) => {
        const previous = labelNode.current;
        labelNode.current = node;
        groupContext?.registerLabel(node, previous);
      }
    ),
    id: groupContext?.labelId,
    'data-slot': 'select-label',
    'data-select-label': 'true',
  });
  const renderedId = finalProps.id as SelectLabelProps['id'];
  (finalProps as Record<string, unknown>).id = () => {
    const id = typeof renderedId === 'function' ? renderedId() : renderedId;
    groupContext?.registerRenderedLabel(id);
    // A reactive native ID can update without replacing the label ref. Read
    // the resulting committed DOM after the attribute update or rollback.
    const node = labelNode.current;
    if (node) {
      queueMicrotask(() => {
        if (labelNode.current === node && node.isConnected) {
          groupContext?.registerLabel(node, node);
        }
      });
    }
    return id;
  };

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return <div {...finalProps}>{children}</div>;
}

/**
 * Renders the `select-separator` part of `select` with `role="separator"`.
 *
 * Supports polymorphic rendering via `asChild`.
 */
export function SelectSeparator(
  props: SelectSeparatorProps
): JSX.Element | null;
export function SelectSeparator(
  props: SelectSeparatorAsChildProps
): JSX.Element | null;
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

  return (
    <div {...finalProps} ref={nativeRef<HTMLDivElement>(props)}>
      {children}
    </div>
  );
}
