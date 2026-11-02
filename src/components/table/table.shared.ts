import { defineScope, readScope } from '@askrjs/askr';
import type { JSX } from '@askrjs/askr/jsx-runtime';
import { composeRefs, type Ref } from '@askrjs/askr/foundations/utilities';

export type TableContextValue = {
  captionId?: JSX.IntrinsicElements['caption']['id'];
  preserveNativeCaption: boolean;
};

export const TableContext = defineScope<TableContextValue | null>(null);

/** Reads the optional context supplied by an asChild Table root. */
export function readTableContext(): TableContextValue | null {
  return readScope(TableContext);
}

/** Table Slots value. */
export const TABLE_SLOTS = {
  table: 'table',
  caption: 'table-caption',
  head: 'table-head',
  body: 'table-body',
  foot: 'table-foot',
  row: 'table-row',
  headerCell: 'table-header-cell',
  cell: 'table-cell',
} as const;

/** Table Data Attributes value. */
export const TABLE_DATA_ATTRIBUTES = {
  table: 'data-table',
  caption: 'data-table-caption',
  head: 'data-table-head',
  body: 'data-table-body',
  foot: 'data-table-foot',
  row: 'data-table-row',
  headerCell: 'data-table-header-cell',
  cell: 'data-table-cell',
} as const;

/** Reads a ref passed to a host element used with an asChild Table part. */
export function readTableChildRef(children: unknown): Ref<Element> | undefined {
  if (typeof children !== 'object' || children === null) return undefined;
  return (children as { props?: { ref?: Ref<Element> } }).props?.ref;
}

/** Combines refs owned by a Table part with the ref on its asChild host. */
export function resolveTableSlotRef(
  asChild: boolean | undefined,
  children: unknown,
  ref: Ref<Element> | undefined
): Ref<Element> | undefined {
  if (!asChild) return ref;
  const childRef = readTableChildRef(children);
  if (ref == null && childRef == null) return undefined;
  return composeRefs(ref, childRef);
}

/** Reads a host attribute used to retain native table role distinctions. */
export function readTableChildAttribute(
  children: unknown,
  attribute: string
): unknown {
  if (typeof children !== 'object' || children === null) return undefined;
  return (children as { props?: Record<string, unknown> }).props?.[attribute];
}
