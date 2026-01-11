import { Slot } from '@askrjs/askr';

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
