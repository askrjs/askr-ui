import type { JSX } from '@askrjs/askr/jsx-runtime';
import { registerSsrPartId } from '../_internal/ssr-id-association';
import { Presence, Slot } from '@askrjs/askr/foundations/structures';
import { composeRefs, mergeProps } from '@askrjs/askr/foundations/utilities';
import type { Ref } from '@askrjs/askr/foundations/utilities';
import { DismissableLayer } from '../dismissable-layer';
import {
  readTooltipChildRef,
  readTooltipRootContext,
  resolveTooltipPositionOptions,
} from './tooltip.shared';
import type {
  TooltipContentAsChildProps,
  TooltipContentProps,
} from './tooltip.types';

/**
 * Renders the `tooltip-content` part of `tooltip` with `role="tooltip"`.
 *
 * Supports polymorphic rendering via `asChild`.
 */
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
  const setNode = (node: HTMLElement | null) => {
    root.setContentNode(node);

    if (node && root.open) {
      root.syncPosition();
    } else {
      root.clearPosition();
    }
  };
  const childRef = asChild ? readTooltipChildRef(children) : undefined;
  const refHandler =
    ref || childRef
      ? composeRefs(ref as Ref<HTMLElement> | undefined, childRef, setNode)
      : setNode;

  const finalProps = mergeProps(rest, {
    ref: refHandler,
    id: root.contentId,
    role: 'tooltip',
    'data-slot': 'tooltip-content',
    'data-state': root.open ? 'open' : 'closed',
    'data-side': position.side,
    'data-align': position.align,
    'data-side-offset': String(position.sideOffset),
  });
  registerSsrPartId(finalProps, root.ssrContent);
  const contentNode = asChild ? (
    <Slot asChild {...finalProps} children={children} />
  ) : (
    <div {...finalProps}>{children}</div>
  );

  return (
    <Presence present={forceMount || root.open}>
      <DismissableLayer
        disabled={!root.open}
        onEscapeKeyDown={() => {
          root.setOpen(false);
        }}
      >
        {contentNode}
      </DismissableLayer>
    </Presence>
  );
}
