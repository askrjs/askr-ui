import { mergeProps } from '@askrjs/ui/foundations';
import type {
  FieldLegendProps,
  FieldProps,
  FieldRowProps,
  FieldsetProps,
} from './field-types';
import { FieldContext } from './field-shared';

function FieldRootView(props: {
  children?: unknown;
  finalProps: Record<string, unknown>;
}) {
  return <div {...props.finalProps}>{props.children}</div>;
}

export function Field(props: FieldProps) {
  const {
    children,
    ref,
    id,
    invalid = false,
    required = false,
    disabled = false,
    ...rest
  } = props;
  const fieldContext = {
    fieldId: id,
    invalid,
    required,
    disabled,
  };

  const finalProps = mergeProps(rest, {
    ref,
    id,
    'data-slot': 'field',
    'data-invalid': invalid ? 'true' : undefined,
    'data-required': required ? 'true' : undefined,
    'data-disabled': disabled ? 'true' : undefined,
  });

  return (
    <FieldContext.Scope value={fieldContext}>
      <FieldRootView finalProps={finalProps}>{children}</FieldRootView>
    </FieldContext.Scope>
  );
}

export function Fieldset(props: FieldsetProps) {
  const {
    children,
    ref,
    invalid = false,
    required = false,
    disabled = false,
    ...rest
  } = props;

  const finalProps = mergeProps(rest, {
    ref,
    'data-slot': 'fieldset',
    'data-invalid': invalid ? 'true' : undefined,
    'data-required': required ? 'true' : undefined,
    'data-disabled': disabled ? 'true' : undefined,
    disabled: disabled ? true : undefined,
  });

  return <fieldset {...finalProps}>{children}</fieldset>;
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

