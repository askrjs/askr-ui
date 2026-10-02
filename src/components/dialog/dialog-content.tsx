import type { JSX } from '@askrjs/askr/jsx-runtime';
import { Presence, Slot } from '@askrjs/askr/foundations/structures';
import { composeRefs, mergeProps } from '@askrjs/askr/foundations/utilities';
import { DismissableLayer } from '../dismissable-layer';
import { FocusScope } from '../focus-scope';
import { syncPersistentOverlayFocus } from '../_internal/overlay-focus';
import {
  registerSsrPartId,
  setSsrIdAssociation,
} from '../_internal/ssr-id-association';
import { readDialogRootContext } from './dialog.shared';
import type {
  DialogContentAsChildProps,
  DialogContentProps,
} from './dialog.types';

const SSR_CHILDREN_BEFORE_ATTRS = Symbol.for('askr.ssr.children-before-attrs');

/**
 * Renders the `dialog-content` part of `dialog`.
 *
 * Supports polymorphic rendering via `asChild`.
 */
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
    role = 'dialog',
    ref,
    onEscapeKeyDown,
    onPointerDownOutside,
    onInteractOutside,
    onDismiss,
    restoreFocus,
    ...rest
  } = props;
  const {
    'aria-labelledby': labelledBy,
    'aria-describedby': describedBy,
    ...contentProps
  } = rest as JSX.IntrinsicElements['div'];
  const root = readDialogRootContext();
  syncPersistentOverlayFocus(
    root.open,
    forceMount,
    root.getContentNode,
    () =>
      (typeof restoreFocus === 'function' ? restoreFocus() : restoreFocus) ??
      root.getTriggerNode()
  );
  const setNode = (node: HTMLElement | null) => {
    root.setContentNode(node, {
      title: labelledBy === undefined,
      description: describedBy === undefined,
    });

    if (node && root.open) {
      root.syncPosition();
    } else {
      root.clearPosition();
    }
  };
  const refHandler = ref
    ? composeRefs(
        ref as
          | ((value: HTMLElement | null) => void)
          | { current: HTMLElement | null }
          | null
          | undefined,
        setNode
      )
    : setNode;
  const finalProps = mergeProps(contentProps, {
    ref: refHandler,
    id: root.contentId,
    role,
    'aria-modal': root.modal ? 'true' : undefined,
    'aria-labelledby': labelledBy === undefined ? root.getTitleId : labelledBy,
    'aria-describedby':
      describedBy === undefined ? root.getDescriptionId : describedBy,
    'data-slot': 'dialog-content',
    'data-state': root.open ? 'open' : 'closed',
  });
  (finalProps as Record<PropertyKey, unknown>)[SSR_CHILDREN_BEFORE_ATTRS] =
    true;
  registerSsrPartId(finalProps, root.ssrContent);
  setSsrIdAssociation(
    finalProps,
    'aria-labelledby',
    root.ssrTitle,
    labelledBy === undefined
  );
  setSsrIdAssociation(
    finalProps,
    'aria-describedby',
    root.ssrDescription,
    describedBy === undefined
  );
  const contentNode = asChild ? (
    <Slot asChild {...finalProps} children={children} />
  ) : (
    <div {...finalProps}>{children}</div>
  );

  return (
    <Presence present={forceMount || root.open}>
      <FocusScope
        trapped={root.modal && root.open}
        loop={root.open}
        autoFocus={root.open}
        restoreFocus
        restoreFocusTarget={restoreFocus}
      >
        <DismissableLayer
          disabled={!root.open}
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
