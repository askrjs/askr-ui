import { Slot, mergeProps } from '@askrjs/ui/foundations';
import type {
  FieldDescriptionAsChildProps,
  FieldDescriptionProps,
  FieldErrorAsChildProps,
  FieldErrorProps,
  FieldLabelAsChildProps,
  FieldLabelProps,
} from './field-types';
import { readFieldContext, resolveFieldId } from './field-shared';

export function FieldLabel(props: FieldLabelProps): JSX.Element;
export function FieldLabel(props: FieldLabelAsChildProps): JSX.Element;
export function FieldLabel(props: FieldLabelProps | FieldLabelAsChildProps) {
  const { asChild, children, ref, fieldId, ...rest } = props;
  const baseId = resolveFieldId(fieldId, readFieldContext());
  const finalProps = mergeProps(rest, {
    ref,
    'data-slot': 'field-label',
    for: `${baseId}-control`,
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return <label {...finalProps}>{children}</label>;
}

export function FieldDescription(props: FieldDescriptionProps): JSX.Element;
export function FieldDescription(
  props: FieldDescriptionAsChildProps
): JSX.Element;
export function FieldDescription(
  props: FieldDescriptionProps | FieldDescriptionAsChildProps
) {
  const { asChild, children, ref, fieldId, ...rest } = props;
  const baseId = resolveFieldId(fieldId, readFieldContext());
  const finalProps = mergeProps(rest, {
    ref,
    id: `${baseId}-description`,
    'data-slot': 'field-description',
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return <div {...finalProps}>{children}</div>;
}

export function FieldError(props: FieldErrorProps): JSX.Element;
export function FieldError(props: FieldErrorAsChildProps): JSX.Element;
export function FieldError(props: FieldErrorProps | FieldErrorAsChildProps) {
  const { asChild, children, ref, fieldId, ...rest } = props;
  const baseId = resolveFieldId(fieldId, readFieldContext());
  const finalProps = mergeProps(rest, {
    ref,
    id: `${baseId}-error`,
    'data-slot': 'field-error',
    role: 'alert',
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return <div {...finalProps}>{children}</div>;
}

