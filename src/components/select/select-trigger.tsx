import { nativeButtonProps } from '../_internal/native-control';
import { Slot } from '@askrjs/askr/foundations/structures';
import { composeRefs, mergeProps } from '@askrjs/askr/foundations/utilities';
import { pressable } from '@askrjs/askr/foundations/interactions';
import { getOverlayNodes } from '../_internal/overlay';
import { runCancelablePress } from '../_internal/press';
import { readSelectRootContext } from './select.shared';
import type {
  SelectPortalProps,
  SelectTriggerAsChildProps,
  SelectTriggerProps,
  SelectValueAsChildProps,
  SelectValueProps,
} from './select.types';

/**
 * Renders the `select-trigger` part of `select`.
 *
 * Supports polymorphic rendering via `asChild`.
 */
export function SelectTrigger(props: SelectTriggerProps): JSX.Element | null;
export function SelectTrigger(
  props: SelectTriggerAsChildProps
): JSX.Element | null;
export function SelectTrigger(
  props: SelectTriggerProps | SelectTriggerAsChildProps
) {
  const {
    asChild,
    children,
    disabled = false,
    onPress,
    ref,
    size,
    type,
    ...rest
  } = props;
  const root = readSelectRootContext();
  const overlayNodes = getOverlayNodes(root.overlayIdentity);
  const isDisabled = root.disabled || disabled;
  const interactionProps = pressable({
    disabled: isDisabled,
    onPress: (event) => {
      runCancelablePress(event, onPress, () => {
        root.setOpen(!root.open);
      });
    },
    isNativeButton: false,
  });
  const handleKeyDown = (event: KeyboardEvent) => {
    if (!isDisabled && root.handleTypeaheadKeyDown(event)) {
      return;
    }

    interactionProps.onKeyDown?.(event);

    if (event.defaultPrevented || isDisabled) {
      return;
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      root.setOpen(true);
      return;
    }
  };
  const handleKeyUp = (event: KeyboardEvent) => {
    if (root.handleTypeaheadKeyUp(event)) {
      return;
    }

    interactionProps.onKeyUp?.(event);
  };
  const finalProps = mergeProps(rest, {
    ...interactionProps,
    onKeyDown: handleKeyDown,
    onKeyUp: handleKeyUp,
    ref: composeRefs(
      ref as
        | ((value: HTMLElement | null) => void)
        | { current: HTMLElement | null }
        | null
        | undefined,
      (node: HTMLElement | null) => {
        overlayNodes.trigger = node;
      }
    ),
    'aria-haspopup': 'listbox',
    'aria-expanded': root.open ? 'true' : 'false',
    'aria-controls': root.contentId,
    disabled: isDisabled && !asChild ? true : undefined,
    'data-slot': 'select-trigger',
    'data-disabled': isDisabled ? 'true' : undefined,
    'data-size': size && size !== 'md' ? size : undefined,
    'data-state': root.open ? 'open' : 'closed',
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return (
    <button type={type ?? 'button'} {...nativeButtonProps(finalProps)}>
      {children}
    </button>
  );
}

/**
 * Renders the `select-value` part of `select`.
 *
 * Supports polymorphic rendering via `asChild`.
 */
export function SelectValue(props: SelectValueProps): JSX.Element | null;
export function SelectValue(props: SelectValueAsChildProps): JSX.Element | null;
export function SelectValue(props: SelectValueProps | SelectValueAsChildProps) {
  const { asChild, children, placeholder, ref, ...rest } = props;
  const root = readSelectRootContext();
  const { selectedText } = root.resolvedState;
  const renderedChildren = children ?? (selectedText || placeholder || null);
  const finalProps = mergeProps(rest, {
    ref,
    'data-slot': 'select-value',
    'data-placeholder': !selectedText && placeholder ? 'true' : undefined,
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children as JSX.Element} />;
  }

  return <span {...finalProps}>{renderedChildren}</span>;
}

/**
 * Renders a part of `select`.
 */
export function SelectPortal(props: SelectPortalProps): JSX.Element | null {
  const root = readSelectRootContext();

  return root.portal.render({
    children: props.children,
  }) as JSX.Element | null;
}
