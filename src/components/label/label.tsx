import { Slot, mergeProps } from '@askrjs/askr/foundations';
import type { LabelAsChildProps, LabelLabelProps } from './label.types';

export function Label(props: LabelLabelProps): JSX.Element;
export function Label(props: LabelAsChildProps): JSX.Element;
export function Label(props: LabelLabelProps | LabelAsChildProps) {
  const { asChild, children, ref, ...rest } = props;
  const finalProps = mergeProps(rest, { ref });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return <label {...finalProps}>{children}</label>;
}
