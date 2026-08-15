import { Slot } from '@askrjs/askr/foundations/structures';
import { state } from '@askrjs/askr';
import { composeRefs, mergeProps } from '@askrjs/askr/foundations/utilities';
import {
  focusFirstDescendant,
  getFocusableElements,
  markKeyboardModality,
} from '../_internal/focus';
import { resolveCompoundId } from '../_internal/id';
import type {
  FocusScopeAsChildProps,
  FocusScopeProps,
} from './focus-scope.types';

type ScopeEntry = {
  node: HTMLElement | null;
  previousFocused: HTMLElement | null;
  pendingDetachedNode: HTMLElement | null;
};

/**
 * Renders a part of `focus-scope`.
 *
 * Supports polymorphic rendering via `asChild`.
 */
export function FocusScope(props: FocusScopeProps): JSX.Element;
export function FocusScope(props: FocusScopeAsChildProps): JSX.Element;
export function FocusScope(props: FocusScopeProps | FocusScopeAsChildProps) {
  const {
    asChild,
    children,
    trapped = false,
    loop = false,
    restoreFocus = true,
    id,
    ref,
    tabIndex,
    ...rest
  } = props;

  const scopeId = resolveCompoundId('focus-scope', id, children);
  const scopeEntry = state<ScopeEntry>({
    node: null,
    previousFocused: null,
    pendingDetachedNode: null,
  })();

  const setNode = (node: HTMLElement | null) => {
    if (node) {
      const pendingDetachedNode = scopeEntry.pendingDetachedNode;
      scopeEntry.pendingDetachedNode = null;
      scopeEntry.node = node;

      if (pendingDetachedNode) {
        if (
          pendingDetachedNode !== node &&
          !(
            document.activeElement instanceof HTMLElement &&
            node.contains(document.activeElement)
          )
        ) {
          if (!focusFirstDescendant(node)) {
            node.focus();
          }
        }
        return;
      }

      scopeEntry.previousFocused =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;

      if (
        !(
          document.activeElement instanceof HTMLElement &&
          node.contains(document.activeElement)
        )
      ) {
        if (!focusFirstDescendant(node)) {
          node.focus();
        }
      }
      return;
    }

    const detachedNode = scopeEntry.node;
    scopeEntry.node = null;
    scopeEntry.pendingDetachedNode = detachedNode;
    queueMicrotask(() => {
      if (scopeEntry.pendingDetachedNode !== detachedNode) {
        return;
      }

      scopeEntry.pendingDetachedNode = null;
      if (restoreFocus) {
        scopeEntry.previousFocused?.focus?.();
      }
    });
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Tab') {
      return;
    }

    markKeyboardModality();

    const node = scopeEntry.node;

    if (!node) {
      return;
    }

    const focusableElements = getFocusableElements(node);

    if (focusableElements.length === 0) {
      if (trapped) {
        event.preventDefault();
        node.focus();
      }
      return;
    }

    const first = focusableElements[0];
    const last = focusableElements[focusableElements.length - 1];
    const active =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    if (event.shiftKey) {
      if (active === first || (trapped && active && !node.contains(active))) {
        event.preventDefault();
        if (loop || trapped) {
          (loop ? last : first).focus();
        }
      }
      return;
    }

    if (active === last || (trapped && active && !node.contains(active))) {
      event.preventDefault();
      if (loop || trapped) {
        (loop ? first : last).focus();
      }
    }
  };

  const handleFocusOut = (event: FocusEvent) => {
    if (!trapped) {
      return;
    }

    const node = scopeEntry.node;

    if (!node) {
      return;
    }

    const relatedTarget =
      event.relatedTarget instanceof HTMLElement ? event.relatedTarget : null;

    if (relatedTarget && node.contains(relatedTarget)) {
      return;
    }

    if (!focusFirstDescendant(node)) {
      node.focus();
    }
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
    id: scopeId,
    ref: refHandler,
    tabIndex: asChild ? tabIndex : (tabIndex ?? -1),
    'data-focus-scope': 'true',
    onKeyDown: handleKeyDown,
    onFocusOut: handleFocusOut,
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children as JSX.Element} />;
  }

  return <div {...finalProps}>{children}</div>;
}
