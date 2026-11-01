import type { JSX } from '@askrjs/askr/jsx-runtime';
import {
  nativeButtonProps,
  withDefaultNativeButtonType,
} from '../_internal/native-control';
import { Slot } from '@askrjs/askr/foundations/structures';
import { controllableState } from '@askrjs/askr/foundations/state';
import {
  composeRefs,
  mergeProps,
  type Ref,
} from '@askrjs/askr/foundations/utilities';
import { checkablePress } from '../_internal/checkable-press';
import type { SwitchAsChildProps, SwitchButtonProps } from './switch.types';
import { formResetRef } from '../_internal/form-reset';

function readSwitchChildRef(children: unknown): Ref<Element> | undefined {
  if (typeof children !== 'object' || children === null) return undefined;
  return (children as { props?: { ref?: Ref<Element> } }).props?.ref;
}

function readSwitchChildForm(children: unknown): string | undefined {
  if (typeof children !== 'object' || children === null) return undefined;
  const form = (children as { props?: { form?: unknown } }).props?.form;
  return typeof form === 'string' ? form : undefined;
}

/**
 * Renders the `switch` part of `switch` with `role="switch"`.
 *
 * Supports polymorphic rendering via `asChild`.
 */
export function Switch(props: SwitchButtonProps): JSX.Element;
export function Switch(props: SwitchAsChildProps): JSX.Element;
export function Switch(props: SwitchButtonProps | SwitchAsChildProps) {
  const {
    asChild,
    children,
    checked,
    defaultChecked = false,
    onCheckedChange,
    disabled = false,
    required = false,
    name,
    value = 'on',
    ref,
    type: typeProp,
    ...rest
  } = props;

  const checkedState = controllableState({
    value: checked,
    defaultValue: defaultChecked,
    onChange: onCheckedChange,
  });
  const currentChecked = checkedState();
  const resetRef = formResetRef<Element>(() => {
    if (checked === undefined && checkedState() !== defaultChecked) {
      checkedState.set(defaultChecked);
    }
  });

  const interactionProps = checkablePress({
    disabled,
    onPress: () => checkedState.set(!currentChecked),
  });
  const childRef = asChild ? readSwitchChildRef(children) : undefined;
  const formAssociation =
    (rest as { form?: string }).form ??
    (asChild ? readSwitchChildForm(children) : undefined);
  const switchStateProps = {
    role: 'switch',
    'aria-checked': currentChecked ? 'true' : 'false',
    'aria-disabled': disabled ? 'true' : undefined,
    tabIndex: disabled ? -1 : 0,
    'data-slot': 'switch',
    'data-disabled': disabled ? 'true' : undefined,
    'data-state': currentChecked ? 'checked' : 'unchecked',
  };

  const finalProps = mergeProps(rest, {
    ...interactionProps,
    ref: composeRefs(ref as Ref<Element> | undefined, childRef, resetRef),
    ...switchStateProps,
    ...(!asChild && disabled ? { disabled: true } : {}),
  });
  Object.assign(finalProps, switchStateProps);

  const formProps = formAssociation
    ? ({ form: formAssociation } as unknown as JSX.IntrinsicElements['input'])
    : {};
  const hiddenInput = name ? (
    <input
      {...formProps}
      type="checkbox"
      hidden
      aria-hidden="true"
      tabIndex={-1}
      name={name}
      value={value}
      checked={currentChecked}
      required={required}
      disabled={disabled}
    />
  ) : null;

  if (asChild) {
    return (
      <>
        {hiddenInput}
        <Slot
          asChild
          {...withDefaultNativeButtonType(children, finalProps, typeProp)}
          children={children}
        />
      </>
    );
  }

  return (
    <>
      {hiddenInput}
      <button type={typeProp ?? 'button'} {...nativeButtonProps(finalProps)}>
        {children}
      </button>
    </>
  );
}
