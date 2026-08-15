import { Slot } from '@askrjs/askr/foundations/structures';
import { composeRefs, mergeProps } from '@askrjs/askr/foundations/utilities';
import { resolveCompoundId, resolvePartId } from '../_internal/id';
import { getSignal, readScope, defineScope, state } from '@askrjs/askr';
import type {
  ScrollAreaAsChildProps,
  ScrollAreaCornerProps,
  ScrollAreaProps,
  ScrollAreaScrollbarProps,
  ScrollAreaThumbProps,
  ScrollAreaViewportAsChildProps,
  ScrollAreaViewportProps,
} from './scroll-area.types';

type ScrollAreaRootContextValue = {
  scrollAreaId: string;
  viewportId: string;
  cornerId: string;
  setViewport: (node: HTMLElement | null) => void;
  setScrollbar: (
    orientation: 'vertical' | 'horizontal',
    node: HTMLElement | null
  ) => void;
  syncMetrics: () => void;
  metrics: (orientation: 'vertical' | 'horizontal') => ScrollMetrics;
  scroll: (orientation: 'vertical' | 'horizontal', key: string) => boolean;
};

type ScrollMetrics = { overflow: boolean; percentage: number };
type ScrollAreaEntry = {
  viewport: HTMLElement | null;
  observer: ResizeObserver | null;
  resizeFrame: number | null;
  cleanupSignal: AbortSignal | null;
  metrics: Record<'vertical' | 'horizontal', ScrollMetrics>;
  scrollbars: Map<'vertical' | 'horizontal', HTMLElement>;
};

const ScrollAreaRootContext = defineScope<ScrollAreaRootContextValue | null>(
  null
);
const ScrollAreaScrollbarContext = defineScope<{
  orientation: 'vertical' | 'horizontal';
  thumbId: string;
} | null>(null);

function readScrollAreaRootContext(): ScrollAreaRootContextValue {
  const context = readScope(ScrollAreaRootContext);

  if (!context) {
    throw new Error('ScrollArea components must be used within <ScrollArea>');
  }

  return context;
}

/**
 * Renders a part of `scroll-area`.
 */
export function ScrollArea(props: ScrollAreaProps): JSX.Element;
export function ScrollArea(props: ScrollAreaAsChildProps): JSX.Element;
export function ScrollArea(props: ScrollAreaProps | ScrollAreaAsChildProps) {
  const { children, id } = props;
  const scrollAreaId = resolveCompoundId('scroll-area', id, children);
  const viewportId = resolvePartId(scrollAreaId, 'viewport');
  const cornerId = resolvePartId(scrollAreaId, 'corner');
  const entry = state<ScrollAreaEntry>({
    viewport: null,
    observer: null,
    resizeFrame: null,
    cleanupSignal: null,
    metrics: {
      vertical: { overflow: false, percentage: 0 },
      horizontal: { overflow: false, percentage: 0 },
    },
    scrollbars: new Map(),
  })();

  const syncMetrics = () => {
    const viewport = entry.viewport;
    if (!viewport) {
      return;
    }
    const maxTop = Math.max(0, viewport.scrollHeight - viewport.clientHeight);
    const maxLeft = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    const nextVertical = {
      overflow: maxTop > 0,
      percentage: maxTop > 0 ? (viewport.scrollTop / maxTop) * 100 : 0,
    };
    const nextHorizontal = {
      overflow: maxLeft > 0,
      percentage: maxLeft > 0 ? (viewport.scrollLeft / maxLeft) * 100 : 0,
    };
    entry.metrics.vertical = nextVertical;
    entry.metrics.horizontal = nextHorizontal;
    for (const orientation of ['vertical', 'horizontal'] as const) {
      const scrollbar = entry.scrollbars.get(orientation);
      const metrics = entry.metrics[orientation];
      if (!scrollbar) {
        continue;
      }
      scrollbar.setAttribute(
        'aria-valuenow',
        String(Math.round(metrics.percentage))
      );
      scrollbar.setAttribute(
        'aria-disabled',
        metrics.overflow ? 'false' : 'true'
      );
      scrollbar.tabIndex = metrics.overflow ? 0 : -1;
      scrollbar.dataset.state = metrics.overflow ? 'visible' : 'hidden';
    }
  };

  const setViewport = (node: HTMLElement | null) => {
    if (entry.viewport === node) {
      return;
    }
    entry.observer?.disconnect();
    entry.observer = null;
    entry.viewport = node;
    if (!node) {
      return;
    }
    queueMicrotask(syncMetrics);
    if (typeof ResizeObserver !== 'undefined') {
      entry.observer = new ResizeObserver(() => {
        if (entry.resizeFrame !== null) {
          cancelAnimationFrame(entry.resizeFrame);
        }
        entry.resizeFrame = requestAnimationFrame(() => {
          entry.resizeFrame = null;
          syncMetrics();
        });
      });
      entry.observer.observe(node);
      if (node.firstElementChild) {
        entry.observer.observe(node.firstElementChild);
      }
    }
  };

  const signal = getSignal();
  if (entry.cleanupSignal !== signal) {
    entry.cleanupSignal = signal;
    signal.addEventListener(
      'abort',
      () => {
        entry.observer?.disconnect();
        if (entry.resizeFrame !== null) {
          cancelAnimationFrame(entry.resizeFrame);
        }
        entry.observer = null;
        entry.resizeFrame = null;
        entry.viewport = null;
        entry.scrollbars.clear();
      },
      { once: true }
    );
  }

  const rootContext: ScrollAreaRootContextValue = {
    scrollAreaId,
    viewportId,
    cornerId,
    setViewport,
    setScrollbar: (orientation, node) => {
      if (node) {
        entry.scrollbars.set(orientation, node);
        queueMicrotask(syncMetrics);
      } else {
        entry.scrollbars.delete(orientation);
      }
    },
    syncMetrics,
    metrics: (orientation) => entry.metrics[orientation],
    scroll: (orientation, key) => {
      const viewport = entry.viewport;
      if (!viewport) {
        return false;
      }
      const vertical = orientation === 'vertical';
      const current = vertical ? viewport.scrollTop : viewport.scrollLeft;
      const viewportSize = vertical
        ? viewport.clientHeight
        : viewport.clientWidth;
      const maximum = vertical
        ? viewport.scrollHeight - viewport.clientHeight
        : viewport.scrollWidth - viewport.clientWidth;
      const delta =
        key === 'ArrowUp' || key === 'ArrowLeft'
          ? -40
          : key === 'ArrowDown' || key === 'ArrowRight'
            ? 40
            : key === 'PageUp'
              ? -viewportSize
              : key === 'PageDown'
                ? viewportSize
                : null;
      const next =
        key === 'Home'
          ? 0
          : key === 'End'
            ? maximum
            : delta === null
              ? null
              : current + delta;
      if (next === null) {
        return false;
      }
      if (vertical) {
        viewport.scrollTop = next;
      } else {
        viewport.scrollLeft = next;
      }
      syncMetrics();
      return true;
    },
  };

  return (
    <ScrollAreaRootContext value={rootContext}>
      {children as JSX.Element}
    </ScrollAreaRootContext>
  );
}

/**
 * Renders a part of `scroll-area`.
 */
export function ScrollAreaViewport(props: ScrollAreaViewportProps): JSX.Element;
export function ScrollAreaViewport(
  props: ScrollAreaViewportAsChildProps
): JSX.Element;
export function ScrollAreaViewport(
  props: (ScrollAreaViewportProps | ScrollAreaViewportAsChildProps) & {
    style?: unknown;
  }
) {
  const { asChild, children, ref, style: _style, ...rest } = props;
  const root = readScrollAreaRootContext();
  const finalProps = mergeProps(rest, {
    ref: composeRefs(
      ref as
        | ((value: HTMLElement | null) => void)
        | { current: HTMLElement | null }
        | null
        | undefined,
      (node: HTMLElement | null) => {
        root.setViewport(node);
      }
    ),
    id: root.viewportId,
    role: 'region',
    tabIndex: 0,
    'data-slot': 'scroll-area-viewport',
    onScroll: (event: Event) => {
      if (event.currentTarget instanceof HTMLElement) {
        root.setViewport(event.currentTarget);
      }
      root.syncMetrics();
    },
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return <div {...finalProps}>{children}</div>;
}

/**
 * Renders the `scroll-area-scrollbar` part of `scroll-area` with `role="scrollbar"`.
 */
export function ScrollAreaScrollbar(
  props: ScrollAreaScrollbarProps
): JSX.Element {
  const {
    children,
    orientation = 'vertical',
    ref,
    style: _style,
    ...rest
  } = props;
  const root = readScrollAreaRootContext();
  const metrics = root.metrics(orientation);
  const scrollbarId = resolvePartId(
    root.scrollAreaId,
    `scrollbar-${orientation}`
  );
  const thumbId = resolvePartId(root.scrollAreaId, `thumb-${orientation}`);
  const finalProps = mergeProps(rest, {
    ref: composeRefs(ref, (node: HTMLElement | null) =>
      root.setScrollbar(orientation, node)
    ),
    id: scrollbarId,
    role: 'scrollbar',
    'aria-controls': root.viewportId,
    'aria-orientation': orientation,
    'aria-valuemin': '0',
    'aria-valuemax': '100',
    'aria-valuenow': String(Math.round(metrics.percentage)),
    'aria-disabled': metrics.overflow ? undefined : 'true',
    tabIndex: metrics.overflow ? 0 : -1,
    'data-slot': 'scroll-area-scrollbar',
    'data-orientation': orientation,
    'data-state': metrics.overflow ? 'visible' : 'hidden',
    onKeyDown: (event: KeyboardEvent) => {
      const orientationKey =
        orientation === 'vertical'
          ? ['ArrowUp', 'ArrowDown']
          : ['ArrowLeft', 'ArrowRight'];
      if (
        !orientationKey.includes(event.key) &&
        !['PageUp', 'PageDown', 'Home', 'End'].includes(event.key)
      ) {
        return;
      }
      if (root.scroll(orientation, event.key)) {
        event.preventDefault();
      }
    },
  });

  return (
    <ScrollAreaScrollbarContext value={{ orientation, thumbId }}>
      <div {...finalProps}>{children}</div>
    </ScrollAreaScrollbarContext>
  );
}

/**
 * Renders the `scroll-area-thumb` part of `scroll-area`.
 */
export function ScrollAreaThumb(props: ScrollAreaThumbProps): JSX.Element {
  const { children, ref, style: _style, ...rest } = props;
  readScrollAreaRootContext();
  const scrollbar = readScope(ScrollAreaScrollbarContext);
  if (!scrollbar) {
    throw new Error(
      'ScrollAreaThumb must be used within <ScrollAreaScrollbar>'
    );
  }
  const finalProps = mergeProps(rest, {
    ref,
    id: scrollbar.thumbId,
    'data-slot': 'scroll-area-thumb',
  });

  return <div {...finalProps}>{children}</div>;
}

/**
 * Renders the `scroll-area-corner` part of `scroll-area`.
 */
export function ScrollAreaCorner(props: ScrollAreaCornerProps): JSX.Element {
  const { children, ref, style: _style, ...rest } = props;
  const root = readScrollAreaRootContext();
  const finalProps = mergeProps(rest, {
    ref,
    id: root.cornerId,
    'data-slot': 'scroll-area-corner',
    'aria-hidden': 'true',
  });

  return <div {...finalProps}>{children}</div>;
}
