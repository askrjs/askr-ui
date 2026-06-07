import { Slot } from '@askrjs/askr/foundations/structures';
import { mergeProps } from '@askrjs/askr/foundations/utilities';
import { resolveCompoundId, resolvePartId } from '../_internal/id';
import { readContext, defineContext } from '@askrjs/askr';
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
      {children as JSX.Element}
    </ScrollAreaRootContext.Scope>
  );
}

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
    ref,
    id: root.viewportId,
    'data-slot': 'scroll-area-viewport',
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return <div {...finalProps}>{children}</div>;
}

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
  const finalProps = mergeProps(rest, {
    ref,
    id: root.scrollbarId,
    'data-slot': 'scroll-area-scrollbar',
    'data-orientation': orientation,
    'data-state': 'visible',
    'aria-hidden': 'true',
  });

  return <div {...finalProps}>{children}</div>;
}

export function ScrollAreaThumb(props: ScrollAreaThumbProps): JSX.Element {
  const { children, ref, style: _style, ...rest } = props;
  const root = readScrollAreaRootContext();
  const finalProps = mergeProps(rest, {
    ref,
    id: root.thumbId,
    'data-slot': 'scroll-area-thumb',
  });

  return <div {...finalProps}>{children}</div>;
}

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
