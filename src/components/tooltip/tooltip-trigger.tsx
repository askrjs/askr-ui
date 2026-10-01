import type { JSX } from '@askrjs/askr/jsx-runtime';
import { nativeButtonProps } from '../_internal/native-control';
import { Slot } from '@askrjs/askr/foundations/structures';
import { composeRefs, mergeProps } from '@askrjs/askr/foundations/utilities';
import { hoverable } from '@askrjs/askr/foundations/interactions';
import { readTooltipRootContext } from './tooltip.shared';
import { setSsrIdAssociation } from '../_internal/ssr-id-association';
import type {
  TooltipTriggerAsChildProps,
  TooltipTriggerProps,
} from './tooltip.types';

/**
 * Renders the `tooltip-trigger` part of `tooltip`.
 *
 * Supports polymorphic rendering via `asChild`.
 */
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
    root.setTriggerNode(
      node,
      (rest as Record<string, unknown>)['aria-describedby'] === undefined
    );
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
      if (disabled) return;
      root.openFromFocus();
    },
    onBlur: (event: FocusEvent) => {
      const trigger = event.currentTarget as HTMLElement;
      queueMicrotask(() => {
        const activeElement = document.activeElement;
        const currentTrigger = root.getTriggerNode();
        if (currentTrigger && currentTrigger.contains(activeElement)) {
          return;
        }
        // Removing a focused trigger can temporarily leave focus on the body
        // while its replacement is being mounted. A focusin elsewhere clears
        // the adoption latch if the user moved to another control.
        if (
          !trigger.isConnected &&
          (activeElement === document.body ||
            activeElement === document.documentElement)
        ) {
          return;
        }
        root.releaseFocusAdoption();
        root.setOpen(false);
      });
    },
    'aria-describedby': root.open ? root.contentId : undefined,
    'aria-disabled': disabled ? 'true' : undefined,
    'data-slot': 'tooltip-trigger',
    'data-disabled': disabled ? 'true' : undefined,
    'data-state': root.open ? 'open' : 'closed',
  });

  setSsrIdAssociation(
    finalProps,
    'aria-describedby',
    root.ssrContent,
    root.open &&
      (rest as Record<string, unknown>)['aria-describedby'] === undefined
  );

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return (
    <button
      type={typeProp ?? 'button'}
      disabled={disabled}
      {...nativeButtonProps(finalProps)}
    >
      {children}
    </button>
  );
}
