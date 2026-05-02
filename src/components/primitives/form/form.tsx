import { Slot, mergeProps } from '@askrjs/askr/foundations';
import type { FormAsChildProps, FormProps } from './form.types';

export function Form(props: FormProps): JSX.Element;
export function Form(props: FormAsChildProps): JSX.Element;
export function Form(props: FormProps | FormAsChildProps) {
  const { asChild, children, ref, ...rest } = props;
  const finalProps = mergeProps(rest, {
    ref,
    'data-slot': 'form',
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return <form {...finalProps}>{children}</form>;
}
