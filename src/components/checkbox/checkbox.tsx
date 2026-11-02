import type { JSX } from '@askrjs/askr/jsx-runtime';
import { Slot } from '@askrjs/askr/foundations/structures';
import { state } from '@askrjs/askr';
import { runCancelablePress } from '../_internal/press';
import { composeRefs, mergeProps } from '@askrjs/askr/foundations/utilities';
import { checkablePress } from '../_internal/checkable-press';
import { formResetRef } from '../_internal/form-reset';
import { resolveAsChildRef } from '../_internal/slot-ref';
import type {
  CheckboxInputProps,
  CheckboxAsChildProps,
  PressEvent,
} from './checkbox.types';

type NativeInputRef =
  | ((value: Element | null) => void)
  | { current: Element | null }
  | null
  | undefined;

function getNativeInputProps({
  ref,
  resetRef,
  indeterminate,
  isControlled,
  currentChecked,
  ariaChecked,
  dataState,
  disabled,
  toggleChecked,
}: {
  ref: NativeInputRef;
  resetRef: (node: Element | null) => void;
  indeterminate: boolean;
  isControlled: boolean;
  currentChecked: boolean;
  ariaChecked: 'true' | 'false' | 'mixed';
  dataState: 'checked' | 'unchecked' | 'indeterminate';
  disabled: boolean;
  toggleChecked: (event: PressEvent) => void;
}) {
  return {
    ref: composeRefs(ref, resetRef, (node: Element | null) => {
      if (node instanceof HTMLInputElement) {
        node.indeterminate = indeterminate;
      }
    }),
    onClick: (event: Event) => {
      toggleChecked(event as PressEvent);

      if (isControlled) {
        (event.currentTarget as HTMLInputElement).checked = currentChecked;
      }
    },
    onChange: isControlled
      ? (event: Event) => {
          (event.currentTarget as HTMLInputElement).checked = currentChecked;
        }
      : undefined,
    'aria-checked': indeterminate ? undefined : ariaChecked,
    'aria-disabled': disabled ? 'true' : undefined,
    'data-slot': 'checkbox',
    'data-disabled': disabled ? 'true' : undefined,
    'data-state': dataState,
  };
}

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
 * const checked = state(false);
 * <Checkbox checked={checked()} onPress={() => checked.set(!checked())} />
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
/**
 * Renders the `checkbox` part of `checkbox` with `role="checkbox"`.
 *
 * Supports polymorphic rendering via `asChild`.
 */
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

  const isControlled = checked !== undefined;
  const internalChecked = state(defaultChecked);
  const internalCheckedValue = internalChecked();
  const currentChecked = isControlled ? checked : internalCheckedValue;
  const setChecked = (next: boolean) => {
    if (!isControlled) {
      internalChecked.set(next);
    }
    onCheckedChange?.(next);
  };

  const toggleChecked = (event: PressEvent) => {
    runCancelablePress(event, onPress, () => {
      setChecked(!currentChecked);
    });
  };
  const resetRef = formResetRef<Element>(() => {
    if (!isControlled && internalChecked() !== defaultChecked) {
      internalChecked.set(defaultChecked);
      onCheckedChange?.(defaultChecked);
    }
  });

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
  const normalizedRest = { ...rest } as Record<string, unknown>;
  delete normalizedRest['aria-checked'];
  if (disabled) {
    delete normalizedRest['aria-disabled'];
  }

  if (asChild) {
    const slotRef = resolveAsChildRef(children, ref as NativeInputRef);
    const child = children as {
      type?: unknown;
      props?: Record<string, unknown>;
    };
    const isNativeCheckbox =
      child?.type === 'input' && child.props?.type === 'checkbox';

    if (isNativeCheckbox) {
      // Keep native form, state, and keyboard behavior when the child is already
      // a checkbox input; custom hosts use the ARIA interaction path below.
      const finalProps = mergeProps(normalizedRest, {
        ...getNativeInputProps({
          ref: slotRef,
          resetRef,
          indeterminate,
          isControlled,
          currentChecked,
          ariaChecked,
          dataState,
          disabled,
          toggleChecked,
        }),
        checked: currentChecked,
        ...(disabled ? { disabled: true } : {}),
        ...(required ? { required: true } : {}),
        ...(name === undefined ? {} : { name }),
        ...(value === undefined ? {} : { value }),
      });

      return <Slot asChild {...finalProps} children={children} />;
    }

    const interactionProps = checkablePress({
      disabled,
      onPress: (event) => toggleChecked(event as PressEvent),
    });

    const finalProps = mergeProps(normalizedRest, {
      ...interactionProps,
      role: 'checkbox',
      'aria-checked': ariaChecked,
      'data-slot': 'checkbox',
      'data-disabled': disabled ? 'true' : undefined,
      'data-state': dataState,
      ref: composeRefs(slotRef, resetRef),
    });

    return <Slot asChild {...finalProps} children={children} />;
  }

  const finalProps = mergeProps(
    normalizedRest,
    getNativeInputProps({
      ref: ref as NativeInputRef,
      resetRef,
      indeterminate,
      isControlled,
      currentChecked,
      ariaChecked,
      dataState,
      disabled,
      toggleChecked,
    })
  );

  return (
    <input
      type="checkbox"
      checked={currentChecked}
      disabled={disabled}
      required={required}
      name={name}
      value={value}
      {...finalProps}
    />
  );
}
