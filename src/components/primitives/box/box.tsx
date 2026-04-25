import { Slot, mergeProps } from '@askrjs/askr-ui/foundations';
import {
  applyBoxLayoutStyles,
  extractBoxDataAttributes,
  splitBoxLayoutProps,
  withBoxLayoutStyle,
} from '../../_internal/box-layout';
import type { BoxAsChildProps, BoxDivProps, BoxSpanProps } from './box.types';

export function Box(props: BoxDivProps): JSX.Element;
export function Box(props: BoxSpanProps): JSX.Element;
export function Box(props: BoxAsChildProps): JSX.Element;
export function Box(props: BoxDivProps | BoxSpanProps | BoxAsChildProps) {
  const as = 'as' in props ? props.as : 'div';
  const { asChild, children, ref, style: userStyle, ...rest } = props;

  const { boxProps, rest: passthroughProps } = splitBoxLayoutProps(rest);
  const layoutStyle: Record<string, string | number> = {};
  applyBoxLayoutStyles(layoutStyle, boxProps);

  const finalProps = mergeProps(passthroughProps, {
    ref,
    'data-slot': 'box',
    'data-ak-layout': 'true',
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
