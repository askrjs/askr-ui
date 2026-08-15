/**
 * AlertDialog type aliases keep the confirmation-specific public names while
 * reusing the Dialog contract underneath.
 */
import type {
  DialogCloseAsChildProps,
  DialogCloseProps,
  DialogContentAsChildProps,
  DialogContentOwnProps,
  DialogContentProps,
  DialogDescriptionAsChildProps,
  DialogDescriptionProps,
  DialogOverlayAsChildProps,
  DialogOverlayOwnProps,
  DialogOverlayProps,
  DialogPortalProps,
  DialogProps,
  DialogTitleAsChildProps,
  DialogTitleProps,
  DialogTriggerAsChildProps,
  DialogTriggerProps,
} from '../dialog/dialog.types';

/** Own props for Alert Dialog, before merging with native element attributes. */
export type AlertDialogOwnProps = DialogProps;
/** Props for Alert Dialog. */
export type AlertDialogProps = DialogProps;
/** Props for Alert Dialog Trigger. */
export type AlertDialogTriggerProps = DialogTriggerProps;
/** Props for the `asChild` (polymorphic) rendering of Alert Dialog Trigger. */
export type AlertDialogTriggerAsChildProps = DialogTriggerAsChildProps;
/** Props for Alert Dialog Portal. */
export type AlertDialogPortalProps = DialogPortalProps;
/** Own props for Alert Dialog Overlay, before merging with native element attributes. */
export type AlertDialogOverlayOwnProps = DialogOverlayOwnProps;
/** Props for Alert Dialog Overlay. */
export type AlertDialogOverlayProps = DialogOverlayProps;
/** Props for the `asChild` (polymorphic) rendering of Alert Dialog Overlay. */
export type AlertDialogOverlayAsChildProps = DialogOverlayAsChildProps;
/** Own props for Alert Dialog Content, before merging with native element attributes. */
export type AlertDialogContentOwnProps = DialogContentOwnProps;
/** Props for Alert Dialog Content. */
export type AlertDialogContentProps = DialogContentProps;
/** Props for the `asChild` (polymorphic) rendering of Alert Dialog Content. */
export type AlertDialogContentAsChildProps = DialogContentAsChildProps;
/** Props for Alert Dialog Title. */
export type AlertDialogTitleProps = DialogTitleProps;
/** Props for the `asChild` (polymorphic) rendering of Alert Dialog Title. */
export type AlertDialogTitleAsChildProps = DialogTitleAsChildProps;
/** Props for Alert Dialog Description. */
export type AlertDialogDescriptionProps = DialogDescriptionProps;
/** Props for the `asChild` (polymorphic) rendering of Alert Dialog Description. */
export type AlertDialogDescriptionAsChildProps = DialogDescriptionAsChildProps;
/** Props for Alert Dialog Action. */
export type AlertDialogActionProps = DialogCloseProps;
/** Props for the `asChild` (polymorphic) rendering of Alert Dialog Action. */
export type AlertDialogActionAsChildProps = DialogCloseAsChildProps;
/** Props for Alert Dialog Cancel. */
export type AlertDialogCancelProps = DialogCloseProps;
/** Props for the `asChild` (polymorphic) rendering of Alert Dialog Cancel. */
export type AlertDialogCancelAsChildProps = DialogCloseAsChildProps;
