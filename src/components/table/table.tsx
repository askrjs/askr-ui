import type { JSX } from '@askrjs/askr/jsx-runtime';
import { Slot } from '@askrjs/askr/foundations/structures';
import type { JSXElement } from '@askrjs/askr/foundations/structures';
import { mergeProps } from '@askrjs/askr/foundations/utilities';
import type { Ref } from '@askrjs/askr/foundations/utilities';
import { nativeRef } from '../_internal/native-ref';
import { resolveCompoundId } from '../_internal/id';
import {
  readTableChildAttribute,
  readTableContext,
  resolveTableSlotRef,
  TableContext,
  TABLE_DATA_ATTRIBUTES,
  TABLE_SLOTS,
} from './table.shared';
import type { TableContextValue } from './table.shared';
import type {
  TableAsChildProps,
  TableBodyAsChildProps,
  TableBodyProps,
  TableCaptionAsChildProps,
  TableCaptionProps,
  TableCellAsChildProps,
  TableCellProps,
  TableFootAsChildProps,
  TableFootProps,
  TableHeadAsChildProps,
  TableHeadProps,
  TableHeaderCellAsChildProps,
  TableHeaderCellProps,
  TableProps,
  TableRowAsChildProps,
  TableRowProps,
} from './table.types';

function findTableCaption(children: unknown): JSXElement | undefined {
  if (typeof children === 'function') {
    return findTableCaption(children());
  }

  if (Array.isArray(children)) {
    for (const child of children) {
      const caption = findTableCaption(child);
      if (caption) return caption;
    }
    return undefined;
  }

  if (typeof children !== 'object' || children === null) return undefined;
  const element = children as Partial<JSXElement>;
  if (element.type === TableCaption && element.props) {
    return element as JSXElement;
  }
  if (typeof element.type === 'symbol' && element.props) {
    return findTableCaption(element.props?.children);
  }
  return undefined;
}

/**
 * Semantic table primitive family.
 */
export function Table(props: TableProps): JSX.Element;
/**
 * Renders a part of `table`.
 *
 * Supports polymorphic rendering via `asChild`.
 */
export function Table(props: TableAsChildProps): JSX.Element;
export function Table(props: TableProps | TableAsChildProps) {
  const { asChild, children, ref, ...rest } = props;
  const caption = asChild
    ? findTableCaption((children as JSXElement).props.children)
    : undefined;
  const hostTag = asChild ? (children as JSXElement).type : undefined;
  const preserveNativeCaption = hostTag === 'table';
  const hasCustomCaption = caption?.props.asChild === true;
  const captionId = (() => {
    if (!caption) return undefined;
    const generatedCaptionId = resolveCompoundId(
      'table-caption',
      undefined,
      caption
    );
    const componentId = caption.props.id;
    const hostId = readTableChildAttribute(caption.props.children, 'id');
    const id =
      componentId !== undefined
        ? componentId
        : hostId !== undefined
          ? hostId
          : generatedCaptionId;
    return id as JSX.IntrinsicElements['caption']['id'];
  })();
  const tableContext: TableContextValue | null = asChild
    ? { captionId, preserveNativeCaption }
    : null;
  const restProps = rest as Record<string, unknown>;
  const shouldLabelFromCaption =
    asChild &&
    caption !== undefined &&
    (!preserveNativeCaption || hasCustomCaption) &&
    restProps['aria-labelledby'] === undefined &&
    restProps['aria-label'] === undefined;
  const finalProps = mergeProps(rest, {
    ref: resolveTableSlotRef(
      asChild,
      children,
      ref as Ref<Element> | undefined
    ),
    ...(asChild && !preserveNativeCaption ? { role: 'table' } : {}),
    ...(shouldLabelFromCaption ? { 'aria-labelledby': captionId } : {}),
    'data-slot': TABLE_SLOTS.table,
    [TABLE_DATA_ATTRIBUTES.table]: 'true',
  });

  if (props.asChild) {
    return (
      <TableContext value={tableContext}>
        <Slot asChild {...finalProps} children={children as JSXElement} />
      </TableContext>
    );
  }

  return (
    <table {...finalProps} ref={nativeRef<HTMLTableElement>(props)}>
      {children}
    </table>
  );
}

/**
 * Renders a part of `table`.
 *
 * Supports polymorphic rendering via `asChild`.
 */
export function TableCaption(props: TableCaptionProps): JSX.Element;
export function TableCaption(props: TableCaptionAsChildProps): JSX.Element;
export function TableCaption(
  props: TableCaptionProps | TableCaptionAsChildProps
) {
  const { asChild, children, ref, ...rest } = props;
  const tableContext = readTableContext();
  const shouldSetCaptionId =
    tableContext !== null && (asChild || !tableContext.preserveNativeCaption);
  const finalProps = mergeProps(rest, {
    ref: resolveTableSlotRef(
      asChild,
      children,
      ref as Ref<Element> | undefined
    ),
    ...(shouldSetCaptionId ? { id: tableContext?.captionId } : {}),
    ...(tableContext !== null && !tableContext.preserveNativeCaption && !asChild
      ? { 'aria-hidden': true }
      : {}),
    'data-slot': TABLE_SLOTS.caption,
    [TABLE_DATA_ATTRIBUTES.caption]: 'true',
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children as JSXElement} />;
  }

  return (
    <caption {...finalProps} ref={nativeRef<HTMLTableCaptionElement>(props)}>
      {children}
    </caption>
  );
}

/**
 * Renders a part of `table`.
 *
 * Supports polymorphic rendering via `asChild`.
 */
export function TableHead(props: TableHeadProps): JSX.Element;
export function TableHead(props: TableHeadAsChildProps): JSX.Element;
export function TableHead(props: TableHeadProps | TableHeadAsChildProps) {
  const { asChild, children, ref, ...rest } = props;
  const finalProps = mergeProps(rest, {
    ref: resolveTableSlotRef(
      asChild,
      children,
      ref as Ref<Element> | undefined
    ),
    ...(asChild ? { role: 'rowgroup' } : {}),
    'data-slot': TABLE_SLOTS.head,
    [TABLE_DATA_ATTRIBUTES.head]: 'true',
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children as JSXElement} />;
  }

  return (
    <thead {...finalProps} ref={nativeRef<HTMLTableSectionElement>(props)}>
      {children}
    </thead>
  );
}

/**
 * Renders a part of `table`.
 *
 * Supports polymorphic rendering via `asChild`.
 */
export function TableBody(props: TableBodyProps): JSX.Element;
export function TableBody(props: TableBodyAsChildProps): JSX.Element;
export function TableBody(props: TableBodyProps | TableBodyAsChildProps) {
  const { asChild, children, ref, ...rest } = props;
  const finalProps = mergeProps(rest, {
    ref: resolveTableSlotRef(
      asChild,
      children,
      ref as Ref<Element> | undefined
    ),
    ...(asChild ? { role: 'rowgroup' } : {}),
    'data-slot': TABLE_SLOTS.body,
    [TABLE_DATA_ATTRIBUTES.body]: 'true',
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children as JSXElement} />;
  }

  return (
    <tbody {...finalProps} ref={nativeRef<HTMLTableSectionElement>(props)}>
      {children}
    </tbody>
  );
}

/**
 * Renders a part of `table`.
 *
 * Supports polymorphic rendering via `asChild`.
 */
export function TableFoot(props: TableFootProps): JSX.Element;
export function TableFoot(props: TableFootAsChildProps): JSX.Element;
export function TableFoot(props: TableFootProps | TableFootAsChildProps) {
  const { asChild, children, ref, ...rest } = props;
  const finalProps = mergeProps(rest, {
    ref: resolveTableSlotRef(
      asChild,
      children,
      ref as Ref<Element> | undefined
    ),
    ...(asChild ? { role: 'rowgroup' } : {}),
    'data-slot': TABLE_SLOTS.foot,
    [TABLE_DATA_ATTRIBUTES.foot]: 'true',
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children as JSXElement} />;
  }

  return (
    <tfoot {...finalProps} ref={nativeRef<HTMLTableSectionElement>(props)}>
      {children}
    </tfoot>
  );
}

/**
 * Renders a part of `table`.
 *
 * Supports polymorphic rendering via `asChild`.
 */
export function TableRow(props: TableRowProps): JSX.Element;
export function TableRow(props: TableRowAsChildProps): JSX.Element;
export function TableRow(props: TableRowProps | TableRowAsChildProps) {
  const { asChild, children, ref, ...rest } = props;
  const finalProps = mergeProps(rest, {
    ref: resolveTableSlotRef(
      asChild,
      children,
      ref as Ref<Element> | undefined
    ),
    ...(asChild ? { role: 'row' } : {}),
    'data-slot': TABLE_SLOTS.row,
    [TABLE_DATA_ATTRIBUTES.row]: 'true',
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children as JSXElement} />;
  }

  return (
    <tr {...finalProps} ref={nativeRef<HTMLTableRowElement>(props)}>
      {children}
    </tr>
  );
}

/**
 * Renders a part of `table`.
 *
 * Supports polymorphic rendering via `asChild`.
 */
export function TableHeaderCell(props: TableHeaderCellProps): JSX.Element;
export function TableHeaderCell(
  props: TableHeaderCellAsChildProps
): JSX.Element;
export function TableHeaderCell(
  props: TableHeaderCellProps | TableHeaderCellAsChildProps
) {
  const { asChild, children, ref, ...rest } = props;
  const headerRole = () => {
    const childScope = readTableChildAttribute(children, 'scope');
    const scope = childScope ?? (rest as { scope?: unknown }).scope;
    const value = typeof scope === 'function' ? scope() : scope;
    return value === 'row' || value === 'rowgroup'
      ? 'rowheader'
      : 'columnheader';
  };
  const finalProps = mergeProps(rest, {
    ref: resolveTableSlotRef(
      asChild,
      children,
      ref as Ref<Element> | undefined
    ),
    ...(asChild ? { role: headerRole } : {}),
    'data-slot': TABLE_SLOTS.headerCell,
    [TABLE_DATA_ATTRIBUTES.headerCell]: 'true',
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children as JSXElement} />;
  }

  return (
    <th {...finalProps} ref={nativeRef<HTMLTableCellElement>(props)}>
      {children}
    </th>
  );
}

/**
 * Renders a part of `table`.
 *
 * Supports polymorphic rendering via `asChild`.
 */
export function TableCell(props: TableCellProps): JSX.Element;
export function TableCell(props: TableCellAsChildProps): JSX.Element;
export function TableCell(props: TableCellProps | TableCellAsChildProps) {
  const { asChild, children, ref, ...rest } = props;
  const finalProps = mergeProps(rest, {
    ref: resolveTableSlotRef(
      asChild,
      children,
      ref as Ref<Element> | undefined
    ),
    ...(asChild ? { role: 'cell' } : {}),
    'data-slot': TABLE_SLOTS.cell,
    [TABLE_DATA_ATTRIBUTES.cell]: 'true',
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children as JSXElement} />;
  }

  return (
    <td {...finalProps} ref={nativeRef<HTMLTableCellElement>(props)}>
      {children}
    </td>
  );
}
