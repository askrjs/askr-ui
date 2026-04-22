import { Slot, mergeProps } from '@askrjs/askr/foundations';
import {
  applyBoxLayoutStyles,
  extractBoxDataAttributes,
  splitBoxLayoutProps,
  withBoxLayoutStyle,
} from '../../_internal/box-layout';
import {
  resolveAlignValue,
  resolveJustifyValue,
  resolveSpaceValue,
  serializeResponsiveValue,
  setResponsiveStyleVar,
} from '../../_internal/layout';
import type {
  FlexAsChildProps,
  FlexDivProps,
  FlexSpanProps,
} from './inline.types';

const SLOTS = {
  root: 'flex',
} as const;

export function Flex(props: FlexDivProps): JSX.Element;
export function Flex(props: FlexSpanProps): JSX.Element;
export function Flex(props: FlexAsChildProps): JSX.Element;
export function Flex(
  props: FlexDivProps | FlexSpanProps | FlexAsChildProps
) {
  const as = 'as' in props ? props.as : 'div';
  const {
    asChild,
    children,
    direction = 'row',
    gap,
    gapX,
    gapY,
    align,
    justify,
    wrap,
    collapseBelow,
    ref,
    style: userStyle,
    ...rest
  } = props;

  const { boxProps, rest: passthroughProps } = splitBoxLayoutProps(rest);
  const rootSlot =
    typeof (passthroughProps as Record<string, unknown>)['data-slot'] === 'string'
      ? String((passthroughProps as Record<string, unknown>)['data-slot'])
      : SLOTS.root;
  const layoutStyle: Record<string, string | number> = {};
  applyBoxLayoutStyles(layoutStyle, boxProps);

  setResponsiveStyleVar(
    layoutStyle,
    'display',
    boxProps.display ?? 'flex',
    (value) => value
  );
  setResponsiveStyleVar(layoutStyle, 'flex-direction', direction, (value) => value);
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
  setResponsiveStyleVar(layoutStyle, 'flex-wrap', wrap, (value) => value);

  const finalProps = mergeProps(passthroughProps, {
    ref,
    'data-slot': rootSlot,
    'data-ak-layout': 'true',
    'data-direction': serializeResponsiveValue(direction),
    'data-gap': serializeResponsiveValue(gap),
    'data-gap-x': serializeResponsiveValue(gapX),
    'data-gap-y': serializeResponsiveValue(gapY),
    'data-align': serializeResponsiveValue(align),
    'data-justify': serializeResponsiveValue(justify),
    'data-wrap': serializeResponsiveValue(wrap),
    'data-collapse-below': collapseBelow,
    ...extractBoxDataAttributes(boxProps),
    style: withBoxLayoutStyle(layoutStyle, userStyle),
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  if (as === 'span') {
    return <span {...finalProps}>{children}</span>;
  }

  return <div {...finalProps}>{children}</div>;
}

export { Flex as Inline };
