import { DialogContent } from '../dialog';
import { readDialogRootContext } from '../dialog/dialog.shared';
import type {
  AlertDialogContentAsChildProps,
  AlertDialogContentProps,
} from './alert-dialog.types';

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
