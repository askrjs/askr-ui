import { mergeProps } from '@askrjs/askr-ui/foundations';
import { DATA_TABLE_A11Y_CONTRACT } from './data-table.a11y';
import { readDataTableRootContext } from './data-table.shared';
import type {
  DataTableListActionsProps,
  DataTableListExpandedProps,
  DataTableListItemProps,
  DataTableListMainProps,
  DataTableListMetaProps,
  DataTableListViewProps,
} from './data-table.types';

const SLOTS = DATA_TABLE_A11Y_CONTRACT.SLOTS;

export function DataTableListView(props: DataTableListViewProps) {
  const { children, ref, ...rest } = props;
  const { table } = readDataTableRootContext();

  const finalProps = mergeProps(rest, {
    ref,
    role: 'list',
    'data-slot': SLOTS.list,
    'data-responsive-view': 'list',
  });

  if (children !== undefined && children !== null) {
    return <ul {...finalProps}>{children}</ul>;
  }

  // Auto-render list items
  const pageRows = table.getPageRows();

  return (
    <ul {...finalProps}>
      {pageRows.map((row) => (
        <DataTableListItem key={row.id} row={row} />
      ))}
    </ul>
  );
}

export function DataTableListItem<T>(props: DataTableListItemProps<T>) {
  const { children, row, ref, ...rest } = props;
  readDataTableRootContext();

  const finalProps = mergeProps(rest, {
    ref,
    'data-slot': SLOTS.listItem,
    'data-row-id': row.id,
    'data-selected': row.isSelected() ? 'true' : undefined,
    'data-expanded': row.isExpanded() ? 'true' : undefined,
    'aria-selected': row.isSelected() ? 'true' : undefined,
  });

  if (children !== undefined && children !== null) {
    return <li {...finalProps}>{children}</li>;
  }

  // Auto-render from mobile row model
  const primary = row.getListPrimary();
  const secondary = row.getListSecondary();
  const meta = row.getListMeta();
  const actions = row.getListActions();

  return (
    <li {...finalProps}>
      {primary != null && <DataTableListMain>{primary}</DataTableListMain>}
      {secondary.length > 0 && (
        <DataTableListMeta>
          {secondary.map((item, i) => (
            <span key={i} data-slot="data-table-list-secondary-item">
              {item}
            </span>
          ))}
        </DataTableListMeta>
      )}
      {meta.length > 0 && (
        <DataTableListMeta>
          {meta.map((item, i) => (
            <span key={i} data-slot="data-table-list-meta-item">
              {item}
            </span>
          ))}
        </DataTableListMeta>
      )}
      {actions != null && (
        <DataTableListActions>{actions}</DataTableListActions>
      )}
      {row.isExpanded() && <DataTableListExpanded />}
    </li>
  );
}

export function DataTableListMain(props: DataTableListMainProps) {
  const { children, ref, ...rest } = props;

  const finalProps = mergeProps(rest, {
    ref,
    'data-slot': SLOTS.listMain,
  });

  return <div {...finalProps}>{children}</div>;
}

export function DataTableListMeta(props: DataTableListMetaProps) {
  const { children, ref, ...rest } = props;

  const finalProps = mergeProps(rest, {
    ref,
    'data-slot': SLOTS.listMeta,
  });

  return <div {...finalProps}>{children}</div>;
}

export function DataTableListActions(props: DataTableListActionsProps) {
  const { children, ref, ...rest } = props;

  const finalProps = mergeProps(rest, {
    ref,
    'data-slot': SLOTS.listActions,
  });

  return <div {...finalProps}>{children}</div>;
}

export function DataTableListExpanded(props: DataTableListExpandedProps) {
  const { children, ref, ...rest } = props;

  const finalProps = mergeProps(rest, {
    ref,
    role: 'region',
    'data-slot': SLOTS.listExpanded,
  });

  return <div {...finalProps}>{children}</div>;
}
