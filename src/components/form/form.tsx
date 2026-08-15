import { Slot } from '@askrjs/askr/foundations/structures';
import type { FormAsChildProps, FormProps } from './form.types';

/**
 * Renders a part of `form`.
 *
 * Supports polymorphic rendering via `asChild`.
 */
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
