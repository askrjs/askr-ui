import { Slot, mergeProps } from '@askrjs/askr/foundations';
import { isCssLength, mergeLayoutStyles } from '../../_internal/layout';
import type { FlexAsChildProps, FlexDivProps } from './flex.types';

export function Flex(props: FlexDivProps): JSX.Element;
export function Flex(props: FlexAsChildProps): JSX.Element;
export function Flex(props: FlexDivProps | FlexAsChildProps) {
  const {
    asChild,
    children,
    direction = 'row',
    gap,
    align,
    justify,
    wrap,
    collapseBelow,
    ref,
    style: userStyle,
    ...rest
  } = props;

  const layoutStyle: Record<string, string | number> = {
    display: 'flex',
    flexDirection: direction,
  };
  if (isCssLength(gap)) layoutStyle.gap = gap!;
  if (align) layoutStyle.alignItems = align;
  if (justify) layoutStyle.justifyContent = justify;
  if (wrap) layoutStyle.flexWrap = wrap;

  const finalProps = mergeProps(rest, {
    ref,
    'data-slot': 'flex',
    'data-direction': direction,
    'data-gap': gap,
    'data-align': align,
    'data-justify': justify,
    'data-wrap': wrap,
    'data-collapse-below': collapseBelow,
    style: mergeLayoutStyles(layoutStyle, userStyle),
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return <div {...finalProps}>{children}</div>;
}
