import { resolveFieldState } from './field-shared';

export type FieldControlStateProps = {
  fieldId?: string;
  invalid?: boolean;
  required?: boolean;
  disabled?: boolean;
};

export function resolveFieldControlProps(
  props: FieldControlStateProps,
  slot: string
) {
  const {
    baseId,
    describedBy,
    resolvedInvalid,
    resolvedRequired,
    resolvedDisabled,
  } = resolveFieldState(props);

  return {
    resolvedRequired,
    controlProps: {
      id: `${baseId}-control`,
      'aria-describedby': describedBy,
      'aria-invalid': resolvedInvalid ? 'true' : undefined,
      'aria-required': resolvedRequired ? 'true' : undefined,
      'aria-disabled': resolvedDisabled ? 'true' : undefined,
      disabled: resolvedDisabled,
      'data-slot': slot,
      'data-invalid': resolvedInvalid ? 'true' : undefined,
      'data-required': resolvedRequired ? 'true' : undefined,
      'data-disabled': resolvedDisabled ? 'true' : undefined,
    },
  };
}
