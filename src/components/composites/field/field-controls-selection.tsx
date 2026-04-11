import { Checkbox } from '../../primitives/checkbox';
import { RadioGroup } from '../../primitives/radio-group';
import { Switch } from '../../primitives/switch';
import {
  type FieldCheckboxProps,
  type FieldRadioGroupProps,
  type FieldSwitchProps,
} from './field-types';
import { resolveFieldControlProps } from './field-control-shared';

export function FieldCheckbox(props: FieldCheckboxProps) {
  const { fieldId, invalid, required, disabled, ...rest } = props;
  const { controlProps, resolvedRequired } = resolveFieldControlProps(
    {
      fieldId,
      invalid,
      required,
      disabled,
    },
    'field-checkbox'
  );

  return <Checkbox {...rest} {...controlProps} required={resolvedRequired} />;
}

export function FieldSwitch(props: FieldSwitchProps) {
  const { fieldId, invalid, required, disabled, ...rest } = props;
  const { controlProps, resolvedRequired } = resolveFieldControlProps(
    {
      fieldId,
      invalid,
      required,
      disabled,
    },
    'field-switch'
  );

  return <Switch {...rest} {...controlProps} required={resolvedRequired} />;
}

export function FieldRadioGroup(props: FieldRadioGroupProps) {
  const { fieldId, invalid, required, disabled, ...rest } = props;
  const { controlProps } = resolveFieldControlProps(
    {
      fieldId,
      invalid,
      required,
      disabled,
    },
    'field-radio-group'
  );

  return <RadioGroup {...rest} {...controlProps} />;
}