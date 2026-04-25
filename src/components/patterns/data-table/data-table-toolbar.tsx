import { mergeProps } from '@askrjs/askr-ui/foundations';
import { DATA_TABLE_A11Y_CONTRACT } from './data-table.a11y';
import { readDataTableRootContext } from './data-table.shared';
import type {
  DataTableSearchProps,
  DataTableToolbarProps,
} from './data-table.types';

const SLOTS = DATA_TABLE_A11Y_CONTRACT.SLOTS;

export function DataTableToolbar(props: DataTableToolbarProps) {
  const { children, ref, ...rest } = props;
  readDataTableRootContext();

  const finalProps = mergeProps(rest, {
    ref,
    'data-slot': SLOTS.toolbar,
  });

  return <div {...finalProps}>{children}</div>;
}

export function DataTableSearch(props: DataTableSearchProps) {
  const { placeholder, debounceMs = 300, ref, ...rest } = props;
  const { table, tableId } = readDataTableRootContext();

  let debounceTimer: ReturnType<typeof setTimeout> | undefined;
  const providedName = (rest as { name?: string }).name;
  const providedId = (rest as { id?: string }).id;
  const fallbackFieldId = tableId ? `${tableId}-search` : undefined;

  const handleInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const value = target.value;

    if (debounceMs > 0) {
      clearTimeout(debounceTimer);
      // Timer is necessary for input debounce; covered by determinism test
      debounceTimer = setTimeout(() => {
        table.setGlobalFilter(value);
      }, debounceMs);
    } else {
      table.setGlobalFilter(value);
    }
  };

  const finalProps = mergeProps(rest, {
    ref,
    type: 'search',
    id: providedId ?? fallbackFieldId,
    name: providedName ?? fallbackFieldId,
    placeholder: placeholder ?? 'Search...',
    'data-slot': SLOTS.search,
    'aria-label': placeholder ?? 'Search',
    onInput: handleInput,
  });

  return <input {...finalProps} />;
}
