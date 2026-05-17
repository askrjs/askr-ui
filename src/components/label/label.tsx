import { Slot } from '@askrjs/askr/foundations/structures';
import type { JSXElement } from '@askrjs/askr/foundations/structures';
import { mergeProps } from '@askrjs/askr/foundations/utilities';
import type { LabelAsChildProps, LabelLabelProps } from './label.types';

export function Label(props: LabelLabelProps): JSXElement;
export function Label(props: LabelAsChildProps): JSXElement;
export function Label(props: LabelLabelProps | LabelAsChildProps) {
  if (props.asChild) {
    const { asChild: _asChild, children, ref, ...rest } = props;
    const finalProps = mergeProps(rest, { ref, 'data-slot': 'label' });

    return <Slot asChild {...finalProps} children={children as JSXElement} />;
  }

  const { children, ref, htmlFor, ...rest } = props;
  const finalProps = mergeProps(rest, {
    ref,
    'data-slot': 'label',
    ...(htmlFor !== undefined ? { for: htmlFor } : {}),
  });

  return <label {...finalProps}>{children}</label>;
}
