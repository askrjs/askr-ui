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
import { resolveCompoundId } from '../../_internal/id';
import { readDialogRootContext } from '../dialog/dialog.shared';
import type {
  AlertDialogActionAsChildProps,
  AlertDialogActionProps,
  AlertDialogCancelAsChildProps,
  AlertDialogCancelProps,
  AlertDialogContentAsChildProps,
  AlertDialogContentProps,
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
  const { children, id, ...rest } = props;
  const alertDialogId = resolveCompoundId('alert-dialog', id, children);

  return (
    <Dialog {...rest} id={alertDialogId} modal={true}>
      {children}
    </Dialog>
  );
}

export function AlertDialogTrigger(
  props: AlertDialogTriggerProps | AlertDialogTriggerAsChildProps
) {
  const root = readDialogRootContext();
  const handlePress = (event: {
    defaultPrevented?: boolean;
    preventDefault?: () => void;
  }) => {
    props.onPress?.(event as never);

    if (!event.defaultPrevented && root.open) {
      event.preventDefault?.();
    }
  };

  if (props.asChild) {
    return <DialogTrigger {...props} onPress={handlePress} />;
  }

  return <DialogTrigger {...props} onPress={handlePress} />;
}

export function AlertDialogPortal(
  props: AlertDialogPortalProps
): JSX.Element | null {
  return <DialogPortal {...props} />;
}

export function AlertDialogOverlay(
  props: AlertDialogOverlayProps | AlertDialogOverlayAsChildProps
): JSX.Element | null {
  if (props.asChild) {
    return <DialogOverlay {...props} />;
  }

  return <DialogOverlay {...props} />;
}

export function AlertDialogContent(
  props: AlertDialogContentProps | AlertDialogContentAsChildProps
) {
  const {
    children,
    onDismiss,
    onEscapeKeyDown,
    onPointerDownOutside,
    onInteractOutside,
    ...rest
  } = props;
  const root = readDialogRootContext();
  void onDismiss;

  const isAsChild = props.asChild === true;

  if (isAsChild) {
    const contentProps: AlertDialogContentAsChildProps = {
      ...(rest as Omit<AlertDialogContentAsChildProps, 'children' | 'asChild'>),
      asChild: true,
      children: children as JSX.Element,
      onEscapeKeyDown: (event: KeyboardEvent) => {
        onEscapeKeyDown?.(event);

        if (!event.defaultPrevented) {
          root.setOpen(false);
        }
      },
      onPointerDownOutside: (event: PointerEvent) => {
        onPointerDownOutside?.(event);
        event.preventDefault();
      },
      onInteractOutside,
    };

    return <DialogContent {...contentProps} />;
  }

  const contentProps: AlertDialogContentProps = {
    ...(rest as Omit<AlertDialogContentProps, 'children'>),
    onEscapeKeyDown: (event: KeyboardEvent) => {
      onEscapeKeyDown?.(event);

      if (!event.defaultPrevented) {
        root.setOpen(false);
      }
    },
    onPointerDownOutside: (event: PointerEvent) => {
      onPointerDownOutside?.(event);
      event.preventDefault();
    },
    onInteractOutside,
  };

  return <DialogContent {...contentProps}>{children}</DialogContent>;
}

export function AlertDialogTitle(
  props: AlertDialogTitleProps | AlertDialogTitleAsChildProps
) {
  if (props.asChild) {
    return <DialogTitle {...props} />;
  }

  return <DialogTitle {...props} />;
}

export function AlertDialogDescription(
  props: AlertDialogDescriptionProps | AlertDialogDescriptionAsChildProps
) {
  if (props.asChild) {
    return <DialogDescription {...props} />;
  }

  return <DialogDescription {...props} />;
}

export function AlertDialogAction(
  props: AlertDialogActionProps | AlertDialogActionAsChildProps
) {
  if (props.asChild) {
    return <DialogClose {...props} />;
  }

  return <DialogClose {...props} />;
}

export function AlertDialogCancel(
  props: AlertDialogCancelProps | AlertDialogCancelAsChildProps
) {
  if (props.asChild) {
    return <DialogClose {...props} />;
  }

  return <DialogClose {...props} />;
}
