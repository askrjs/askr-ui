import { Slot } from '@askrjs/askr/foundations';
import type { FormAsChildProps, FormProps } from './form.types';

export function Form(props: FormProps): JSX.Element;
export function Form(props: FormAsChildProps): JSX.Element;
export function Form(props: FormProps | FormAsChildProps) {
  const { asChild, children, ref, ...rest } = props;

  if (asChild) {
    return (
      <Slot asChild {...rest} ref={ref} data-slot="form" children={children} />
    );
  }

  return (
    <form {...rest} ref={ref} data-slot="form">
      {children}
    </form>
  );
}
