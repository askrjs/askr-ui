import { Slot, type JSXElement } from '@askrjs/askr/foundations';
import type { Props } from '@askrjs/askr';
import { composeHandlers } from '../../interactions/composeHandlers';
import { mergeProps } from '../../interactions/mergeProps';
import { pressable } from '../../interactions/pressable';

type Ref<T> = ((el: T | null) => void) | { current: T | null } | null | undefined;

function composeRefs<T>(a: Ref<T>, b: Ref<T>): Ref<T> {
  if (!a) return b;
  if (!b) return a;
  return (value: T | null) => {
    if (typeof a === 'function') a(value);
    else (a as any).current = value;
    if (typeof b === 'function') b(value);
    else (b as any).current = value;
  };
}

function mergeChildProps(childProps: Record<string, any>, slotProps: Record<string, any>) {
  const out: Record<string, any> = { ...childProps, ...slotProps };

  for (const k of Object.keys(childProps)) {
    const cv = childProps[k];
    const sv = slotProps[k];

    if (typeof cv === 'function' && typeof sv === 'function' && k.startsWith('on')) {
      // Slot-provided semantics run first; child can opt out via preventDefault.
      out[k] = composeHandlers(sv, cv);
    }
  }

  // Compose refs if both exist.
  if ('ref' in childProps || 'ref' in slotProps) {
    out.ref = composeRefs(childProps.ref, slotProps.ref);
  }

  return out;
}

export type ButtonOwnProps = {
  children?: unknown;
  onClick?: (e: Event) => void;
  disabled?: boolean;
};

export type ButtonButtonProps = Omit<
  JSX.IntrinsicElements['button'],
  'children' | 'onClick' | 'disabled' | 'type' | 'ref'
> &
  ButtonOwnProps & {
    asChild?: false;
    ref?: Ref<HTMLButtonElement>;
    type?: 'button' | 'submit' | 'reset';
  };

export type ButtonAsChildProps = ButtonOwnProps & {
  asChild: true;
  children: JSXElement;
  ref?: Ref<unknown>;
  /** `type` is only valid for native <button>. */
  type?: never;
} & Props;

// Overloads: native button vs asChild
export function Button(props: ButtonButtonProps): JSX.Element;
export function Button(props: ButtonAsChildProps): JSX.Element;

export function Button(props: ButtonButtonProps | ButtonAsChildProps) {
  const {
    asChild,
    children,
    onClick,
    type: typeProp,
    disabled = false,
    ref,
    ...rest
  } = props;

  if (asChild) {
    const child = children as JSXElement;
    const isNativeButton = child.type === 'button';

    // For native button hosts we rely on native semantics (+ disabled attr)
    // and only wire click-through. For non-native hosts we use pressable.
    const injected = isNativeButton
      ? {
          onClick: (e: Event) => {
            if (disabled) return;
            onClick?.(e);
          },
          ...(disabled ? { disabled: true } : null),
        }
      : pressable({
          disabled,
          isNativeButton: false,
          onPress: (e) => onClick?.(e),
        });

    // Human props win, handlers are composed injected -> human.
    const merged = mergeProps(rest as any, injected as any);

    // Disabled should always win for focusability on non-native hosts.
    if (disabled && !isNativeButton) {
      (merged as any).tabIndex = -1;
    }

    const childProps = ((child as any).props ?? {}) as Record<string, any>;
    const finalProps = mergeChildProps(childProps, {
      ...merged,
      ref,
    });

    return (
      <Slot asChild {...finalProps}>
        {child}
      </Slot>
    );
  }

  const type = (typeProp as ButtonButtonProps['type']) ?? 'button';
  const handleClick = (e: Event) => {
    if (disabled) return;
    onClick?.(e);
  };

  return (
    <button
      ref={ref as any}
      type={type}
      disabled={disabled}
      onClick={handleClick as any}
      {...rest}
    >
      {children}
    </button>
  );
}
