/**
 * INTERACTION POLICY (FRAMEWORK LAW)
 *
 * This is THE ONLY way to create interactive elements. Components MUST NOT
 * implement interaction logic directly.
 */

import { pressable } from './pressable';
import { composeHandlers } from '../utilities/compose-handlers';
import { composeRefs, Ref } from '../utilities/compose-ref';
import { mergeProps as mergePropsBase } from '../utilities/merge-props';

export interface InteractionPolicyInput {
  isNative: boolean;
  disabled: boolean;
  onPress?: (e: Event) => void;
  ref?: Ref<unknown>;
}

export function applyInteractionPolicy({
  isNative,
  disabled,
  onPress,
  ref,
}: InteractionPolicyInput) {
  function invokePress(e: Event) {
    if (disabled) {
      e.preventDefault?.();
      return;
    }
    onPress?.(e);
  }

  if (isNative) {
    return {
      disabled: disabled || undefined,
      onClick: (e: Event) => invokePress(e),
      ref,
    };
  }

  const interaction = pressable({
    disabled,
    isNativeButton: false,
    onPress: (e) => invokePress(e as Event),
  });

  return {
    ...interaction,
    'aria-disabled': disabled || undefined,
    tabIndex: disabled ? -1 : (interaction.tabIndex ?? 0),
    ref,
  };
}

export function mergeInteractionProps(
  childProps: Record<string, unknown>,
  policyProps: Record<string, unknown>,
  userProps?: Record<string, unknown>
) {
  let out = mergePropsBase(childProps, policyProps);
  if (userProps) out = mergePropsBase(out, userProps);

  for (const k in out) {
    if (!k.startsWith('on')) continue;

    const policyHandler = policyProps?.[k];
    const userHandler = userProps?.[k];
    const childHandler = childProps?.[k];

    if (policyHandler || userHandler || childHandler) {
      const toHandler = (h: unknown) =>
        typeof h === 'function'
          ? (h as (...args: readonly unknown[]) => void)
          : undefined;

      out[k] = composeHandlers(
        toHandler(policyHandler),
        composeHandlers(toHandler(userHandler), toHandler(childHandler))
      );
    }
  }

  const childRef = childProps?.ref as Ref<unknown> | undefined;
  const userRef = userProps?.ref as Ref<unknown> | undefined;
  const policyRef = policyProps?.ref as Ref<unknown> | undefined;

  out.ref = composeRefs(childRef, userRef, policyRef);

  return out;
}
