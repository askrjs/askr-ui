import { For } from '@askrjs/askr';
import { Slot, mergeProps } from '@askrjs/askr/foundations';
import {
  applyBoxLayoutStyles,
  extractBoxDataAttributes,
  splitBoxLayoutProps,
  withBoxLayoutStyle,
} from '../../_internal/box-layout';
import { isJsxElement, toChildArray } from '../../_internal/jsx';
import {
  resolveAlignValue,
  resolveGridTrackValue,
  resolveJustifyValue,
  resolveSpaceValue,
  serializeResponsiveValue,
  setResponsiveStyleVar,
} from '../../_internal/layout';
import type {
  GridAsChildProps,
  GridDivProps,
  GridSpanProps,
} from './grid.types';

function resolveCompatibilityGridTemplate(
  minItemWidth: string | undefined,
  autoFit: boolean | undefined
): string | undefined {
  if (!minItemWidth) return undefined;
  const fitKeyword = autoFit === false ? 'auto-fill' : 'auto-fit';
  return `repeat(${fitKeyword}, minmax(${minItemWidth}, 1fr))`;
}

export function Grid(props: GridDivProps): JSX.Element;
export function Grid(props: GridSpanProps): JSX.Element;
export function Grid(props: GridAsChildProps): JSX.Element;
export function Grid(props: GridDivProps | GridSpanProps | GridAsChildProps) {
  const as = 'as' in props ? props.as : 'div';
  const {
    asChild,
    children,
    areas,
    columns,
    rows,
    flow,
    gap,
    gapX,
    gapY,
    align,
    justify,
    minItemWidth,
    autoFit,
    ref,
    style: userStyle,
    ...rest
  } = props;

  const { boxProps, rest: passthroughProps } = splitBoxLayoutProps(rest);
  const layoutStyle: Record<string, string | number> = {};
  applyBoxLayoutStyles(layoutStyle, boxProps);

  setResponsiveStyleVar(
    layoutStyle,
    'display',
    boxProps.display ?? 'grid',
    (value) => value
  );
  setResponsiveStyleVar(
    layoutStyle,
    'grid-template-areas',
    areas,
    (value) => value
  );
  setResponsiveStyleVar(
    layoutStyle,
    'grid-template-columns',
    columns ?? resolveCompatibilityGridTemplate(minItemWidth, autoFit),
    resolveGridTrackValue
  );
  setResponsiveStyleVar(
    layoutStyle,
    'grid-template-rows',
    rows,
    resolveGridTrackValue
  );
  setResponsiveStyleVar(layoutStyle, 'grid-auto-flow', flow, (value) => value);
  setResponsiveStyleVar(layoutStyle, 'gap', gap, resolveSpaceValue);
  setResponsiveStyleVar(layoutStyle, 'column-gap', gapX, resolveSpaceValue);
  setResponsiveStyleVar(layoutStyle, 'row-gap', gapY, resolveSpaceValue);
  setResponsiveStyleVar(layoutStyle, 'align-items', align, resolveAlignValue);
  setResponsiveStyleVar(
    layoutStyle,
    'justify-content',
    justify,
    resolveJustifyValue
  );

  const finalProps = mergeProps(passthroughProps, {
    ref,
    'data-slot': 'grid',
    'data-ak-layout': 'true',
    'data-areas': serializeResponsiveValue(areas),
    'data-columns': serializeResponsiveValue(columns),
    'data-rows': serializeResponsiveValue(rows),
    'data-flow': serializeResponsiveValue(flow),
    'data-gap': serializeResponsiveValue(gap),
    'data-gap-x': serializeResponsiveValue(gapX),
    'data-gap-y': serializeResponsiveValue(gapY),
    'data-align': serializeResponsiveValue(align),
    'data-justify': serializeResponsiveValue(justify),
    'data-min-item-width': minItemWidth,
    'data-auto-fit': autoFit !== undefined ? String(autoFit) : undefined,
    ...extractBoxDataAttributes(boxProps),
    style: withBoxLayoutStyle(layoutStyle, userStyle),
  });
  const keyedChildren = For<unknown>(
    () => toChildArray(children),
    (child, index) =>
      isJsxElement(child) && child.key != null ? child.key : index,
    (child) => child as never
  );

  if (asChild) {
    return <Slot asChild {...finalProps} children={children as JSX.Element} />;
  }

  if (as === 'span') {
    return <span {...finalProps}>{keyedChildren}</span>;
  }

  return <div {...finalProps}>{keyedChildren}</div>;
}
