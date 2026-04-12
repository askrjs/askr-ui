import {
  Presence,
  Slot,
  composeRefs,
  mergeProps,
} from '@askrjs/askr/foundations';
import { DismissableLayer } from '../../composites/dismissable-layer';
import { FocusScope } from '../../composites/focus-scope';
import {
  readPopoverRootContext,
  resolvePopoverPositionOptions,
} from './popover.shared';
import type {
  PopoverContentAsChildProps,
  PopoverContentProps,
} from './popover.types';

export function PopoverContent(props: PopoverContentProps): JSX.Element | null;
export function PopoverContent(
  props: PopoverContentAsChildProps
): JSX.Element | null;
export function PopoverContent(
  props: PopoverContentProps | PopoverContentAsChildProps
) {
  const {
    asChild,
    children,
    forceMount = false,
    ref,
    side = 'bottom',
    align = 'center',
    sideOffset = 0,
    ...rest
  } = props;
  const root = readPopoverRootContext();
  const position = resolvePopoverPositionOptions({
    side,
    align,
    sideOffset,
  });
  const restDomProps = rest as Record<string, unknown>;
  const explicitAriaLabel =
    typeof restDomProps['aria-label'] === 'string'
      ? (restDomProps['aria-label'] as string)
      : undefined;
  const explicitAriaLabelledBy =
    typeof restDomProps['aria-labelledby'] === 'string'
      ? (restDomProps['aria-labelledby'] as string)
      : undefined;
  const autoAriaLabelledBy = explicitAriaLabel
    ? undefined
    : (explicitAriaLabelledBy ?? root.triggerId);

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
    role: 'dialog',
    'aria-labelledby': autoAriaLabelledBy,
    tabIndex: -1,
    'data-slot': 'popover-content',
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
      <FocusScope restoreFocus>
        <DismissableLayer
          onDismiss={() => {
            root.setOpen(false);
          }}
        >
          {contentNode}
        </DismissableLayer>
      </FocusScope>
    </Presence>
  );
}