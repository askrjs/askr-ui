import type { JSXElement } from '@askrjs/askr/foundations/structures';
import type { Ref } from '@askrjs/askr/foundations/utilities';

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
  ref?: Ref<Element>;
};

/** Props for Table. */
export type TableProps =
  | TableNativeProps<'table', HTMLTableElement>
  | TableAsChildBaseProps;

/** Props for the `asChild` (polymorphic) rendering of Table. */
export type TableAsChildProps = TableAsChildBaseProps;

/** Props for Table Caption. */
export type TableCaptionProps =
  | TableNativeProps<'caption', HTMLTableCaptionElement>
  | TableCaptionAsChildProps;

/** Props for the `asChild` (polymorphic) rendering of Table Caption. */
export type TableCaptionAsChildProps = TableAsChildBaseProps;

/** Props for Table Head. */
export type TableHeadProps =
  | TableNativeProps<'thead', HTMLTableSectionElement>
  | TableHeadAsChildProps;

/** Props for the `asChild` (polymorphic) rendering of Table Head. */
export type TableHeadAsChildProps = TableAsChildBaseProps;

/** Props for Table Body. */
export type TableBodyProps =
  | TableNativeProps<'tbody', HTMLTableSectionElement>
  | TableBodyAsChildProps;

/** Props for the `asChild` (polymorphic) rendering of Table Body. */
export type TableBodyAsChildProps = TableAsChildBaseProps;

/** Props for Table Foot. */
export type TableFootProps =
  | TableNativeProps<'tfoot', HTMLTableSectionElement>
  | TableFootAsChildProps;

/** Props for the `asChild` (polymorphic) rendering of Table Foot. */
export type TableFootAsChildProps = TableAsChildBaseProps;

/** Props for Table Row. */
export type TableRowProps =
  | TableNativeProps<'tr', HTMLTableRowElement>
  | TableRowAsChildProps;

/** Props for the `asChild` (polymorphic) rendering of Table Row. */
export type TableRowAsChildProps = TableAsChildBaseProps;

/** Props for Table Header Cell. */
export type TableHeaderCellProps =
  | TableNativeProps<'th', HTMLTableCellElement>
  | TableHeaderCellAsChildProps;

/** Props for the `asChild` (polymorphic) rendering of Table Header Cell. */
export type TableHeaderCellAsChildProps = TableAsChildBaseProps;

/** Props for Table Cell. */
export type TableCellProps =
  | TableNativeProps<'td', HTMLTableCellElement>
  | TableCellAsChildProps;

/** Props for the `asChild` (polymorphic) rendering of Table Cell. */
export type TableCellAsChildProps = TableAsChildBaseProps;
