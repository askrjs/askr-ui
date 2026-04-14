import { defineContext, readContext } from '@askrjs/askr';

export type FieldContextValue = {
  fieldId?: string;
  invalid: boolean;
  required: boolean;
  disabled: boolean;
};

export type ResolvedFieldState = {
  baseId: string;
  describedBy?: string;
  resolvedInvalid: boolean;
  resolvedRequired: boolean;
  resolvedDisabled: boolean;
};

export const FieldContext = defineContext<FieldContextValue | null>(null);

export function readFieldContext(): FieldContextValue | null {
  return readContext(FieldContext);
}

export function resolveFieldId(
  explicitId?: string,
  context?: FieldContextValue | null
): string {
  if (context?.fieldId) {
    return context.fieldId;
  }

  if (explicitId) {
    return explicitId;
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
  context?: FieldContextValue | null;
}): ResolvedFieldState {
  const context = props.context ?? null;
  const resolvedInvalid = props.invalid ?? context?.invalid ?? false;
  const resolvedRequired = props.required ?? context?.required ?? false;
  const resolvedDisabled = props.disabled ?? context?.disabled ?? false;
  const baseId = resolveFieldId(props.fieldId, context);
  const describedBy = [
    `${baseId}-description`,
    resolvedInvalid ? `${baseId}-error` : null,
  ]
    .filter(Boolean)
    .join(' ');

  return {
    baseId,
    describedBy: describedBy || undefined,
    resolvedInvalid,
    resolvedRequired,
    resolvedDisabled,
  };
}
