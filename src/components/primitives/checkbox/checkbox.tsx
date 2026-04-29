import {
  Slot,
  controllableState,
  mergeProps,
  pressable,
} from '@askrjs/ui/foundations';
import type {
  CheckboxInputProps,
  CheckboxAsChildProps,
  PressEvent,
} from './checkbox.types';

/**
 * Headless Checkbox component
 *
 * ## Responsibilities
 * - Apply aria-checked for checkbox state signaling
 * - Handle indeterminate state for native and asChild hosts
 * - Support controlled and uncontrolled checked state
 * - Forward props and refs to native input or child element
 * - Preserve native checkbox semantics and apply checkbox behavior to asChild hosts
 *
 * ## Non-Responsibilities
 * - Form submission orchestration beyond native input props
 *
 * ## Invariants
 * - MUST NOT add role="button" (native inputs are role="checkbox")
 * - checked state may be controlled or uncontrolled
 * - indeterminate overrides checked for state signaling
 * - For asChild, consumer MUST provide role="checkbox"
 *
 * @example Native checkbox input
 * ```tsx
 * const [checked, setChecked] = useState(false);
 * <Checkbox checked={checked} onPress={() => setChecked(!checked)} />
 * ```
 *
 * @example Polymorphic rendering (asChild)
 * ```tsx
 * <Checkbox asChild checked={agreed} onPress={toggleAgree}>
 *   <div role="checkbox">I agree to terms</div>
 * </Checkbox>
 * ```
 *
 * @example Indeterminate state (partial selection)
 * ```tsx
 * <Checkbox checked={someChecked} indeterminate={!allChecked && someChecked} onPress={toggleAll}>
 *   Select All
 * </Checkbox>
 * ```
 */
export function Checkbox(props: CheckboxInputProps): JSX.Element;
export function Checkbox(props: CheckboxAsChildProps): JSX.Element;
export function Checkbox(props: CheckboxInputProps | CheckboxAsChildProps) {
  const {
    asChild,
    children,
    onPress,
    checked,
    defaultChecked = false,
    onCheckedChange,
    indeterminate = false,
    disabled = false,
    required = false,
    name,
    value,
    ref,
    ...rest
  } = props;

  const checkedState = controllableState({
    value: checked,
    defaultValue: defaultChecked,
    onChange: onCheckedChange,
  });
  const isControlled = checked !== undefined;

  const toggleChecked = (event: PressEvent) => {
    onPress?.(event);

    if (event.defaultPrevented) {
      return;
    }

    checkedState.set(!checkedState());
  };

  const currentChecked = checkedState();
  const ariaChecked = indeterminate
    ? 'mixed'
    : currentChecked
      ? 'true'
      : 'false';
  const dataState = indeterminate
    ? 'indeterminate'
    : currentChecked
      ? 'checked'
      : 'unchecked';

  if (asChild) {
    const interactionProps = pressable({
      disabled,
      onPress: toggleChecked,
      isNativeButton: false,
    });

    const finalProps = mergeProps(rest, {
      ...interactionProps,
      role: 'checkbox',
      'aria-checked': ariaChecked,
      'data-slot': 'checkbox',
      'data-disabled': disabled ? 'true' : undefined,
      'data-state': dataState,
      ref,
    });

    return <Slot asChild {...finalProps} children={children} />;
  }

  const finalProps = mergeProps(rest, {
    ref,
    onClick: (e: Event) => {
      toggleChecked(e as PressEvent);

      if (isControlled) {
        (e.currentTarget as HTMLInputElement).checked = checkedState();
      }
    },
    onChange: isControlled
      ? (e: Event) => {
          (e.currentTarget as HTMLInputElement).checked = checkedState();
        }
      : undefined,
    'aria-checked': indeterminate ? undefined : ariaChecked,
    'aria-disabled': disabled ? 'true' : undefined,
    'data-slot': 'checkbox',
    'data-disabled': disabled ? 'true' : undefined,
    'data-state': dataState,
  });

  return (
    <input
      type="checkbox"
      checked={currentChecked}
      indeterminate={indeterminate}
      disabled={disabled}
      required={required}
      name={name}
      value={value}
      {...finalProps}
    />
  );
}
