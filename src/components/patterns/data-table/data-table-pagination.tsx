import { mergeProps, pressable } from '@askrjs/askr/foundations';
import { DATA_TABLE_A11Y_CONTRACT } from './data-table.a11y';
import { readDataTableRootContext } from './data-table.shared';
import type { DataTablePaginationProps } from './data-table.types';

const SLOTS = DATA_TABLE_A11Y_CONTRACT.SLOTS;

export function DataTablePagination(props: DataTablePaginationProps) {
  const { children, ref, ...rest } = props;
  const { table } = readDataTableRootContext();

  const finalProps = mergeProps(rest, {
    ref,
    'aria-label': 'Pagination',
    'data-slot': SLOTS.pagination,
  });

  if (children !== undefined && children !== null) {
    return <nav {...finalProps}>{children}</nav>;
  }

  // Auto-render default pagination controls
  const prevProps = pressable({
    disabled: !table.canPreviousPage(),
    onPress: () => table.previousPage(),
    isNativeButton: true,
  });

  const nextProps = pressable({
    disabled: !table.canNextPage(),
    onPress: () => table.nextPage(),
    isNativeButton: true,
  });

  const pagination = table.getPagination();
  const pageCount = table.getPageCount();

  return (
    <nav {...finalProps}>
      <button
        key="previous"
        type="button"
        aria-label="Previous page"
        data-slot="data-table-pagination-previous"
        data-disabled={!table.canPreviousPage() ? 'true' : undefined}
        {...prevProps}
      >
        Previous
      </button>
      <span key="info" data-slot="data-table-pagination-info">
        Page {pagination.page} of {pageCount}
      </span>
      <button
        key="next"
        type="button"
        aria-label="Next page"
        data-slot="data-table-pagination-next"
        data-disabled={!table.canNextPage() ? 'true' : undefined}
        {...nextProps}
      >
        Next
      </button>
    </nav>
  );
}
