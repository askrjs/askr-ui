import { Slot, mergeProps } from '@askrjs/askr/foundations';
import type {
  FieldControlAsChildProps,
  FieldControlProps,
  FieldDescriptionAsChildProps,
  FieldDescriptionProps,
  FieldErrorAsChildProps,
  FieldErrorProps,
  FieldLabelAsChildProps,
  FieldLabelProps,
  FieldProps,
} from './field.types';

type FieldContext = {
  baseId: string;
  invalid: boolean;
  required: boolean;
  disabled: boolean;
};

const fieldStack: FieldContext[] = [];
let fieldIdCounter = 0;

function createFieldContext(props: FieldProps): FieldContext {
  fieldIdCounter += 1;
  return {
    baseId: props.id ?? `field-${fieldIdCounter}`,
    invalid: props.invalid ?? false,
    required: props.required ?? false,
    disabled: props.disabled ?? false,
  };
}

function readFieldContext(part: string): FieldContext {
  const ctx = fieldStack[fieldStack.length - 1];
  if (!ctx) {
    throw new Error(`Field ${part} must be used within <Field>`);
  }
  return ctx;
}

export function Field(props: FieldProps) {
  const {
    children,
    ref,
    invalid = false,
    required = false,
    disabled = false,
    ...rest
  } = props;

  const ctx = createFieldContext(props);
  fieldStack.push(ctx);

  try {
    const finalProps = mergeProps(rest, {
      ref,
      'data-invalid': invalid ? 'true' : undefined,
      'data-required': required ? 'true' : undefined,
      'data-disabled': disabled ? 'true' : undefined,
    });

    return <div {...finalProps}>{children}</div>;
  } finally {
    fieldStack.pop();
  }
}

export function FieldLabel(props: FieldLabelProps): JSX.Element;
export function FieldLabel(props: FieldLabelAsChildProps): JSX.Element;
export function FieldLabel(props: FieldLabelProps | FieldLabelAsChildProps) {
  const ctx = readFieldContext('label');
  const { asChild, children, ref, ...rest } = props;
  const finalProps = mergeProps(rest, {
    ref,
    htmlFor: `${ctx.baseId}-control`,
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return <label {...finalProps}>{children}</label>;
}

export function FieldDescription(props: FieldDescriptionProps): JSX.Element;
export function FieldDescription(props: FieldDescriptionAsChildProps): JSX.Element;
export function FieldDescription(
  props: FieldDescriptionProps | FieldDescriptionAsChildProps
) {
  const ctx = readFieldContext('description');
  const { asChild, children, ref, ...rest } = props;
  const finalProps = mergeProps(rest, {
    ref,
    id: `${ctx.baseId}-description`,
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return <div {...finalProps}>{children}</div>;
}

export function FieldError(props: FieldErrorProps): JSX.Element;
export function FieldError(props: FieldErrorAsChildProps): JSX.Element;
export function FieldError(props: FieldErrorProps | FieldErrorAsChildProps) {
  const ctx = readFieldContext('error');
  const { asChild, children, ref, ...rest } = props;
  const finalProps = mergeProps(rest, {
    ref,
    id: `${ctx.baseId}-error`,
    role: 'alert',
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return <div {...finalProps}>{children}</div>;
}

export function FieldControl(props: FieldControlProps): JSX.Element;
export function FieldControl(props: FieldControlAsChildProps): JSX.Element;
export function FieldControl(
  props: FieldControlProps | FieldControlAsChildProps
) {
  const ctx = readFieldContext('control');
  const { asChild, children, ref, ...rest } = props;
  const describedBy = [
    `${ctx.baseId}-description`,
    ctx.invalid ? `${ctx.baseId}-error` : null,
  ]
    .filter(Boolean)
    .join(' ');

  const finalProps = mergeProps(rest, {
    ref,
    id: `${ctx.baseId}-control`,
    'aria-describedby': describedBy || undefined,
    'aria-invalid': ctx.invalid ? 'true' : undefined,
    'aria-required': ctx.required ? 'true' : undefined,
    'aria-disabled': ctx.disabled ? 'true' : undefined,
    disabled: ctx.disabled ? true : undefined,
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return <div {...finalProps}>{children}</div>;
}
