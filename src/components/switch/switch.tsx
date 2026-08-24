import { nativeButtonProps } from '../_internal/native-control';
import { Slot } from '@askrjs/askr/foundations/structures';
import { controllableState } from '@askrjs/askr/foundations/state';
import { composeRefs, mergeProps } from '@askrjs/askr/foundations/utilities';
import { pressable } from '@askrjs/askr/foundations/interactions';
import type { SwitchAsChildProps, SwitchButtonProps } from './switch.types';
import { formResetRef } from '../_internal/form-reset';

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

  const interactionProps = pressable({
    disabled,
    onPress: () => checkedState.set(!currentChecked),
    isNativeButton: !asChild,
  });

  const finalProps = mergeProps(rest, {
    ...interactionProps,
    ref: composeRefs(
      ref as
        | ((value: Element | null) => void)
        | { current: Element | null }
        | null
        | undefined,
      resetRef
    ),
    role: 'switch',
    'aria-checked': currentChecked ? 'true' : 'false',
    'data-slot': 'switch',
    'data-disabled': disabled ? 'true' : undefined,
    'data-state': currentChecked ? 'checked' : 'unchecked',
  });

  const hiddenInput = name ? (
    <input
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
        <Slot asChild {...finalProps} children={children} />
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
