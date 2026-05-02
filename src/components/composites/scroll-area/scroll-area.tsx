import { For } from '@askrjs/askr';
import { Slot, mergeProps } from '@askrjs/askr/foundations';
import { resolveCompoundId, resolvePartId } from '../../_internal/id';
import { toChildArray } from '../../_internal/jsx';
import { readContext, defineContext } from '@askrjs/askr';
import { mergeStyles as mergeStyleValue } from '../../_internal/style';
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
  scrollbarId: string;
  thumbId: string;
  cornerId: string;
};

const ScrollAreaRootContext = defineContext<ScrollAreaRootContextValue | null>(
  null
);

function readScrollAreaRootContext(): ScrollAreaRootContextValue {
  const context = readContext(ScrollAreaRootContext);

  if (!context) {
    throw new Error('ScrollArea components must be used within <ScrollArea>');
  }

  return context;
}

function ScrollAreaRootView(props: { children?: unknown }) {
  const keyedChildren = (
    <For
      each={() => toChildArray(props.children)}
      by={(_child, index) => index}
    >
      {(child) => child as never}
    </For>
  );

  return <>{keyedChildren}</>;
}

export function ScrollArea(props: ScrollAreaProps): JSX.Element;
export function ScrollArea(props: ScrollAreaAsChildProps): JSX.Element;
export function ScrollArea(props: ScrollAreaProps | ScrollAreaAsChildProps) {
  const { children, id } = props;
  const scrollAreaId = resolveCompoundId('scroll-area', id, children);
  const viewportId = resolvePartId(scrollAreaId, 'viewport');
  const scrollbarId = resolvePartId(scrollAreaId, 'scrollbar');
  const thumbId = resolvePartId(scrollAreaId, 'thumb');
  const cornerId = resolvePartId(scrollAreaId, 'corner');

  const rootContext: ScrollAreaRootContextValue = {
    scrollAreaId,
    viewportId,
    scrollbarId,
    thumbId,
    cornerId,
  };

  return (
    <ScrollAreaRootContext.Scope value={rootContext}>
      <ScrollAreaRootView>{children}</ScrollAreaRootView>
    </ScrollAreaRootContext.Scope>
  );
}

export function ScrollAreaViewport(
  props: ScrollAreaViewportProps
): JSX.Element;
export function ScrollAreaViewport(
  props: ScrollAreaViewportAsChildProps
): JSX.Element;
export function ScrollAreaViewport(
  props: (ScrollAreaViewportProps | ScrollAreaViewportAsChildProps) & {
    style?: unknown;
  }
) {
  const { asChild, children, ref, style, ...rest } = props;
  const root = readScrollAreaRootContext();
  const finalProps = mergeProps(rest, {
    ref,
    id: root.viewportId,
    'data-slot': 'scroll-area-viewport',
    style: mergeStyleValue(
      {
        display: 'block',
        overflow: 'auto',
        width: '100%',
        height: '100%',
        WebkitOverflowScrolling: 'touch',
      },
      style
    ),
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return <div {...finalProps}>{children}</div>;
}

export function ScrollAreaScrollbar(props: ScrollAreaScrollbarProps): JSX.Element {
  const { children, orientation = 'vertical', ref, style, ...rest } = props;
  const root = readScrollAreaRootContext();
  const finalProps = mergeProps(rest, {
    ref,
    id: root.scrollbarId,
    'data-slot': 'scroll-area-scrollbar',
    'data-orientation': orientation,
    'data-state': 'visible',
    'aria-hidden': 'true',
    style: mergeStyleValue(
      {
        display: 'flex',
        flex: '0 0 auto',
        userSelect: 'none',
      },
      style
    ),
  });

  return <div {...finalProps}>{children}</div>;
}

export function ScrollAreaThumb(props: ScrollAreaThumbProps): JSX.Element {
  const { children, ref, style, ...rest } = props;
  const root = readScrollAreaRootContext();
  const finalProps = mergeProps(rest, {
    ref,
    id: root.thumbId,
    'data-slot': 'scroll-area-thumb',
    style: mergeStyleValue(
      {
        display: 'block',
        flex: '1 1 auto',
        minWidth: '100%',
        minHeight: '100%',
      },
      style
    ),
  });

  return <div {...finalProps}>{children}</div>;
}

export function ScrollAreaCorner(props: ScrollAreaCornerProps): JSX.Element {
  const { children, ref, style, ...rest } = props;
  const root = readScrollAreaRootContext();
  const finalProps = mergeProps(rest, {
    ref,
    id: root.cornerId,
    'data-slot': 'scroll-area-corner',
    'aria-hidden': 'true',
    style: mergeStyleValue(
      {
        display: 'block',
        flex: '0 0 auto',
      },
      style
    ),
  });

  return <div {...finalProps}>{children}</div>;
}
