import { Slot, mergeProps } from '@askrjs/askr/foundations';
import { isCssLength, mergeLayoutStyles } from '../../_internal/layout';
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
    size,
    ref,
    style: userStyle,
    ...rest
  } = props;

  const layoutStyle: Record<string, string | number> = {
    boxSizing: 'border-box',
    width: '100%',
    marginInline: 'auto',
  };
  if (isCssLength(maxWidth)) layoutStyle.maxWidth = maxWidth!;
  if (isCssLength(padding)) layoutStyle.paddingInline = padding!;

  const finalProps = mergeProps(rest, {
    ref,
    'data-slot': 'container',
    'data-max-width': maxWidth,
    'data-padding': padding,
    'data-size': size,
    style: mergeLayoutStyles(layoutStyle, userStyle),
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return <div {...finalProps}>{children}</div>;
}
