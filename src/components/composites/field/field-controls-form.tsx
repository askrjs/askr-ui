import { Input } from '../../primitives/input';
import { SelectTrigger } from '../../primitives/select';
import { Textarea } from '../../primitives/textarea';
import {
  type FieldInputProps,
  type FieldSelectTriggerProps,
  type FieldTextareaProps,
} from './field-types';
import { resolveFieldControlProps } from './field-control-shared';

export function FieldInput(props: FieldInputProps) {
  const { fieldId, invalid, required, disabled, ...rest } = props;
  const { controlProps, resolvedRequired } = resolveFieldControlProps(
    {
      fieldId,
      invalid,
      required,
      disabled,
    },
    'field-input'
  );

  return <Input {...rest} {...controlProps} required={resolvedRequired} />;
}

export function FieldTextarea(props: FieldTextareaProps) {
  const { fieldId, invalid, required, disabled, ...rest } = props;
  const { controlProps, resolvedRequired } = resolveFieldControlProps(
    {
      fieldId,
      invalid,
      required,
      disabled,
    },
    'field-textarea'
  );

  return <Textarea {...rest} {...controlProps} required={resolvedRequired} />;
}

export function FieldSelectTrigger(props: FieldSelectTriggerProps) {
  const { fieldId, invalid, required, disabled, ...rest } = props;
  const { controlProps } = resolveFieldControlProps(
    {
      fieldId,
      invalid,
      required,
      disabled,
    },
    'field-select-trigger'
  );

  return <SelectTrigger {...rest} {...controlProps} />;
}