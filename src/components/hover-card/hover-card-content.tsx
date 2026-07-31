import { Presence, Slot } from '@askrjs/askr/foundations/structures';
import { composeRefs, mergeProps } from '@askrjs/askr/foundations/utilities';
import { DismissableLayer } from '../dismissable-layer';
import { dismissPopupWithTab, getFocusableElements } from '../_internal/focus';
import {
  readHoverCardRootContext,
  resolveHoverCardPositionOptions,
} from './hover-card.shared';
import type {
  HoverCardContentAsChildProps,
  HoverCardContentProps,
} from './hover-card.types';

export function HoverCardContent(
  props: HoverCardContentProps
): JSX.Element | null;
export function HoverCardContent(
  props: HoverCardContentAsChildProps
): JSX.Element | null;
export function HoverCardContent(
  props: HoverCardContentProps | HoverCardContentAsChildProps
) {
  const {
    asChild,
    children,
    forceMount = false,
    ref,
    side = 'bottom',
    align = 'center',
    sideOffset = 6,
    ...rest
  } = props;
  const root = readHoverCardRootContext();
  const position = resolveHoverCardPositionOptions({
    side,
    align,
    sideOffset,
  });
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
    // A HoverCard is an interactive dialog tied to its trigger.  Exposing the
    // trigger as the accessible name keeps the relationship intact for both
    // the inline and portal-rendered content paths.
    'aria-labelledby': root.triggerId,
    tabIndex: -1,
    'data-slot': 'hover-card-content',
    'data-state': root.open ? 'open' : 'closed',
    'data-side': position.side,
    'data-align': position.align,
    'data-side-offset': String(position.sideOffset),
    onPointerEnter: () => {
      root.cancelClose();
    },
    onPointerLeave: () => {
      root.scheduleClose();
    },
    onMouseEnter: () => {
      root.cancelClose();
    },
    onMouseLeave: () => {
      root.scheduleClose();
    },
    onMouseOver: () => {
      root.cancelClose();
    },
    onMouseOut: () => {
      root.scheduleClose();
    },
    onFocusIn: () => {
      root.cancelClose();
    },
    onFocusOut: (event: FocusEvent) => {
      const content = root.getContentNode();
      const next =
        event.relatedTarget instanceof Node ? event.relatedTarget : null;
      if (!content || !next || !content.contains(next)) {
        root.scheduleClose();
      }
    },
    onKeyDown: (event: KeyboardEvent) => {
      const content = root.getContentNode();
      const trigger = root.getTriggerNode();
      if (!content) {
        return;
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        root.requestTriggerFocus();
        root.setOpen(false);
        queueMicrotask(() => {
          queueMicrotask(() => {
            (
              document.getElementById(root.triggerId) ?? root.getTriggerNode()
            )?.focus();
          });
        });
        return;
      }
      if (event.key !== 'Tab') {
        return;
      }
      const focusable = getFocusableElements(content);
      const active =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      if (event.shiftKey && active === focusable[0] && trigger) {
        event.preventDefault();
        root.requestTriggerFocus();
        root.setOpen(false);
        queueMicrotask(() => {
          queueMicrotask(() => {
            (
              document.getElementById(root.triggerId) ?? root.getTriggerNode()
            )?.focus();
          });
        });
        return;
      }
      if (!event.shiftKey && active === focusable[focusable.length - 1]) {
        dismissPopupWithTab(event, trigger, [content], () =>
          root.setOpen(false)
        );
      }
    },
  });
  const contentNode = asChild ? (
    <Slot asChild {...finalProps} children={children} />
  ) : (
    <div {...finalProps}>{children}</div>
  );

  root.registerContentPosition(position);

  return (
    <Presence present={forceMount || root.open}>
      <DismissableLayer
        onEscapeKeyDown={() => root.requestTriggerFocus()}
        onDismiss={() => root.setOpen(false)}
      >
        {contentNode}
      </DismissableLayer>
    </Presence>
  );
}
