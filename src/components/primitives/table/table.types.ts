import type { JSXElement, Ref } from '@askrjs/askr/foundations';

type TableBaseProps = {
  children?: unknown;
};

type TableNativeProps<
  TTag extends keyof JSX.IntrinsicElements,
  TElement extends HTMLElement,
> = Omit<JSX.IntrinsicElements[TTag], 'children' | 'ref'> &
  TableBaseProps & {
    asChild?: false;
    ref?: Ref<TElement>;
  };

type TableAsChildBaseProps = TableBaseProps & {
  asChild: true;
  children: JSXElement;
  ref?: Ref<unknown>;
};

export type TableProps =
  | TableNativeProps<'table', HTMLTableElement>
  | TableAsChildBaseProps;

export type TableAsChildProps = TableAsChildBaseProps;

export type TableCaptionProps =
  | TableNativeProps<'caption', HTMLTableCaptionElement>
  | TableCaptionAsChildProps;

export type TableCaptionAsChildProps = TableAsChildBaseProps;

export type TableHeadProps =
  | TableNativeProps<'thead', HTMLTableSectionElement>
  | TableHeadAsChildProps;

export type TableHeadAsChildProps = TableAsChildBaseProps;

export type TableBodyProps =
  | TableNativeProps<'tbody', HTMLTableSectionElement>
  | TableBodyAsChildProps;

export type TableBodyAsChildProps = TableAsChildBaseProps;

export type TableFootProps =
  | TableNativeProps<'tfoot', HTMLTableSectionElement>
  | TableFootAsChildProps;

export type TableFootAsChildProps = TableAsChildBaseProps;

export type TableRowProps =
  | TableNativeProps<'tr', HTMLTableRowElement>
  | TableRowAsChildProps;

export type TableRowAsChildProps = TableAsChildBaseProps;

export type TableHeaderCellProps =
  | TableNativeProps<'th', HTMLTableCellElement>
  | TableHeaderCellAsChildProps;

export type TableHeaderCellAsChildProps = TableAsChildBaseProps;

export type TableCellProps =
  | TableNativeProps<'td', HTMLTableCellElement>
  | TableCellAsChildProps;

export type TableCellAsChildProps = TableAsChildBaseProps;
