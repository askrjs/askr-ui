import { defineContext, readContext } from '@askrjs/askr';

export type FieldContextValue = {
  baseId?: string;
  describedBy?: string;
  invalid: boolean;
  required: boolean;
  disabled: boolean;
};

export type FieldsetContextValue = {
  invalid: boolean;
  required: boolean;
  disabled: boolean;
};

export const FieldContext = defineContext<FieldContextValue | null>(null);
export const FieldsetContext = defineContext<FieldsetContextValue | null>(null);

export type ResolvedFieldState = {
  baseId: string;
  describedBy?: string;
  resolvedInvalid: boolean;
  resolvedRequired: boolean;
  resolvedDisabled: boolean;
};

function readFieldContextValue() {
  return readContext(FieldContext);
}

function readFieldsetContextValue() {
  return readContext(FieldsetContext);
}

function buildFieldDescribedBy(baseId: string, invalid: boolean): string | undefined {
  const describedBy = [
    `${baseId}-description`,
    invalid ? `${baseId}-error` : null,
  ]
    .filter(Boolean)
    .join(' ');

  return describedBy || undefined;
}

export function resolveFieldId(explicitId?: string): string {
  const field = readFieldContextValue();

  if (explicitId) {
    return explicitId;
  }

  if (field?.baseId) {
    return field.baseId;
  }

  throw new Error(
    'Field subcomponents require a shared fieldId when used with the current runtime'
  );
}

export function resolveFieldState(props: {
  fieldId?: string;
  invalid?: boolean;
  required?: boolean;
  disabled?: boolean;
}): ResolvedFieldState {
  const field = readFieldContextValue();
  const fieldset = readFieldsetContextValue();
  const resolvedInvalid =
    props.invalid ?? field?.invalid ?? fieldset?.invalid ?? false;
  const resolvedRequired =
    props.required ?? field?.required ?? fieldset?.required ?? false;
  const resolvedDisabled =
    props.disabled ?? field?.disabled ?? fieldset?.disabled ?? false;
  const baseId = resolveFieldId(props.fieldId);
  const describedBy =
    field?.describedBy ?? buildFieldDescribedBy(baseId, resolvedInvalid);

  return {
    baseId,
    describedBy,
    resolvedInvalid,
    resolvedRequired,
    resolvedDisabled,
  };
}

export function createFieldContextValue(props: {
  id?: string;
  invalid?: boolean;
  required?: boolean;
  disabled?: boolean;
}): FieldContextValue {
  const fieldset = readFieldsetContextValue();
  const invalid = props.invalid ?? fieldset?.invalid ?? false;
  const required = props.required ?? fieldset?.required ?? false;
  const disabled = props.disabled ?? fieldset?.disabled ?? false;

  return {
    baseId: props.id,
    describedBy: props.id ? buildFieldDescribedBy(props.id, invalid) : undefined,
    invalid,
    required,
    disabled,
  };
}

export function createFieldsetContextValue(props: {
  invalid?: boolean;
  required?: boolean;
  disabled?: boolean;
}): FieldsetContextValue {
  const parentFieldset = readFieldsetContextValue();

  return {
    invalid: props.invalid ?? parentFieldset?.invalid ?? false,
    required: props.required ?? parentFieldset?.required ?? false,
    disabled: props.disabled ?? parentFieldset?.disabled ?? false,
  };
}
