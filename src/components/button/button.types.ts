import type { JSXElement } from '@askrjs/askr/foundations/structures';
import type { Ref } from '@askrjs/askr/foundations/utilities';

/**
 * Press event passed to onPress handler
 *
 * Compatible with the pressable foundation's PressEvent type.
 * Includes preventDefault and stopPropagation for event control.
 */
export type PressEvent = {
  preventDefault?: () => void;
  stopPropagation?: () => void;
  defaultPrevented?: boolean;
};

export type ButtonVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'destructive'
  | 'link';

export type ButtonSize =
  | 'xs'
  | 'sm'
  | 'md'
  | 'lg'
  | 'icon'
  | 'icon-xs'
  | 'icon-sm'
  | 'icon-lg';

export type ButtonWidth = 'auto' | 'full';

export type ButtonAsChildElement = JSXElement | JSX.Element;

/**
 * Core Button props shared across all variants
 */
export type ButtonOwnProps = {
  children?: unknown;
  onPress?: (e: PressEvent) => void;
  disabled?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  width?: ButtonWidth;
};

/**
 * Props when rendering as native <button>
 */
export type ButtonNativeProps = Omit<
  JSX.IntrinsicElements['button'],
  'children' | 'onClick' | 'disabled' | 'type' | 'ref'
> &
  ButtonOwnProps & {
    asChild?: false;
    ref?: Ref<HTMLButtonElement>;
    type?: 'button' | 'submit' | 'reset';
  };

/**
 * Props when rendering with asChild (polymorphic)
 */
export type ButtonAsChildProps = ButtonOwnProps & {
  asChild: true;
  children: ButtonAsChildElement;
  ref?: Ref<unknown>;
  type?: never;
};

/**
 * Union of all Button prop variants
 */
export type ButtonProps = ButtonNativeProps | ButtonAsChildProps;
