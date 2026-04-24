import { Slot, mergeProps } from '@askrjs/askr/foundations';
import {
  applyBoxLayoutStyles,
  extractBoxDataAttributes,
  splitBoxLayoutProps,
  withBoxLayoutStyle,
} from '../../_internal/box-layout';
import {
  resolveSectionSizeValue,
  serializeResponsiveValue,
  setResponsiveStyleVar,
} from '../../_internal/layout';
import type { SectionAsChildProps, SectionElementProps } from './section.types';

export function Section(props: SectionElementProps): JSX.Element;
export function Section(props: SectionAsChildProps): JSX.Element;
export function Section(props: SectionElementProps | SectionAsChildProps) {
  const {
    asChild,
    children,
    size = '3',
    ref,
    style: userStyle,
    ...rest
  } = props;

  const { boxProps, rest: passthroughProps } = splitBoxLayoutProps(rest);
  const layoutStyle: Record<string, string | number> = {};
  applyBoxLayoutStyles(layoutStyle, boxProps);

  if (
    boxProps.py === undefined &&
    boxProps.pt === undefined &&
    boxProps.pb === undefined
  ) {
    setResponsiveStyleVar(layoutStyle, 'py', size, resolveSectionSizeValue);
  }

  const finalProps = mergeProps(passthroughProps, {
    ref,
    'data-slot': 'section',
    'data-ak-layout': 'true',
    'data-size': serializeResponsiveValue(size),
    ...extractBoxDataAttributes(boxProps),
    style: withBoxLayoutStyle(layoutStyle, userStyle),
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return <section {...finalProps}>{children}</section>;
}
