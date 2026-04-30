import { Slot, mergeProps, type JSXElement } from '@askrjs/askr/foundations';
import { TABLE_DATA_ATTRIBUTES, TABLE_SLOTS } from './table.shared';
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

type TableHost =
  | 'table'
  | 'caption'
  | 'thead'
  | 'tbody'
  | 'tfoot'
  | 'tr'
  | 'th'
  | 'td';

function renderTableHost(
  host: TableHost,
  props: Record<string, unknown>,
  children: unknown
): JSXElement {
  switch (host) {
    case 'table':
      return <table {...props}>{children}</table>;
    case 'caption':
      return <caption {...props}>{children}</caption>;
    case 'thead':
      return <thead {...props}>{children}</thead>;
    case 'tbody':
      return <tbody {...props}>{children}</tbody>;
    case 'tfoot':
      return <tfoot {...props}>{children}</tfoot>;
    case 'tr':
      return <tr {...props}>{children}</tr>;
    case 'th':
      return <th {...props}>{children}</th>;
    case 'td':
      return <td {...props}>{children}</td>;
  }
}

/**
 * Semantic table primitive family.
 */
export function Table(props: TableProps): JSX.Element;
export function Table(props: TableAsChildProps): JSX.Element;
export function Table(props: TableProps | TableAsChildProps) {
  const { asChild, children, ref, ...rest } = props;
  const finalProps = mergeProps(rest, {
    ref,
    'data-slot': TABLE_SLOTS.table,
    [TABLE_DATA_ATTRIBUTES.table]: 'true',
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children as JSXElement} />;
  }

  return renderTableHost('table', finalProps, children);
}

export function TableCaption(props: TableCaptionProps): JSX.Element;
export function TableCaption(props: TableCaptionAsChildProps): JSX.Element;
export function TableCaption(
  props: TableCaptionProps | TableCaptionAsChildProps
) {
  const { asChild, children, ref, ...rest } = props;
  const finalProps = mergeProps(rest, {
    ref,
    'data-slot': TABLE_SLOTS.caption,
    [TABLE_DATA_ATTRIBUTES.caption]: 'true',
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children as JSXElement} />;
  }

  return renderTableHost('caption', finalProps, children);
}

export function TableHead(props: TableHeadProps): JSX.Element;
export function TableHead(props: TableHeadAsChildProps): JSX.Element;
export function TableHead(props: TableHeadProps | TableHeadAsChildProps) {
  const { asChild, children, ref, ...rest } = props;
  const finalProps = mergeProps(rest, {
    ref,
    'data-slot': TABLE_SLOTS.head,
    [TABLE_DATA_ATTRIBUTES.head]: 'true',
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children as JSXElement} />;
  }

  return renderTableHost('thead', finalProps, children);
}

export function TableBody(props: TableBodyProps): JSX.Element;
export function TableBody(props: TableBodyAsChildProps): JSX.Element;
export function TableBody(props: TableBodyProps | TableBodyAsChildProps) {
  const { asChild, children, ref, ...rest } = props;
  const finalProps = mergeProps(rest, {
    ref,
    'data-slot': TABLE_SLOTS.body,
    [TABLE_DATA_ATTRIBUTES.body]: 'true',
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children as JSXElement} />;
  }

  return renderTableHost('tbody', finalProps, children);
}

export function TableFoot(props: TableFootProps): JSX.Element;
export function TableFoot(props: TableFootAsChildProps): JSX.Element;
export function TableFoot(props: TableFootProps | TableFootAsChildProps) {
  const { asChild, children, ref, ...rest } = props;
  const finalProps = mergeProps(rest, {
    ref,
    'data-slot': TABLE_SLOTS.foot,
    [TABLE_DATA_ATTRIBUTES.foot]: 'true',
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children as JSXElement} />;
  }

  return renderTableHost('tfoot', finalProps, children);
}

export function TableRow(props: TableRowProps): JSX.Element;
export function TableRow(props: TableRowAsChildProps): JSX.Element;
export function TableRow(props: TableRowProps | TableRowAsChildProps) {
  const { asChild, children, ref, ...rest } = props;
  const finalProps = mergeProps(rest, {
    ref,
    'data-slot': TABLE_SLOTS.row,
    [TABLE_DATA_ATTRIBUTES.row]: 'true',
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children as JSXElement} />;
  }

  return renderTableHost('tr', finalProps, children);
}

export function TableHeaderCell(props: TableHeaderCellProps): JSX.Element;
export function TableHeaderCell(
  props: TableHeaderCellAsChildProps
): JSX.Element;
export function TableHeaderCell(
  props: TableHeaderCellProps | TableHeaderCellAsChildProps
) {
  const { asChild, children, ref, ...rest } = props;
  const finalProps = mergeProps(rest, {
    ref,
    'data-slot': TABLE_SLOTS.headerCell,
    [TABLE_DATA_ATTRIBUTES.headerCell]: 'true',
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children as JSXElement} />;
  }

  return renderTableHost('th', finalProps, children);
}

export function TableCell(props: TableCellProps): JSX.Element;
export function TableCell(props: TableCellAsChildProps): JSX.Element;
export function TableCell(props: TableCellProps | TableCellAsChildProps) {
  const { asChild, children, ref, ...rest } = props;
  const finalProps = mergeProps(rest, {
    ref,
    'data-slot': TABLE_SLOTS.cell,
    [TABLE_DATA_ATTRIBUTES.cell]: 'true',
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children as JSXElement} />;
  }

  return renderTableHost('td', finalProps, children);
}
