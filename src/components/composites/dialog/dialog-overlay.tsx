import { Presence, Slot, mergeProps } from '@askrjs/askr-ui/foundations';
import { readDialogRootContext } from './dialog.shared';
import type {
  DialogOverlayAsChildProps,
  DialogOverlayProps,
} from './dialog.types';

export function DialogOverlay(props: DialogOverlayProps): JSX.Element | null;
export function DialogOverlay(
  props: DialogOverlayAsChildProps
): JSX.Element | null;
export function DialogOverlay(
  props: DialogOverlayProps | DialogOverlayAsChildProps
) {
  const { asChild, children, forceMount = false, ref, ...rest } = props;
  const root = readDialogRootContext();
  const finalProps = mergeProps(rest, {
    ref,
    'data-slot': 'dialog-overlay',
    'data-state': root.open ? 'open' : 'closed',
    'data-dialog-overlay': 'true',
    'aria-hidden': 'true',
  });

  return (
    <Presence present={forceMount || root.open}>
      {asChild ? (
        <Slot asChild {...finalProps} children={children} />
      ) : (
        <div {...finalProps}>{children}</div>
      )}
    </Presence>
  );
}
