import { Slot, mergeProps } from '@askrjs/askr/foundations';
import {
  applyBoxLayoutStyles,
  extractBoxDataAttributes,
  splitBoxLayoutProps,
  withBoxLayoutStyle,
} from '../../_internal/box-layout';
import {
  resolveContainerSizeValue,
  resolveInlineAlignValue,
  resolveSpaceValue,
  serializeResponsiveValue,
  setResponsiveStyleVar,
} from '../../_internal/layout';
import type {
  ContainerAsChildProps,
  ContainerNativeProps,
} from './container.types';

export function Container(props: ContainerNativeProps): JSX.Element;
export function Container(props: ContainerAsChildProps): JSX.Element;
export function Container(props: ContainerNativeProps | ContainerAsChildProps) {
  const {
    asChild,
    children,
    maxWidth,
    padding,
    size = '4',
    align = 'center',
    ref,
    style: userStyle,
    ...rest
  } = props;

  const { boxProps, rest: passthroughProps } = splitBoxLayoutProps(rest);
  const layoutStyle: Record<string, string | number> = {
    boxSizing: 'border-box',
    width: '100%',
  };
  applyBoxLayoutStyles(layoutStyle, boxProps);

  if (boxProps.maxWidth === undefined) {
    setResponsiveStyleVar(
      layoutStyle,
      'max-width',
      maxWidth ?? size,
      typeof (maxWidth ?? size) === 'string' &&
        (maxWidth ?? size) !== undefined &&
        ['1', '2', '3', '4', 'sm', 'md', 'lg', 'xl'].includes(
          String(maxWidth ?? size)
        )
        ? resolveContainerSizeValue
        : (value) => value
    );
  }

  if (padding !== undefined && boxProps.px === undefined && boxProps.pl === undefined && boxProps.pr === undefined) {
    setResponsiveStyleVar(layoutStyle, 'px', padding, resolveSpaceValue);
  }

  const applyAlign = (
    side: 'marginLeft' | 'marginRight',
    value: typeof align
  ) => {
    setResponsiveStyleVar(layoutStyle, side === 'marginLeft' ? 'ml' : 'mr', value, (input) => {
      const margins = resolveInlineAlignValue(input);
      return side === 'marginLeft' ? margins.marginLeft : margins.marginRight;
    });
  };

  if (boxProps.ml === undefined && boxProps.mr === undefined) {
    applyAlign('marginLeft', align);
    applyAlign('marginRight', align);
  }

  const finalProps = mergeProps(passthroughProps, {
    ref,
    'data-slot': 'container',
    'data-ak-layout': 'true',
    'data-size': serializeResponsiveValue(size),
    'data-align': serializeResponsiveValue(align),
    'data-max-width': serializeResponsiveValue(maxWidth),
    'data-padding': serializeResponsiveValue(padding),
    ...extractBoxDataAttributes(boxProps),
    style: withBoxLayoutStyle(layoutStyle, userStyle),
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return <div {...finalProps}>{children}</div>;
}
