import { mergeProps } from '@askrjs/askr-ui/foundations';
import { DATA_TABLE_A11Y_CONTRACT } from './data-table.a11y';
import type {
  DataTableEmptyProps,
  DataTableErrorProps,
  DataTableLoadingProps,
} from './data-table.types';

const SLOTS = DATA_TABLE_A11Y_CONTRACT.SLOTS;

export function DataTableEmpty<T>(props: DataTableEmptyProps) {
  const { children, ref, ...rest } = props;

  const finalProps = mergeProps(rest, {
    ref,
    'data-slot': SLOTS.empty,
  });

  return <div {...finalProps}>{children ?? 'No data available'}</div>;
}

export function DataTableLoading<T>(props: DataTableLoadingProps) {
  const { children, ref, ...rest } = props;

  const finalProps = mergeProps(rest, {
    ref,
    'data-slot': SLOTS.loading,
    'aria-busy': 'true',
  });

  return <div {...finalProps}>{children ?? 'Loading...'}</div>;
}

export function DataTableError<T>(props: DataTableErrorProps) {
  const { children, ref, ...rest } = props;

  const finalProps = mergeProps(rest, {
    ref,
    role: 'alert',
    'data-slot': SLOTS.error,
  });

  return <div {...finalProps}>{children ?? 'An error occurred'}</div>;
}
