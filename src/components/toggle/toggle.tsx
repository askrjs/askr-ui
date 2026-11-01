import type { JSX } from '@askrjs/askr/jsx-runtime';
import {
  nativeButtonProps,
  withDefaultNativeButtonType,
} from '../_internal/native-control';
import { nativeRef } from '../_internal/native-ref';
import { Slot } from '@askrjs/askr/foundations/structures';
import { pressable } from '@askrjs/askr/foundations/interactions';
import { composeRefs, mergeProps } from '@askrjs/askr/foundations/utilities';
import type { Ref } from '@askrjs/askr/foundations/utilities';
import type { ToggleButtonProps, ToggleAsChildProps } from './toggle.types';
import { isJsxElement } from '../_internal/jsx';

function readToggleChildRef(children: unknown): Ref<Element> | undefined {
  if (!isJsxElement(children)) return undefined;
  return children.props.ref as Ref<Element> | undefined;
}

function resolveToggleSlotRef(
  asChild: boolean | undefined,
  children: unknown,
  ref: Ref<Element> | undefined
): Ref<Element> | undefined {
  if (!asChild) return ref;
  const childRef = readToggleChildRef(children);
  if (ref == null && childRef == null) return undefined;
  return composeRefs(ref, childRef);
}

/**
 * Headless Toggle component
 *
 * ## Responsibilities
 * - Compose pressable foundation for interaction behavior
 * - Apply aria-pressed for toggle state signaling
 * - Default native buttons and direct asChild button hosts to type="button"
 * - Forward props and refs to native button or child element
 *
 * ## Non-Responsibilities (delegated to pressable foundation)
 * - Keyboard event handling (Enter/Space)
 * - Pointer event handling
 * - Disabled state enforcement
 * - Role attribute application (for non-native elements)
 *
 * ## Invariants
 * - MUST NOT contain any event handler logic
 * - MUST NOT check disabled or pressed props directly
 * - MUST use pressable() for ALL interaction behavior
 * - MUST use mergeProps() for ALL prop composition
 * - pressed state is CONTROLLED (consumer manages state)
 *
 * @example Native toggle button
 * ```tsx
 * const pressed = state(false);
 * <Toggle pressed={pressed()} onPress={() => pressed.set(!pressed())}>
 *   Mute
 * </Toggle>
 * ```
 *
 * @example Polymorphic rendering (asChild)
 * ```tsx
 * <Toggle asChild pressed={muted} onPress={toggleMute}>
 *   <span>Ã°Å¸â€â€¡</span>
 * </Toggle>
 * ```
 */
export function Toggle(props: ToggleButtonProps): JSX.Element;
/**
 * Renders the `toggle` part of `toggle`.
 *
 * Supports polymorphic rendering via `asChild`.
 */
export function Toggle(props: ToggleAsChildProps): JSX.Element;
export function Toggle(props: ToggleButtonProps | ToggleAsChildProps) {
  const {
    asChild,
    children,
    onPress,
    type: typeProp,
    pressed = false,
    disabled = false,
    ref,
    ...rest
  } = props;

  // Foundation delegation: ALL interaction behavior comes from pressable
  const interactionProps = pressable({
    disabled,
    onPress,
    isNativeButton: !asChild,
  });
  const resolvedRef = resolveToggleSlotRef(
    asChild,
    children,
    ref as Ref<Element> | undefined
  );

  // Prop composition: merge user props, interaction props, aria-pressed, and ref
  const finalProps = mergeProps(rest, {
    ...interactionProps,
    'aria-pressed': String(pressed),
    'data-slot': 'toggle',
    'data-disabled': disabled ? 'true' : undefined,
    'data-state': pressed ? 'on' : 'off',
    ref: resolvedRef,
  });

  if (asChild) {
    const slotProps = withDefaultNativeButtonType(
      children,
      finalProps,
      typeProp
    );
    return <Slot asChild {...slotProps} children={children} />;
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
