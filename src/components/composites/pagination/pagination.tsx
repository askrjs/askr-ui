import { defineContext, readContext } from '@askrjs/askr';
import {
  Slot,
  controllableState,
  mergeProps,
  pressable,
} from '@askrjs/ui/foundations';
import { resolveCompoundId, resolvePartId } from '../../_internal/id';
import { buildPaginationModel, clampPage } from '../../_internal/pagination';
import type {
  PaginationEllipsisAsChildProps,
  PaginationEllipsisProps,
  PaginationNextAsChildProps,
  PaginationNextProps,
  PaginationPageAsChildProps,
  PaginationPageProps,
  PaginationPreviousAsChildProps,
  PaginationPreviousProps,
  PaginationProps,
} from './pagination.types';

type PaginationRootContextValue = {
  paginationId: string;
  page: number;
  setPage: (page: number) => void;
  count: number;
  disabled: boolean;
};

const PaginationRootContext = defineContext<PaginationRootContextValue | null>(
  null
);

function readPaginationRootContext(): PaginationRootContextValue {
  const context = readContext(PaginationRootContext);

  if (!context) {
    throw new Error('Pagination components must be used within <Pagination>');
  }

  return context;
}

function PaginationRootView(props: {
  finalProps: Record<string, unknown>;
  children?: unknown;
}) {
  return <nav {...props.finalProps}>{props.children}</nav>;
}

export function Pagination(props: PaginationProps) {
  const {
    boundaryCount = 1,
    children,
    count,
    defaultPage = 1,
    disabled = false,
    id,
    onPageChange,
    page,
    ref,
    siblingCount = 1,
    ...rest
  } = props;
  const paginationId = resolveCompoundId('pagination', id, children ?? count);
  const pageState = controllableState({
    value: page,
    defaultValue: clampPage(defaultPage, count),
    onChange: onPageChange,
  });
  const currentPage = clampPage(pageState(), count);
  const model = buildPaginationModel(
    count,
    currentPage,
    siblingCount,
    boundaryCount
  );
  const defaultChildren = [
    <PaginationPrevious key="previous">Previous</PaginationPrevious>,
    ...model.map((entry, index) =>
      entry.type === 'page' ? (
        <PaginationPage key={`page-${entry.page}`} page={entry.page} />
      ) : (
        <PaginationEllipsis key={`ellipsis-${entry.key}-${index}`} />
      )
    ),
    <PaginationNext key="next">Next</PaginationNext>,
  ];
  const setPage = (nextPage: number) => {
    pageState.set(clampPage(nextPage, count));
  };
  const finalProps = mergeProps(rest, {
    ref,
    'aria-label': 'Pagination',
    'data-slot': 'pagination',
    'data-pagination': 'true',
  });
  const rootContext: PaginationRootContextValue = {
    paginationId,
    page: currentPage,
    setPage,
    count,
    disabled,
  };

  return (
    <PaginationRootContext.Scope value={rootContext}>
      <PaginationRootView finalProps={finalProps as Record<string, unknown>}>
        {children ?? defaultChildren}
      </PaginationRootView>
    </PaginationRootContext.Scope>
  );
}

export function PaginationPrevious(props: PaginationPreviousProps): JSX.Element;
export function PaginationPrevious(
  props: PaginationPreviousAsChildProps
): JSX.Element;
export function PaginationPrevious(
  props: PaginationPreviousProps | PaginationPreviousAsChildProps
) {
  const {
    asChild,
    children,
    disabled = false,
    onPress,
    ref,
    type: typeProp,
    ...rest
  } = props;
  const root = readPaginationRootContext();
  const isDisabled = disabled || root.disabled || root.page <= 1;
  const interactionProps = pressable({
    disabled: isDisabled,
    onPress: (event) => {
      onPress?.(event);

      if (!event.defaultPrevented) {
        root.setPage(root.page - 1);
      }
    },
    isNativeButton: !asChild,
  });
  const finalProps = mergeProps(rest, {
    ...interactionProps,
    ref,
    id: resolvePartId(root.paginationId, 'previous'),
    'aria-label': 'Previous page',
    'data-slot': 'pagination-previous',
    'data-disabled': isDisabled ? 'true' : undefined,
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return (
    <button type={typeProp ?? 'button'} {...finalProps}>
      {children ?? 'Previous'}
    </button>
  );
}

export function PaginationNext(props: PaginationNextProps): JSX.Element;
export function PaginationNext(props: PaginationNextAsChildProps): JSX.Element;
export function PaginationNext(
  props: PaginationNextProps | PaginationNextAsChildProps
) {
  const {
    asChild,
    children,
    disabled = false,
    onPress,
    ref,
    type: typeProp,
    ...rest
  } = props;
  const root = readPaginationRootContext();
  const isDisabled = disabled || root.disabled || root.page >= root.count;
  const interactionProps = pressable({
    disabled: isDisabled,
    onPress: (event) => {
      onPress?.(event);

      if (!event.defaultPrevented) {
        root.setPage(root.page + 1);
      }
    },
    isNativeButton: !asChild,
  });
  const finalProps = mergeProps(rest, {
    ...interactionProps,
    ref,
    id: resolvePartId(root.paginationId, 'next'),
    'aria-label': 'Next page',
    'data-slot': 'pagination-next',
    'data-disabled': isDisabled ? 'true' : undefined,
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return (
    <button type={typeProp ?? 'button'} {...finalProps}>
      {children ?? 'Next'}
    </button>
  );
}

export function PaginationPage(props: PaginationPageProps): JSX.Element;
export function PaginationPage(props: PaginationPageAsChildProps): JSX.Element;
export function PaginationPage(
  props: PaginationPageProps | PaginationPageAsChildProps
) {
  const {
    asChild,
    children,
    disabled = false,
    onPress,
    page,
    ref,
    type: typeProp,
    ...rest
  } = props;
  const root = readPaginationRootContext();

  if (page === undefined) {
    throw new Error('PaginationPage requires an explicit `page` prop.');
  }

  const resolvedPage = clampPage(page, root.count);
  const isDisabled = disabled || root.disabled;
  const selected = root.page === resolvedPage;
  const interactionProps = pressable({
    disabled: isDisabled,
    onPress: (event) => {
      onPress?.(event);

      if (!event.defaultPrevented) {
        root.setPage(resolvedPage);
      }
    },
    isNativeButton: !asChild,
  });
  const finalProps = mergeProps(rest, {
    ...interactionProps,
    ref,
    id: resolvePartId(root.paginationId, `page-${resolvedPage}`),
    'aria-label': `Page ${resolvedPage}`,
    'aria-current': selected ? 'page' : undefined,
    'data-slot': 'pagination-page',
    'data-state': selected ? 'active' : 'inactive',
    'data-page': String(resolvedPage),
    'data-disabled': isDisabled ? 'true' : undefined,
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return (
    <button type={typeProp ?? 'button'} {...finalProps}>
      {children ?? String(resolvedPage)}
    </button>
  );
}

export function PaginationEllipsis(props: PaginationEllipsisProps): JSX.Element;
export function PaginationEllipsis(
  props: PaginationEllipsisAsChildProps
): JSX.Element;
export function PaginationEllipsis(
  props: PaginationEllipsisProps | PaginationEllipsisAsChildProps
) {
  const { asChild, children, ref, ...rest } = props;
  const finalProps = mergeProps(rest, {
    ref,
    'aria-hidden': 'true',
    'data-slot': 'pagination-ellipsis',
    'data-pagination-ellipsis': 'true',
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children ?? '...'} />;
  }

  return <span {...finalProps}>{children ?? '...'}</span>;
}
