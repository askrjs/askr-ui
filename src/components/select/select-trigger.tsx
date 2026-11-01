import type { JSX } from '@askrjs/askr/jsx-runtime';
import { nativeRef } from '../_internal/native-ref';
import {
  nativeButtonProps,
  withDefaultNativeButtonType,
} from '../_internal/native-control';
import { cloneElement, Slot } from '@askrjs/askr/foundations/structures';
import {
  composeRefs,
  mergeProps,
  type Ref,
} from '@askrjs/askr/foundations/utilities';
import { mergeComponentProps } from '../_internal/component-props';
import { setSsrIdAssociation } from '../_internal/ssr-id-association';
import { isJsxElement } from '../_internal/jsx';
import { pressable } from '@askrjs/askr/foundations/interactions';
import { registerOverlayNode } from '../_internal/overlay';
import { runCancelablePress } from '../_internal/press';
import {
  readSelectChildRef,
  readSelectRootContext,
  resolveSelectDisabled,
  resolveSelectSlotRef,
} from './select.shared';
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
  const { asChild, children, disabled, onPress, ref, size, type, ...rest } =
    props;
  const root = readSelectRootContext();
  const overlayNodeOwner = {};
  const isDisabled =
    root.disabled ||
    resolveSelectDisabled(children, disabled, asChild === true);
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
  const finalProps = mergeComponentProps(rest, {
    ...interactionProps,
    onKeyDown: handleKeyDown,
    onKeyUp: handleKeyUp,
    ref: composeRefs(
      resolveSelectSlotRef(
        asChild,
        children,
        ref as Ref<Element> | undefined
      ) as Ref<HTMLElement> | undefined,
      (node: HTMLElement | null) => {
        if (node)
          root.idAssociation.automatic.controls =
            (rest as Record<string, unknown>)['aria-controls'] === undefined;
        registerOverlayNode(
          root.overlayIdentity,
          'trigger',
          node,
          overlayNodeOwner
        );
        root.idAssociation.sync();
        root.bindFormReset(node);
      }
    ),
    'aria-haspopup': 'listbox',
    'aria-expanded': root.open ? 'true' : 'false',
    'aria-controls': root.contentId,
    ...(asChild && disabled === undefined && !root.disabled
      ? {}
      : { disabled: isDisabled ? true : undefined }),
    'data-slot': 'select-trigger',
    'data-disabled': isDisabled ? 'true' : undefined,
    'data-size': size && size !== 'md' ? size : undefined,
    'data-state': root.open ? 'open' : 'closed',
  });

  setSsrIdAssociation(
    finalProps,
    'aria-controls',
    root.idAssociation.ssrContentId,
    (rest as Record<string, unknown>)['aria-controls'] === undefined
  );

  if (asChild) {
    return (
      <Slot
        asChild
        {...withDefaultNativeButtonType(children, finalProps, type)}
        children={children}
      />
    );
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
  const childRef = asChild ? readSelectChildRef(children) : undefined;
  const valueRef =
    ref == null && childRef == null
      ? undefined
      : composeRefs(ref as Ref<Element> | undefined, childRef);
  const valueHost =
    asChild && isJsxElement(children) && children.props?.children === undefined
      ? cloneElement(children, {
          children: selectedText || placeholder || null,
        })
      : children;
  const finalProps = mergeProps(rest, {
    ...(asChild ? { ref: valueRef } : { ref }),
    'data-slot': 'select-value',
    'data-placeholder': !selectedText && placeholder ? 'true' : undefined,
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={valueHost as JSX.Element} />;
  }

  return (
    <span {...finalProps} ref={nativeRef<HTMLSpanElement>(props)}>
      {renderedChildren}
    </span>
  );
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
