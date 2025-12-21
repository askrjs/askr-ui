import { Slot } from '../../foundations/slot';

// Polymorphic types for Button
export type ButtonOwnProps = {
  children?: any;
  onClick?: (e: Event) => void;
  disabled?: boolean;
};

// Props when rendering a native button
export type ButtonButtonProps = ButtonOwnProps & {
  type?: 'button' | 'submit' | 'reset';
} & JSX.IntrinsicElements['button'];

// Overloads: native button vs asChild
export function Button(props: ButtonButtonProps): HTMLButtonElement;
export function Button<T extends Element = Element>(
  props: { asChild: true; children: T } & ButtonOwnProps & {
      ref?: ((el: T | null) => void) | { current: T | null } | null;
    } & Record<string, any>
): T;

export function Button(props: any) {
  const {
    asChild,
    children,
    onClick,
    type = 'button',
    disabled = false,
    ref,
    ...rest
  } = props;

  if (asChild) {
    const child =
      children && children instanceof Element ? (children as Element) : null;
    const extra: any = {};

    // If the child is not a native <button>, add role/tabIndex and keyboard activation
    if (child && child.tagName.toLowerCase() !== 'button') {
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
          // Trigger a click on the element so consumers see a normal activation event
          (child as any).dispatchEvent(
            new MouseEvent('click', { bubbles: true })
          );
        }
      };
    }

    // Handle click activation and disabled suppression
    extra.onClick = (e: Event) => {
      if (disabled) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      if (onClick) onClick(e);
    };

    // Disabled semantics
    if (disabled) {
      if (child && child.tagName.toLowerCase() === 'button') {
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

  return (
    <button
      ref={ref as any}
      type={type}
      onClick={(e: Event) => {
        if (!disabled && onClick) onClick(e);
      }}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
}
