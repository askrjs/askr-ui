import type {
  ButtonLikeAsChildProps,
  ButtonLikeProps,
  BoxAsChildProps,
  BoxProps,
} from '../_internal/types';

/** Own props for Dialog, before merging with native element attributes. */
export type DialogOwnProps = {
  children?: unknown;
  id?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  modal?: boolean;
};

/** Props for Dialog. */
export type DialogProps = DialogOwnProps;

/** Props for Dialog Trigger. */
export type DialogTriggerProps = ButtonLikeProps<'button', HTMLButtonElement>;
/** Props for the `asChild` (polymorphic) rendering of Dialog Trigger. */
export type DialogTriggerAsChildProps = ButtonLikeAsChildProps;

/** Props for Dialog Portal. */
export type DialogPortalProps = {
  children?: unknown;
};

/** Own props for Dialog Overlay, before merging with native element attributes. */
export type DialogOverlayOwnProps = {
  forceMount?: boolean;
};

/** Props for Dialog Overlay. */
export type DialogOverlayProps = BoxProps<'div', HTMLDivElement> &
  DialogOverlayOwnProps;

/** Props for the `asChild` (polymorphic) rendering of Dialog Overlay. */
export type DialogOverlayAsChildProps = BoxAsChildProps & DialogOverlayOwnProps;

/** Own props for Dialog Content, before merging with native element attributes. */
export type DialogContentOwnProps = {
  forceMount?: boolean;
  role?: 'dialog' | 'alertdialog';
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  onPointerDownOutside?: (event: PointerEvent) => void;
  onInteractOutside?: (event: Event) => void;
  onDismiss?: () => void;
  /** Explicit focus target used when a controlled dialog has no persistent trigger. */
  restoreFocus?: HTMLElement | null | (() => HTMLElement | null);
};

/** Props for Dialog Content. */
export type DialogContentProps = BoxProps<'div', HTMLDivElement> &
  DialogContentOwnProps;

/** Props for the `asChild` (polymorphic) rendering of Dialog Content. */
export type DialogContentAsChildProps = BoxAsChildProps & DialogContentOwnProps;

/** Props for Dialog Title. */
export type DialogTitleProps = BoxProps<'h2', HTMLHeadingElement>;
/** Props for the `asChild` (polymorphic) rendering of Dialog Title. */
export type DialogTitleAsChildProps = BoxAsChildProps;

/** Props for Dialog Description. */
export type DialogDescriptionProps = BoxProps<'p', HTMLParagraphElement>;
/** Props for the `asChild` (polymorphic) rendering of Dialog Description. */
export type DialogDescriptionAsChildProps = BoxAsChildProps;

/** Props for Dialog Close. */
export type DialogCloseProps = ButtonLikeProps<'button', HTMLButtonElement>;
/** Props for the `asChild` (polymorphic) rendering of Dialog Close. */
export type DialogCloseAsChildProps = ButtonLikeAsChildProps;
