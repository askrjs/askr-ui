import { Slot, mergeProps } from '@askrjs/askr/foundations';
import type {
  CheckboxInputProps,
  CheckboxAsChildProps,
} from './checkbox.types';

/**
 * Headless Checkbox component
 *
 * ## Responsibilities
 * - Apply aria-checked for checkbox state signaling
 * - Handle indeterminate state via aria-checked='mixed'
 * - Forward props and refs to native input or child element
 * - Delegate keyboard/mouse interaction to native input semantics
 *
 * ## Non-Responsibilities
 * - Custom keyboard event handling (native inputs handle this)
 * - Custom pointer event handling (delegated to onPress via wrapper)
 *
 * ## Invariants
 * - MUST NOT add role="button" (native inputs are role="checkbox")
 * - checked state is CONTROLLED (consumer manages state)
 * - indeterminate overrides checked for aria-checked value
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
    checked = false,
    indeterminate = false,
    disabled = false,
    required = false,
    name,
    value,
    ref,
    ...rest
  } = props;

  // Determine aria-checked based on indeterminate vs checked
  const ariaChecked = indeterminate ? 'mixed' : String(checked);

  // Interaction props: onClick handler that calls onPress
  const interactionProps = disabled
    ? {
        'aria-disabled': 'true',
        tabIndex: -1,
      }
    : {
        onClick: onPress
          ? (e: Event) => {
              if (!disabled) {
                onPress(e as PressEvent);
              }
            }
          : undefined,
        tabIndex: asChild ? 0 : undefined,
      };

  // Prop composition: merge user props, interaction props, aria-checked, and ref
  const finalProps = mergeProps(rest, {
    ...interactionProps,
    'aria-checked': ariaChecked,
    ref,
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  // Native checkbox input with proper attributes
  return (
    <input
      type="checkbox"
      checked={checked}
      disabled={disabled}
      required={required}
      name={name}
      value={value}
      {...finalProps}
    >
      {children}
    </input>
  );
}
