import {
  Presence,
  Slot,
  composeRefs,
  mergeProps,
} from '@askrjs/ui/foundations';
import { DismissableLayer } from '../../composites/dismissable-layer';
import {
  readTooltipRootContext,
  resolveTooltipPositionOptions,
} from './tooltip.shared';
import type {
  TooltipContentAsChildProps,
  TooltipContentProps,
} from './tooltip.types';

export function TooltipContent(props: TooltipContentProps): JSX.Element | null;
export function TooltipContent(
  props: TooltipContentAsChildProps
): JSX.Element | null;
export function TooltipContent(
  props: TooltipContentProps | TooltipContentAsChildProps
) {
  const {
    asChild,
    children,
    forceMount = false,
    ref,
    side = 'top',
    align = 'center',
    sideOffset = 0,
    ...rest
  } = props;
  const root = readTooltipRootContext();
  const position = resolveTooltipPositionOptions({
    side,
    align,
    sideOffset,
  });

  root.registerContentPosition(position);

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
    role: 'tooltip',
    'data-slot': 'tooltip-content',
    'data-state': root.open ? 'open' : 'closed',
    'data-side': position.side,
    'data-align': position.align,
    'data-side-offset': String(position.sideOffset),
  });
  const contentNode = asChild ? (
    <Slot asChild {...finalProps} children={children} />
  ) : (
    <div {...finalProps}>{children}</div>
  );

  return (
    <Presence present={forceMount || root.open}>
      <DismissableLayer
        onEscapeKeyDown={() => {
          root.setOpen(false);
        }}
      >
        {contentNode}
      </DismissableLayer>
    </Presence>
  );
}
