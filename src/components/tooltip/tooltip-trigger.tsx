import { Slot } from '@askrjs/askr/foundations/structures';
import { composeRefs, mergeProps } from '@askrjs/askr/foundations/utilities';
import { hoverable } from '@askrjs/askr/foundations/interactions';
import { readTooltipRootContext } from './tooltip.shared';
import type {
  TooltipTriggerAsChildProps,
  TooltipTriggerProps,
} from './tooltip.types';

export function TooltipTrigger(props: TooltipTriggerProps): JSX.Element;
export function TooltipTrigger(props: TooltipTriggerAsChildProps): JSX.Element;
export function TooltipTrigger(
  props: TooltipTriggerProps | TooltipTriggerAsChildProps
) {
  const {
    asChild,
    children,
    disabled = false,
    ref,
    type: typeProp,
    ...rest
  } = props;
  const root = readTooltipRootContext();
  const hoverProps = hoverable({
    disabled,
    onEnter: () => {
      root.setOpen(true);
    },
    onLeave: () => {
      root.setOpen(false);
    },
  });
  const setNode = (node: HTMLElement | null) => {
    root.setTriggerNode(node);
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
  const finalProps = mergeProps(rest, {
    ...hoverProps,
    ref: refHandler,
    onFocus: () => {
      root.setOpen(true);
    },
    onBlur: () => {
      root.setOpen(false);
    },
    'aria-describedby': root.open ? root.contentId : undefined,
    'data-slot': 'tooltip-trigger',
    'data-disabled': disabled ? 'true' : undefined,
    'data-state': root.open ? 'open' : 'closed',
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return (
    <button type={typeProp ?? 'button'} disabled={disabled} {...finalProps}>
      {children}
    </button>
  );
}
