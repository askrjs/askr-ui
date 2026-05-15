/**
 * AlertDialog is the modal confirmation variant of Dialog.
 *
 * Responsibilities:
 * - Reuse the Dialog composition model for trigger, portal, overlay, and content.
 * - Keep the trigger interaction open-only so re-activation does not dismiss.
 * - Block outside pointer dismissal while still honoring Escape dismissal.
 *
 * Compatibility notes:
 * - AlertDialogAction and AlertDialogCancel are aliases of DialogClose.
 * - The aliases exist to preserve the semantic public surface for consumers.
 *
 * @example
 * ```tsx
 * <AlertDialog>
 *   <AlertDialogTrigger>Delete item</AlertDialogTrigger>
 *   <AlertDialogPortal>
 *     <AlertDialogContent>
 *       <AlertDialogTitle>Delete item?</AlertDialogTitle>
 *       <AlertDialogDescription>
 *         This action cannot be undone.
 *       </AlertDialogDescription>
 *       <AlertDialogAction>Delete</AlertDialogAction>
 *       <AlertDialogCancel>Cancel</AlertDialogCancel>
 *     </AlertDialogContent>
 *   </AlertDialogPortal>
 * </AlertDialog>
 * ```
 */
import { Dialog } from '../dialog';
import { resolveCompoundId } from '../_internal/id';
import type { AlertDialogProps } from './alert-dialog.types';

export function AlertDialog(props: AlertDialogProps) {
  const { children, id, ...rest } = props;
  const alertDialogId = resolveCompoundId('alert-dialog', id, children);

  return (
    <Dialog {...rest} id={alertDialogId} modal={true}>
      {children}
    </Dialog>
  );
}
