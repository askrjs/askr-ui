import { mergeProps } from '@askrjs/askr-ui/foundations';
import { DATA_TABLE_A11Y_CONTRACT } from './data-table.a11y';
import { isJsxElement, toChildArray } from '../../_internal/jsx';
import {
  DataTableRootContext,
  readDataTableRootContext,
} from './data-table.shared';
import type {
  DataTableContentProps,
  DataTableRootProps,
} from './data-table.types';
import { DataTableTableView } from './data-table-table-view';
import { DataTableListView } from './data-table-list-view';
import {
  DataTableEmpty,
  DataTableLoading,
  DataTableError,
} from './data-table-states';

const SLOTS = DATA_TABLE_A11Y_CONTRACT.SLOTS;

function DataTableRootView(props: {
  children?: unknown;
  finalProps: Record<string, unknown>;
}) {
  const keyedChildren = toChildArray(props.children).map((child, index) => {
    if (!isJsxElement(child) || child.key != null) {
      return child;
    }

    return {
      ...child,
      key: `data-table-root-${index}`,
    };
  });

  return <div {...props.finalProps}>{keyedChildren}</div>;
}

function DataTableContentView(props: {
  children?: unknown;
  finalProps: Record<string, unknown>;
}) {
  const keyedChildren = toChildArray(props.children).map((child, index) => {
    if (!isJsxElement(child) || child.key != null) {
      return child;
    }

    return {
      ...child,
      key: `data-table-content-${index}`,
    };
  });

  return <div {...props.finalProps}>{keyedChildren}</div>;
}

export function DataTableRoot<T>(props: DataTableRootProps<T>) {
  const { table, children, id, ref, ...rest } = props;
  const tableId = id ?? table.tableId;
  const rootContext = {
    table,
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
      <DataTableRootView finalProps={finalProps}>{children}</DataTableRootView>
    </DataTableRootContext.Scope>
  );
}

export function DataTableContent<T>(props: DataTableContentProps) {
  const { children, ref, ...rest } = props;

  const finalProps = mergeProps(rest, {
    ref,
    'data-slot': SLOTS.content,
  });

  // If no children provided, auto-render based on state
  if (children === undefined || children === null) {
    return (
      <DataTableContentView finalProps={finalProps}>
        <DataTableAutoContent />
      </DataTableContentView>
    );
  }

  return (
    <DataTableContentView finalProps={finalProps}>
      {children}
    </DataTableContentView>
  );
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
