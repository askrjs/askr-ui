import {
  Presence,
  Slot,
  composeRefs,
  mergeProps,
} from '@askrjs/askr/foundations';
import { DismissableLayer } from '../../composites/dismissable-layer';
import { FocusScope } from '../../composites/focus-scope';
import { readDialogRootContext } from './dialog.shared';
import type {
  DialogContentAsChildProps,
  DialogContentProps,
} from './dialog.types';

export function DialogContent(props: DialogContentProps): JSX.Element | null;
export function DialogContent(
  props: DialogContentAsChildProps
): JSX.Element | null;
export function DialogContent(
  props: DialogContentProps | DialogContentAsChildProps
) {
  const {
    asChild,
    children,
    forceMount = false,
    ref,
    onEscapeKeyDown,
    onPointerDownOutside,
    onInteractOutside,
    onDismiss,
    ...rest
  } = props;
  const root = readDialogRootContext();
  const finalProps = mergeProps(rest, {
    ref: composeRefs(
      ref as
        | ((value: HTMLElement | null) => void)
        | { current: HTMLElement | null }
        | null
        | undefined,
      (node: HTMLElement | null) => {
        root.setContentNode(node);

        if (node && root.open) {
          root.syncPosition();
        } else {
          root.clearPosition();
        }
      }
    ),
    id: root.contentId,
    role: 'dialog',
    'aria-modal': root.modal ? 'true' : undefined,
    'aria-labelledby': root.hasTitle ? root.titleId : undefined,
    'aria-describedby': root.hasDescription ? root.descriptionId : undefined,
    'data-slot': 'dialog-content',
    'data-state': root.open ? 'open' : 'closed',
  });
  const contentNode = asChild ? (
    <Slot asChild {...finalProps} children={children} />
  ) : (
    <div {...finalProps}>{children}</div>
  );

  return (
    <Presence present={forceMount || root.open}>
      <FocusScope trapped={root.modal} loop restoreFocus>
        <DismissableLayer
          disableOutsidePointerEvents={root.modal}
          onEscapeKeyDown={onEscapeKeyDown}
          onPointerDownOutside={onPointerDownOutside}
          onInteractOutside={onInteractOutside}
          onDismiss={() => {
            if (onDismiss) {
              onDismiss();
              return;
            }

            root.setOpen(false);
          }}
        >
          {contentNode}
        </DismissableLayer>
      </FocusScope>
    </Presence>
  );
}