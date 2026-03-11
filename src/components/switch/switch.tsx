import { Slot, mergeProps, pressable } from '@askrjs/askr/foundations';
import { state } from '@askrjs/askr';
import type { SwitchAsChildProps, SwitchButtonProps } from './switch.types';

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

  const internalChecked = state(defaultChecked);
  const isControlled = checked !== undefined;
  const currentChecked = isControlled ? checked : internalChecked();

  const setChecked = (next: boolean) => {
    if (!isControlled) {
      internalChecked.set(next);
    }
    onCheckedChange?.(next);
  };

  const interactionProps = pressable({
    disabled,
    onPress: () => setChecked(!currentChecked),
    isNativeButton: !asChild,
  });

  const finalProps = mergeProps(rest, {
    ...interactionProps,
    ref,
    role: asChild ? 'switch' : undefined,
    'aria-checked': currentChecked ? 'true' : 'false',
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
      <button type={typeProp ?? 'button'} {...finalProps}>
        {children}
      </button>
    </>
  );
}
