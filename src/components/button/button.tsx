<<<<<<< HEAD
import { Slot } from '@askrjs/askr';
=======
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
>>>>>>> e883998f4e3d748a01295131ee8a806523002168

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
<<<<<<< HEAD
export function Button(props: ButtonButtonProps): HTMLButtonElement;

export function Button<T extends Element = Element>(
  props: { asChild: true; children: T } & ButtonOwnProps & {
      ref?: ((el: T | null) => void) | { current: T | null } | null;
    } & Record<string, any>
): T;
=======
export function Button(props: ButtonButtonProps): JSX.Element;
export function Button(props: ButtonAsChildProps): JSX.Element;
>>>>>>> e883998f4e3d748a01295131ee8a806523002168

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
<<<<<<< HEAD
    // If a real DOM node was passed as the child (used by tests), apply props directly
    const child = children && children instanceof Element ? children as Element : null;

    if (child) {
      // Merge attributes (skip forwarding `type` which shouldn't be applied to non-button anchors)
      Object.keys(rest).forEach((key) => {
        if (key === 'type') return;
        const val = (rest as any)[key];
        if (val == null) return;
        if (key === 'className') (child as any).className = val;
        else child.setAttribute(key, String(val));
      });

      const tag = child.tagName.toLowerCase();

      // Disabled semantics
      if (disabled) {
        if (tag === 'button') {
          (child as HTMLButtonElement).disabled = true;
        } else {
          child.setAttribute('aria-disabled', 'true');
          (child as any).tabIndex = -1;
        }
      }

      // Non-button children get role/tabindex and keyboard activation
      if (tag !== 'button') {
        if (!child.hasAttribute('role')) child.setAttribute('role', 'button');
        // Ensure element is focusable in jsdom (anchors without href are not focusable)
        (child as any).tabIndex = disabled ? -1 : 0;

        const keydown = (e: KeyboardEvent) => {
          if (disabled) {
            e.preventDefault();
            e.stopImmediatePropagation();
            return;
          }
          const key = (e as KeyboardEvent).key;
          if (key === 'Enter' || key === ' ' || key === 'Spacebar') {
            e.preventDefault();
            // Trigger a click on the element so consumers see a normal activation event
            child.dispatchEvent(new MouseEvent('click', { bubbles: true }));
          }
        };

        child.addEventListener('keydown', keydown as any);
      }

      // Ensure clicks are suppressed when disabled (capture phase to stop other handlers)
      child.addEventListener(
        'click',
        (e: Event) => {
          if (disabled) {
            e.preventDefault();
            e.stopImmediatePropagation();
            return;
          }
        },
        true
      );

      // Add our onClick handler (bubble phase so existing onclick handlers still run)
      if (onClick) {
        child.addEventListener('click', (e: Event) => {
          if (disabled) {
            e.preventDefault();
            e.stopImmediatePropagation();
            return;
          }
          onClick(e);
        });
      }

      // Forward ref (object or function)
      if (ref) {
        if (typeof ref === 'function') ref(child);
        else if (typeof ref === 'object') (ref as any).current = child;
      }

      return child;
    }

    // Fallback: if child is not a DOM node (JSX usage), use Slot semantics
    const extra: any = {};

    if (props && props.children && !(props.children instanceof Element)) {
      if (props.children && props.children.tagName && props.children.tagName.toLowerCase() !== 'button') {
        extra.role = 'button';
        extra.tabIndex = disabled ? -1 : 0;

        extra.onKeyDown = (e: KeyboardEvent) => {
          if (disabled) {
            e.preventDefault();
            e.stopPropagation();
            return;
          }
          const key = (e as KeyboardEvent).key;
          if (key === 'Enter' || key === ' ' || key === 'Spacebar') {
            e.preventDefault();
            (props.children as any).dispatchEvent(new MouseEvent('click', { bubbles: true }));
          }
        };
      }

      extra.onClick = (e: Event) => {
        if (disabled) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        if (onClick) onClick(e);
      };

      if (disabled) {
        if (props.children && props.children.tagName && props.children.tagName.toLowerCase() === 'button') {
          extra.disabled = true;
        } else {
          extra['aria-disabled'] = 'true';
        }
      }

      if (ref) extra.ref = ref;

      return (
        <Slot asChild {...rest} {...extra}>
          {children}
        </Slot>
      );
    }
=======
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
>>>>>>> e883998f4e3d748a01295131ee8a806523002168

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
