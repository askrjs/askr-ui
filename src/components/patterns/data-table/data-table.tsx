import { mergeProps } from '@askrjs/askr/foundations';
import { DATA_TABLE_A11Y_CONTRACT } from './data-table.a11y';
import {
  DataTableRootContext,
  readDataTableRootContext,
  type DataTableRootContextValue,
} from './data-table.shared';
import type {
  DataTableContentProps,
  DataTableInstance,
  DataTableRootProps,
} from './data-table.types';
import { DataTableTableView } from './data-table-table-view';
import { DataTableListView } from './data-table-list-view';
import { DataTableToolbar, DataTableSearch } from './data-table-toolbar';
import { DataTablePagination } from './data-table-pagination';
import {
  DataTableEmpty,
  DataTableLoading,
  DataTableError,
} from './data-table-states';

const SLOTS = DATA_TABLE_A11Y_CONTRACT.SLOTS;

export function DataTableRoot<T>(props: DataTableRootProps<T>) {
  const { table, children, id, ref, ...rest } = props;
  const tableId = id ?? table.tableId;

  const rootContext: DataTableRootContextValue = {
    table: table as DataTableInstance<any>,
    tableId,
  };

  const finalProps = mergeProps(rest, {
    ref,
    'data-slot': SLOTS.root,
    'data-state': table.getDataState(),
    'data-responsive-mode': table.getResponsiveMode(),
  });

  return (
    <DataTableRootContext.Scope value={rootContext}>
      <div {...finalProps}>{children}</div>
    </DataTableRootContext.Scope>
  );
}

export function DataTableContent(props: DataTableContentProps) {
  const { children, ref, ...rest } = props;

  const finalProps = mergeProps(rest, {
    ref,
    'data-slot': SLOTS.content,
  });

  if (children === undefined || children === null) {
    return (
      <div {...finalProps}>
        <DataTableAutoContent />
      </div>
    );
  }

  return <div {...finalProps}>{children}</div>;
}

function DataTableAutoContent() {
  const { table } = readDataTableRootContext();
  const dataState = table.getDataState();

  if (dataState === 'loading') {
    return <DataTableLoading />;
  }

  if (dataState === 'error') {
    return <DataTableError />;
  }

  if (dataState === 'empty' || dataState === 'filtered-empty') {
    return <DataTableEmpty />;
  }

  const mode = table.getResponsiveMode();

  if (mode === 'list') {
    return <DataTableListView />;
  }

  if (mode === 'table') {
    return <DataTableTableView />;
  }

  // auto: render both with data-responsive-view for CSS switching
  return (
    <>
      <DataTableTableView />
      <DataTableListView />
    </>
  );
}
