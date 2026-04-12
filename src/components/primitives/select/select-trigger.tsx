import { Slot, composeRefs, mergeProps, pressable } from '@askrjs/askr/foundations';
import { getOverlayNodes } from '../../_internal/overlay';
import {
  readSelectDeclarationContext,
  readSelectRootContext,
  resolveSelectState,
} from './select.shared';
import type {
  SelectPortalProps,
  SelectTriggerAsChildProps,
  SelectTriggerProps,
  SelectValueAsChildProps,
  SelectValueProps,
} from './select.types';

export function SelectTrigger(props: SelectTriggerProps): JSX.Element | null;
export function SelectTrigger(
  props: SelectTriggerAsChildProps
): JSX.Element | null;
export function SelectTrigger(
  props: SelectTriggerProps | SelectTriggerAsChildProps
) {
  if (readSelectDeclarationContext()) {
    return null;
  }

  const { asChild, children, disabled = false, onPress, ref, type, ...rest } =
    props;
  const root = readSelectRootContext();
  const overlayNodes = getOverlayNodes(root.selectId);
  const isDisabled = root.disabled || disabled;
  const interactionProps = pressable({
    disabled: isDisabled,
    onPress: (event) => {
      onPress?.(event);
      if (!event.defaultPrevented) {
        root.setOpen(!root.open);
      }
    },
    isNativeButton: !asChild,
  });
  const finalProps = mergeProps(rest, {
    ...interactionProps,
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
    'data-slot': 'select-trigger',
    'data-disabled': isDisabled ? 'true' : undefined,
    'data-state': root.open ? 'open' : 'closed',
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return (
    <button type={type ?? 'button'} {...finalProps}>
      {children}
    </button>
  );
}

export function SelectValue(props: SelectValueProps): JSX.Element | null;
export function SelectValue(props: SelectValueAsChildProps): JSX.Element | null;
export function SelectValue(
  props: SelectValueProps | SelectValueAsChildProps
) {
  if (readSelectDeclarationContext()) {
    return null;
  }

  const { asChild, children, placeholder, ref, ...rest } = props;
  const root = readSelectRootContext();
  const { selectedText } = resolveSelectState(root);
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

export function SelectPortal(props: SelectPortalProps): JSX.Element | null {
  if (readSelectDeclarationContext()) {
    return <>{props.children}</>;
  }

  const root = readSelectRootContext();

  return root.portal.render({
    children: props.children,
  }) as JSX.Element | null;
}