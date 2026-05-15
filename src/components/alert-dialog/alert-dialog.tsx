import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from '../dialog';
import { resolveCompoundId } from '../_internal/id';
import { readDialogRootContext } from '../dialog/dialog.shared';
import type {
  AlertDialogContentAsChildProps,
  AlertDialogContentProps,
  AlertDialogProps,
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

export {
  DialogPortal as AlertDialogPortal,
  DialogOverlay as AlertDialogOverlay,
};

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

  const isAsChild = props.asChild === true;
  const handleEscapeKeyDown = (event: KeyboardEvent) => {
    onEscapeKeyDown?.(event);

    if (!event.defaultPrevented) {
      root.setOpen(false);
    }
  };
  const handlePointerDownOutside = (event: PointerEvent) => {
    onPointerDownOutside?.(event);
    event.preventDefault();
  };
  const sharedProps = {
    ...(rest as Omit<AlertDialogContentProps, 'children'>),
    onEscapeKeyDown: handleEscapeKeyDown,
    onPointerDownOutside: handlePointerDownOutside,
    onInteractOutside,
    onDismiss,
  };

  if (isAsChild) {
    return (
      <DialogContent
        {...(sharedProps as Omit<
          AlertDialogContentAsChildProps,
          'children' | 'asChild'
        >)}
        asChild
        children={children as JSX.Element}
      />
    );
  }

  return <DialogContent {...sharedProps}>{children}</DialogContent>;
}

export {
  DialogTitle as AlertDialogTitle,
  DialogDescription as AlertDialogDescription,
  DialogClose as AlertDialogAction,
  DialogClose as AlertDialogCancel,
};
