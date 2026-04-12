import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from '../../composites/dialog';
import type {
  AlertDialogActionAsChildProps,
  AlertDialogActionProps,
  AlertDialogContentAsChildProps,
  AlertDialogContentProps,
  AlertDialogCancelAsChildProps,
  AlertDialogCancelProps,
  AlertDialogDescriptionAsChildProps,
  AlertDialogDescriptionProps,
  AlertDialogOverlayAsChildProps,
  AlertDialogOverlayProps,
  AlertDialogPortalProps,
  AlertDialogProps,
  AlertDialogTitleAsChildProps,
  AlertDialogTitleProps,
  AlertDialogTriggerAsChildProps,
  AlertDialogTriggerProps,
} from './alert-dialog.types';

export function AlertDialog(props: AlertDialogProps) {
  return <Dialog {...props} modal={true} />;
}

export const AlertDialogTrigger = DialogTrigger as (
  props: AlertDialogTriggerProps | AlertDialogTriggerAsChildProps
) => JSX.Element;

export const AlertDialogPortal =
  DialogPortal as (props: AlertDialogPortalProps) => JSX.Element | null;

export const AlertDialogOverlay = DialogOverlay as (
  props: AlertDialogOverlayProps | AlertDialogOverlayAsChildProps
) => JSX.Element | null;

const DialogContentCompat = DialogContent as (
  props: AlertDialogContentProps | AlertDialogContentAsChildProps
) => JSX.Element | null;

export function AlertDialogContent(
  props: AlertDialogContentProps | AlertDialogContentAsChildProps
) {
  const { role, onDismiss, ...rest } = props;

  return (
    <DialogContentCompat
      {...rest}
      role={role ?? 'alertdialog'}
      onDismiss={onDismiss ?? (() => {})}
    />
  );
}

export const AlertDialogTitle = DialogTitle as (
  props: AlertDialogTitleProps | AlertDialogTitleAsChildProps
) => JSX.Element;

export const AlertDialogDescription = DialogDescription as (
  props: AlertDialogDescriptionProps | AlertDialogDescriptionAsChildProps
) => JSX.Element;

export const AlertDialogAction = DialogClose as (
  props: AlertDialogActionProps | AlertDialogActionAsChildProps
) => JSX.Element;

export const AlertDialogCancel = DialogClose as (
  props: AlertDialogCancelProps | AlertDialogCancelAsChildProps
) => JSX.Element;
