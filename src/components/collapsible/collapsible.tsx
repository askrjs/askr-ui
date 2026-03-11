import {
  Slot,
  Presence,
  composeRefs,
  mergeProps,
  pressable,
} from '@askrjs/askr/foundations';
import { state } from '@askrjs/askr';
import type { JSXElement } from '@askrjs/askr/foundations';
import type {
  CollapsibleContentAsChildProps,
  CollapsibleContentProps,
  CollapsibleProps,
  CollapsibleTriggerAsChildProps,
  CollapsibleTriggerProps,
} from './collapsible.types';

type InjectedCollapsibleProps = {
  __open?: boolean;
  __setOpen?: (open: boolean) => void;
  __disabled?: boolean;
  __contentId?: string;
};

let collapsibleIdCounter = 0;
let pendingFocusRestoreId: string | null = null;

function nextCollapsibleId() {
  collapsibleIdCounter += 1;
  return `collapsible-content-${collapsibleIdCounter}`;
}

function isJsxElement(value: unknown): value is JSXElement {
  return (
    typeof value === 'object' &&
    value !== null &&
    '$$typeof' in value &&
    'props' in value
  );
}

function toChildArray(children: unknown): unknown[] {
  if (Array.isArray(children)) {
    return children;
  }

  return children === undefined || children === null ? [] : [children];
}

function cloneCollapsibleChild(
  child: unknown,
  injected: InjectedCollapsibleProps
): unknown {
  if (
    !isJsxElement(child) ||
    (child.type !== CollapsibleTrigger && child.type !== CollapsibleContent)
  ) {
    return child;
  }

  return {
    ...child,
    props: {
      ...child.props,
      ...injected,
    },
  };
}

function readInjectedState(
  props: InjectedCollapsibleProps
): Required<InjectedCollapsibleProps> {
  if (!props.__setOpen || props.__open === undefined || !props.__contentId) {
    throw new Error('Collapsible components must be used within <Collapsible>');
  }

  return {
    __open: props.__open,
    __setOpen: props.__setOpen,
    __disabled: props.__disabled ?? false,
    __contentId: props.__contentId,
  };
}

export function Collapsible(props: CollapsibleProps) {
  const {
    children,
    open,
    defaultOpen = false,
    onOpenChange,
    disabled = false,
  } = props;

  const internalOpen = state(defaultOpen);
  const stableContentId = state(nextCollapsibleId());
  const isControlled = open !== undefined;
  const currentOpen = () => (isControlled ? open : internalOpen());
  const setOpen = (next: boolean) => {
    if (!isControlled) {
      internalOpen.set(next);
    }
    onOpenChange?.(next);
  };
  const contentId = stableContentId();
  const enhancedChildren = toChildArray(children).map((child) =>
    cloneCollapsibleChild(child, {
      __open: currentOpen(),
      __setOpen: setOpen,
      __disabled: disabled,
      __contentId: contentId,
    })
  );

  return <>{enhancedChildren}</>;
}

export function CollapsibleTrigger(props: CollapsibleTriggerProps): JSX.Element;
export function CollapsibleTrigger(
  props: CollapsibleTriggerAsChildProps
): JSX.Element;
export function CollapsibleTrigger(
  props:
    | (CollapsibleTriggerProps & InjectedCollapsibleProps)
    | (CollapsibleTriggerAsChildProps & InjectedCollapsibleProps)
) {
  const {
    asChild,
    children,
    ref,
    __open,
    __setOpen,
    __disabled,
    __contentId,
    ...rest
  } = props;
  const injected = readInjectedState({
    __open,
    __setOpen,
    __disabled,
    __contentId,
  });
  const restoreFocusRef = (node: HTMLElement | null) => {
    if (node && pendingFocusRestoreId === injected.__contentId) {
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
      pendingFocusRestoreId = injected.__contentId;
    }
    injected.__setOpen(!injected.__open);
    if (event && 'currentTarget' in event) {
      (event.currentTarget as HTMLElement | null)?.focus?.();
    }
  };
  const interactionProps = pressable({
    disabled: injected.__disabled,
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
    'aria-expanded': injected.__open ? 'true' : 'false',
    'aria-controls': injected.__contentId,
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
  props:
    | (CollapsibleContentProps & InjectedCollapsibleProps)
    | (CollapsibleContentAsChildProps & InjectedCollapsibleProps)
) {
  const {
    asChild,
    children,
    forceMount = false,
    ref,
    __open,
    __setOpen,
    __disabled,
    __contentId,
    ...rest
  } = props;
  const injected = readInjectedState({
    __open,
    __setOpen,
    __disabled,
    __contentId,
  });
  const finalProps = mergeProps(rest, {
    ref,
    id: injected.__contentId,
    'data-state': injected.__open ? 'open' : 'closed',
  });

  return (
    <Presence present={forceMount || injected.__open}>
      {asChild ? (
        <Slot asChild {...finalProps} children={children} />
      ) : (
        <div {...finalProps}>{children}</div>
      )}
    </Presence>
  );
}
