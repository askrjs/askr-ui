import { defineContext, readContext } from '@askrjs/askr';
import { Slot, Presence } from '@askrjs/askr/foundations/structures';
import { controllableState } from '@askrjs/askr/foundations/state';
import { composeRefs, mergeProps } from '@askrjs/askr/foundations/utilities';
import { pressable } from '@askrjs/askr/foundations/interactions';
import { resolveCompoundId } from '../_internal/id';
import type {
  CollapsibleContentAsChildProps,
  CollapsibleContentProps,
  CollapsibleProps,
  CollapsibleTriggerAsChildProps,
  CollapsibleTriggerProps,
} from './collapsible.types';

type CollapsibleRootContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  disabled: boolean;
  contentId: string;
};

const CollapsibleRootContext =
  defineContext<CollapsibleRootContextValue | null>(null);

let pendingFocusRestoreId: string | null = null;

function resolveCollapsibleContentId(props: CollapsibleProps): string {
  return resolveCompoundId('collapsible-content', props.id, [
    props.defaultOpen ? 'open' : 'closed',
    props.disabled ? 'disabled' : 'enabled',
    props.children,
  ]);
}

function readCollapsibleRootContext(): CollapsibleRootContextValue {
  const context = readContext(CollapsibleRootContext);

  if (!context) {
    throw new Error('Collapsible components must be used within <Collapsible>');
  }

  return context;
}

export function Collapsible(props: CollapsibleProps) {
  const {
    id,
    children,
    open,
    defaultOpen = false,
    onOpenChange,
    disabled = false,
  } = props;

  const openState = controllableState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const contentId = resolveCollapsibleContentId({
    id,
    children,
    open,
    defaultOpen,
    onOpenChange,
    disabled,
  });
  const rootContext: CollapsibleRootContextValue = {
    open: openState(),
    setOpen: openState.set,
    disabled,
    contentId,
  };

  return (
    <CollapsibleRootContext.Scope value={rootContext}>
      {children}
    </CollapsibleRootContext.Scope>
  );
}

export function CollapsibleTrigger(props: CollapsibleTriggerProps): JSX.Element;
export function CollapsibleTrigger(
  props: CollapsibleTriggerAsChildProps
): JSX.Element;
export function CollapsibleTrigger(
  props: CollapsibleTriggerProps | CollapsibleTriggerAsChildProps
) {
  const { asChild, children, ref, ...rest } = props;
  const root = readCollapsibleRootContext();
  const restoreFocusRef = (node: HTMLElement | null) => {
    if (node && pendingFocusRestoreId === root.contentId) {
      pendingFocusRestoreId = null;
      node.focus();
    }
  };
  const toggleOpen = (event?: Event) => {
    if (
      event &&
      'currentTarget' in event &&
      event.currentTarget === document.activeElement
    ) {
      pendingFocusRestoreId = root.contentId;
    }
    root.setOpen(!root.open);
    if (event && 'currentTarget' in event) {
      (event.currentTarget as HTMLElement | null)?.focus?.();
    }
  };
  const interactionProps = pressable({
    disabled: root.disabled,
    onPress: (event) => toggleOpen(event as Event),
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
      restoreFocusRef
    ),
    'data-slot': 'collapsible-trigger',
    'aria-expanded': root.open ? 'true' : 'false',
    'aria-controls': root.contentId,
    'data-state': root.open ? 'open' : 'closed',
    'data-disabled': root.disabled ? 'true' : undefined,
    onKeyDown: !asChild
      ? (event: KeyboardEvent) => {
          if (event.key === ' ') {
            event.preventDefault();
          }
          if (event.key === 'Enter') {
            toggleOpen(event);
          }
        }
      : undefined,
    onKeyUp: !asChild
      ? (event: KeyboardEvent) => {
          if (event.key === ' ') {
            toggleOpen(event);
          }
        }
      : undefined,
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return (
    <button type="button" {...finalProps}>
      {children}
    </button>
  );
}

export function CollapsibleContent(
  props: CollapsibleContentProps
): JSX.Element | null;
export function CollapsibleContent(
  props: CollapsibleContentAsChildProps
): JSX.Element | null;
export function CollapsibleContent(
  props: CollapsibleContentProps | CollapsibleContentAsChildProps
) {
  const { asChild, children, forceMount = false, ref, ...rest } = props;
  const root = readCollapsibleRootContext();
  const finalProps = mergeProps(rest, {
    ref,
    id: root.contentId,
    'data-slot': 'collapsible-content',
    'data-state': root.open ? 'open' : 'closed',
  });

  return (
    <Presence present={forceMount || root.open}>
      {asChild ? (
        <Slot asChild {...finalProps} children={children} />
      ) : (
        <div {...finalProps}>{children}</div>
      )}
    </Presence>
  );
}
