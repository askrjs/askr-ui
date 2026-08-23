import { Presence, Slot } from '@askrjs/askr/foundations/structures';
import { mergeProps } from '@askrjs/askr/foundations/utilities';
import { readDialogRootContext } from './dialog.shared';
import type {
  DialogOverlayAsChildProps,
  DialogOverlayProps,
} from './dialog.types';

/**
 * Renders the `dialog-overlay` part of `dialog`.
 *
 * With `@askrjs/themes/default`, the overlay is fully styled out of the box
 * with the shared backdrop token, blur, stacking, and fade animation. Standard
 * Dialog and AlertDialog usage requires no additional overlay CSS; customize
 * the theme tokens instead of applying a competing background class.
 *
 * Supports polymorphic rendering via `asChild`.
 */
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
