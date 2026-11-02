import type { JSX } from '@askrjs/askr/jsx-runtime';
import {
  nativeButtonProps,
  withDefaultNativeButtonType,
} from '../_internal/native-control';
import { Slot } from '@askrjs/askr/foundations/structures';
import { composeRefs, type Ref } from '@askrjs/askr/foundations/utilities';
import { mergeComponentProps } from '../_internal/component-props';
import { hoverable, pressable } from '@askrjs/askr/foundations/interactions';
import { getTabbableElements } from '../_internal/focus';
import {
  omitHoverCardStateAriaProps,
  readHoverCardChildRef,
  readHoverCardRootContext,
} from './hover-card.shared';
import {
  registerSsrPartId,
  setSsrIdAssociation,
} from '../_internal/ssr-id-association';
import type {
  HoverCardTriggerAsChildProps,
  HoverCardTriggerProps,
} from './hover-card.types';

/**
 * Renders the `hover-card-trigger` part of `hover-card`.
 *
 * Supports polymorphic rendering via `asChild`.
 */
export function HoverCardTrigger(props: HoverCardTriggerProps): JSX.Element;
export function HoverCardTrigger(
  props: HoverCardTriggerAsChildProps
): JSX.Element;
export function HoverCardTrigger(
  props: HoverCardTriggerProps | HoverCardTriggerAsChildProps
) {
  const {
    asChild,
    children,
    disabled = false,
    onPress,
    ref,
    type: typeProp,
    ...rest
  } = props;
  const root = readHoverCardRootContext();
  const childRef = asChild ? readHoverCardChildRef(children) : undefined;
  const callerProps = omitHoverCardStateAriaProps(rest, [
    'aria-expanded',
    'aria-haspopup',
    'aria-disabled',
  ]);
  const hoverProps = hoverable({
    disabled,
    onEnter: () => {
      root.scheduleOpen();
    },
    onLeave: () => {
      root.scheduleClose();
    },
  });
  const interactionProps = pressable({
    disabled,
    onPress,
    isNativeButton: !asChild,
  });
  const finalProps = mergeComponentProps(callerProps, {
    ...interactionProps,
    ...hoverProps,
    ref: composeRefs(
      ref as Ref<HTMLElement> | undefined,
      childRef as Ref<HTMLElement> | undefined,
      (node: HTMLElement | null) => {
        root.setTriggerNode(
          node,
          (rest as Record<string, unknown>)['aria-controls'] === undefined
        );
      }
    ),
    id: root.triggerId,
    'aria-haspopup': 'dialog',
    'aria-expanded': root.open ? 'true' : 'false',
    'aria-controls': root.contentId,
    'data-slot': 'hover-card-trigger',
    'data-disabled': disabled ? 'true' : undefined,
    'data-state': root.open ? 'open' : 'closed',
    onFocus: () => {
      if (disabled) return;
      root.cancelClose();
      root.setOpen(true);
    },
    onFocusIn: () => {
      if (disabled) return;
      root.cancelClose();
      root.setOpen(true);
    },
    onBlur: () => {
      root.scheduleClose();
    },
    onKeyDown: (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        event.key !== 'Tab' ||
        event.shiftKey ||
        !root.open
      ) {
        return;
      }
      const content = root.getContentNode();
      const firstTabbable = content
        ? getTabbableElements(content)[0]
        : undefined;
      if (firstTabbable) {
        event.preventDefault();
        root.cancelClose();
        firstTabbable.focus();
      }
    },
  });

  registerSsrPartId(finalProps, root.ssrTrigger);
  setSsrIdAssociation(
    finalProps,
    'aria-controls',
    root.ssrContent,
    (rest as Record<string, unknown>)['aria-controls'] === undefined
  );

  if (asChild) {
    return (
      <Slot
        asChild
        {...withDefaultNativeButtonType(children, finalProps, typeProp)}
        children={children}
      />
    );
  }

  return (
    <button type={typeProp ?? 'button'} {...nativeButtonProps(finalProps)}>
      {children}
    </button>
  );
}
