import type { JSX } from '@askrjs/askr/jsx-runtime';
import { Slot } from '@askrjs/askr/foundations/structures';
import type { Ref } from '@askrjs/askr/foundations/utilities';
import { resolveAsChildRef } from '../_internal/slot-ref';
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
    const slotRef = resolveAsChildRef(
      children,
      ref as Ref<Element> | undefined
    );

    return (
      <Slot
        asChild
        {...rest}
        {...(slotRef === undefined ? {} : { ref: slotRef })}
        data-slot="form"
        children={children}
      />
    );
  }

  return (
    <form {...rest} ref={ref} data-slot="form">
      {children}
    </form>
  );
}
