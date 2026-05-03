import {
  Presence,
  Slot,
  composeRefs,
  mergeProps,
} from '@askrjs/askr/foundations';
import { DismissableLayer } from '../../composites/dismissable-layer';
import { FocusScope } from '../../composites/focus-scope';
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
  });
  const contentNode = asChild ? (
    <Slot asChild {...finalProps} children={children} />
  ) : (
    <div {...finalProps}>{children}</div>
  );

  root.registerContentPosition(position);

  return (
    <Presence present={forceMount || root.open}>
      <FocusScope restoreFocus>
        <DismissableLayer onDismiss={() => root.setOpen(false)}>
          {contentNode}
        </DismissableLayer>
      </FocusScope>
    </Presence>
  );
}
