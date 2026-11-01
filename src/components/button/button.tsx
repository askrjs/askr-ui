import type { JSX } from '@askrjs/askr/jsx-runtime';
import { nativeRef } from '../_internal/native-ref';
import {
  nativeButtonProps,
  withDefaultNativeButtonType,
} from '../_internal/native-control';
import { Slot } from '@askrjs/askr/foundations/structures';
import { mergeProps } from '@askrjs/askr/foundations/utilities';
import type { Ref } from '@askrjs/askr/foundations/utilities';
import { resolveAsChildRef } from '../_internal/slot-ref';
import { getButtonInteractionProps } from './button-interactions';
import type { ButtonNativeProps, ButtonAsChildProps } from './button.types';

function normalizeAriaProps(
  props: Record<string, unknown>
): Record<string, unknown> {
  const normalized = { ...props };
  for (const key of Object.keys(normalized)) {
    if (key.startsWith('aria-') && typeof normalized[key] === 'boolean') {
      normalized[key] = String(normalized[key]);
    }
  }
  return normalized;
}

/**
 * Headless Button component
 *
 * ## Responsibilities
 * - Compose pressable foundation for interaction behavior
 * - Default native buttons and direct asChild button hosts to type="button"
 * - Forward props and refs to native button or child element
 *
 * ## Non-Responsibilities (delegated to pressable foundation)
 * - Keyboard event handling (Enter/Space)
 * - Pointer event handling
 * - Disabled state enforcement
 * - ARIA attribute application
 *
 * ## Invariants
 * - MUST NOT contain any event handler logic
 * - MUST NOT check disabled prop directly
 * - MUST use pressable() for ALL interaction behavior
 * - MUST use mergeProps() for ALL prop composition
 *
 * @example Native button (prevents accidental submit)
 * ```tsx
 * <Button onPress={handleSave}>Save</Button>
 * ```
 *
 * @example Explicit form submission
 * ```tsx
 * <Button type="submit" onPress={handleSubmit}>Submit</Button>
 * ```
 *
 * @example Polymorphic rendering (asChild)
 * ```tsx
 * <Button asChild onPress={handleNav}>
 *   <a href="/home">Home</a>
 * </Button>
 * ```
 */
export function Button(props: ButtonNativeProps): JSX.Element;
/**
 * Renders the `button` part of `button`.
 *
 * Supports polymorphic rendering via `asChild`.
 */
export function Button(props: ButtonAsChildProps): JSX.Element;
export function Button(props: ButtonNativeProps | ButtonAsChildProps) {
  const {
    asChild,
    children,
    onPress,
    type: typeProp,
    disabled = false,
    variant,
    size,
    width,
    ref,
    ...rest
  } = props;

  const interactionProps = getButtonInteractionProps({
    asChild: Boolean(asChild),
    children,
    disabled,
    onPress,
  });

  const normalizedRest = normalizeAriaProps(rest);
  if (disabled) {
    // The disabled prop owns this state; do not let a forwarded ARIA value
    // contradict the interaction state supplied by the pressable foundation.
    delete normalizedRest['aria-disabled'];
  }

  const resolvedRef = asChild
    ? resolveAsChildRef(children, ref as Ref<Element> | undefined)
    : ref;
  // Prop composition: merge user props, interaction props, and ref
  const finalProps = mergeProps(normalizedRest, {
    ...interactionProps,
    'data-slot': 'button',
    'data-disabled': disabled ? 'true' : undefined,
    'data-variant': variant && variant !== 'default' ? variant : undefined,
    'data-size': size && size !== 'md' ? size : undefined,
    'data-width': width && width !== 'auto' ? width : undefined,
    ...(resolvedRef === undefined ? {} : { ref: resolvedRef }),
  });

  if (asChild) {
    const slotProps = withDefaultNativeButtonType(
      children,
      finalProps,
      typeProp
    );
    return <Slot asChild {...slotProps} children={children as JSX.Element} />;
  }

  // Explicit type="button" default prevents accidental form submission
  const type = typeProp ?? 'button';
  return (
    <button
      type={type}
      {...nativeButtonProps(finalProps)}
      ref={nativeRef<HTMLButtonElement>(props)}
    >
      {children}
    </button>
  );
}
