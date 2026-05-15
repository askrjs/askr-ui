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

  return <table {...finalProps}>{children}</table>;
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

  return <caption {...finalProps}>{children}</caption>;
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

  return <thead {...finalProps}>{children}</thead>;
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

  return <tbody {...finalProps}>{children}</tbody>;
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

  return <tfoot {...finalProps}>{children}</tfoot>;
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

  return <tr {...finalProps}>{children}</tr>;
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

  return <th {...finalProps}>{children}</th>;
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

  return <td {...finalProps}>{children}</td>;
}
