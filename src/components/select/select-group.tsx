import { Slot } from '@askrjs/askr/foundations/structures';
import { mergeProps } from '@askrjs/askr/foundations/utilities';
import { resolvePartId } from '../_internal/id';
import { collectJsxElements } from '../_internal/jsx';
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
    <SelectGroupContext value={{ groupId, labelId }}>
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

  return <div {...finalProps}>{children}</div>;
}
