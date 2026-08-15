/**
 * Toast prop and helper types model the host registry/viewport split used
 * by the stacked notification family.
 */
import type {
  ButtonLikeAsChildProps,
  ButtonLikeProps,
  BoxAsChildProps,
  BoxProps,
} from '../_internal/types';

/**
 * Props for the host that owns toast timing defaults and the registry.
 */
export type ToastHostOwnProps = {
  children?: unknown;
  id?: string;
  duration?: number;
};

/** Props for Toast Host. */
export type ToastHostProps = BoxProps<'div', HTMLDivElement> &
  ToastHostOwnProps;

/** Props for Toast Viewport. */
export type ToastViewportProps = BoxProps<'div', HTMLDivElement>;
/** Props for the `asChild` (polymorphic) rendering of Toast Viewport. */
export type ToastViewportAsChildProps = BoxAsChildProps;

/**
 * Visual variants for toast entries.
 */
export type ToastVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';

/**
 * Props for a toast registration entry declared through Toast.
 */
export type ToastOwnProps = {
  children?: unknown;
  id?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  duration?: number;
  variant?: ToastVariant;
};

/** Props for Toast. */
export type ToastProps = BoxProps<'div', HTMLDivElement> & ToastOwnProps;

/** Props for Toast Title. */
export type ToastTitleProps = BoxProps<'div', HTMLDivElement>;
/** Props for the `asChild` (polymorphic) rendering of Toast Title. */
export type ToastTitleAsChildProps = BoxAsChildProps;

/** Props for Toast Description. */
export type ToastDescriptionProps = BoxProps<'div', HTMLDivElement>;
/** Props for the `asChild` (polymorphic) rendering of Toast Description. */
export type ToastDescriptionAsChildProps = BoxAsChildProps;

/** Props for Toast Action. */
export type ToastActionProps = ButtonLikeProps<'button', HTMLButtonElement>;
/** Props for the `asChild` (polymorphic) rendering of Toast Action. */
export type ToastActionAsChildProps = ButtonLikeAsChildProps;

/** Props for Toast Close. */
export type ToastCloseProps = ButtonLikeProps<'button', HTMLButtonElement>;
/** Props for the `asChild` (polymorphic) rendering of Toast Close. */
export type ToastCloseAsChildProps = ButtonLikeAsChildProps;
