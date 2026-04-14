import { defineContext, readContext } from '@askrjs/askr';
import type { DataTableInstance } from './data-table.types';

export type DataTableRootContextValue = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  table: DataTableInstance<any>;
  tableId: string;
};

export const DataTableRootContext =
  defineContext<DataTableRootContextValue | null>(null);

export function readDataTableRootContext(): DataTableRootContextValue {
  const context = readContext(DataTableRootContext);

  if (!context) {
    throw new Error(
      'DataTable sub-components must be used within <DataTableRoot>'
    );
  }

  return context;
}
