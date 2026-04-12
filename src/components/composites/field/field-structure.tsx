import { mergeProps } from '@askrjs/askr/foundations';
import type {
  FieldLegendProps,
  FieldProps,
  FieldRowProps,
  FieldsetProps,
} from './field-types';
import {
  FieldContext,
  FieldsetContext,
  createFieldContextValue,
  createFieldsetContextValue,
} from './field-shared';

function FieldView(props: {
  finalProps: ReturnType<typeof mergeProps>;
  children?: unknown;
}) {
  return <div {...props.finalProps}>{props.children}</div>;
}

function FieldsetView(props: {
  finalProps: ReturnType<typeof mergeProps>;
  children?: unknown;
}) {
  return <fieldset {...props.finalProps}>{props.children}</fieldset>;
}

export function Field(props: FieldProps) {
  const { children, ref, id, invalid, required, disabled, ...rest } = props;
  const fieldState = createFieldContextValue({
    id,
    invalid,
    required,
    disabled,
  });

  const finalProps = mergeProps(rest, {
    ref,
    id,
    'data-slot': 'field',
    'data-invalid': fieldState.invalid ? 'true' : undefined,
    'data-required': fieldState.required ? 'true' : undefined,
    'data-disabled': fieldState.disabled ? 'true' : undefined,
  });

  return (
    <FieldContext.Scope value={fieldState}>
      <FieldView finalProps={finalProps}>{children}</FieldView>
    </FieldContext.Scope>
  );
}

export function Fieldset(props: FieldsetProps) {
  const { children, ref, invalid, required, disabled, ...rest } = props;
  const fieldsetState = createFieldsetContextValue({
    invalid,
    required,
    disabled,
  });

  const finalProps = mergeProps(rest, {
    ref,
    'data-slot': 'fieldset',
    'data-invalid': fieldsetState.invalid ? 'true' : undefined,
    'data-required': fieldsetState.required ? 'true' : undefined,
    'data-disabled': fieldsetState.disabled ? 'true' : undefined,
    disabled: fieldsetState.disabled ? true : undefined,
  });

  return (
    <FieldsetContext.Scope value={fieldsetState}>
      <FieldsetView finalProps={finalProps}>{children}</FieldsetView>
    </FieldsetContext.Scope>
  );
}

export function FieldLegend(props: FieldLegendProps) {
  const { children, ref, ...rest } = props;
  const finalProps = mergeProps(rest, {
    ref,
    'data-slot': 'field-legend',
  });

  return <legend {...finalProps}>{children}</legend>;
}

export function FieldRow(props: FieldRowProps) {
  const { children, ref, ...rest } = props;

  const finalProps = mergeProps(rest, {
    ref,
    'data-slot': 'field-row',
  });

  return <label {...finalProps}>{children}</label>;
}
