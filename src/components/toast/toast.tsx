/**
 * Toast is the stacked notification family.
 *
 * Responsibilities:
 * - ToastProvider owns the notification registry and default timing.
 * - ToastViewport renders the current stack in declaration order.
 * - Toast declares a notification entry; it does not render DOM by itself.
 *
 * @example
 * ```tsx
 * <ToastProvider duration={5000}>
 *   <ToastViewport />
 *   <Toast defaultOpen>
 *     <ToastTitle>Saved</ToastTitle>
 *     <ToastDescription>Changes stored</ToastDescription>
 *     <ToastClose>Dismiss</ToastClose>
 *   </Toast>
 * </ToastProvider>
 * ```
 */
import { Presence, Slot } from '@askrjs/askr/foundations/structures';
import { composeRefs, mergeProps } from '@askrjs/askr/foundations/utilities';
import { controllableState } from '@askrjs/askr/foundations/state';
import { pressable } from '@askrjs/askr/foundations/interactions';
import { state } from '@askrjs/askr';
import { resource } from '@askrjs/askr/resources';
import { DismissableLayer } from '../dismissable-layer';
import { resolveCompoundId, resolvePartId } from '../_internal/id';
import { collectJsxElements } from '../_internal/jsx';
import type {
  ToastActionAsChildProps,
  ToastActionProps,
  ToastCloseAsChildProps,
  ToastCloseProps,
  ToastDescriptionAsChildProps,
  ToastDescriptionProps,
  ToastProps,
  ToastProviderProps,
  ToastTitleAsChildProps,
  ToastTitleProps,
  ToastViewportAsChildProps,
  ToastViewportProps,
} from './toast.types';
import {
  ToastProviderContext,
  ToastRootContext,
  readToastProviderContext,
  readToastRootContext,
  type ToastRegistration,
  type ToastProviderContextValue,
  type ToastRootContextValue,
} from './toast.shared';

type ToastLifecycleEntry = {
  node: HTMLElement | null;
  timer: ReturnType<typeof setTimeout> | null;
  previousFocused: HTMLElement | null;
};

const toastEntries = new Map<string, ToastLifecycleEntry>();
const toastProviderContexts = new Map<string, ToastProviderContextValue>();

function getToastEntry(toastId: string) {
  const existing = toastEntries.get(toastId);

  if (existing) {
    return existing;
  }

  const created: ToastLifecycleEntry = {
    node: null,
    timer: null,
    previousFocused: null,
  };
  toastEntries.set(toastId, created);
  return created;
}

function clearToastTimer(entry: ToastLifecycleEntry) {
  if (entry.timer) {
    clearTimeout(entry.timer);
    entry.timer = null;
  }
}

function restoreToastFocus(entry: ToastLifecycleEntry) {
  const previousFocused = entry.previousFocused;
  entry.previousFocused = null;

  if (
    previousFocused &&
    (!entry.node ||
      !(
        document.activeElement instanceof HTMLElement &&
        entry.node.contains(document.activeElement)
      ))
  ) {
    previousFocused.focus?.();
  }
}

function getToastProviderContext(
  providerId: string
): ToastProviderContextValue {
  const existing = toastProviderContexts.get(providerId);

  if (existing) {
    return existing;
  }

  const created: ToastProviderContextValue = {
    providerId,
    duration: 0,
    toasts: [],
    registerToast: () => {},
    unregisterToast: () => {},
  };
  toastProviderContexts.set(providerId, created);
  return created;
}

function ToastRegistrationView(props: {
  key?: string;
  registration: ToastRegistration;
  provider: ToastProviderContextValue;
}) {
  const toastProps = props.registration.props;
  const {
    children,
    open,
    defaultOpen = true,
    onOpenChange,
    duration,
    variant,
    ref,
    ...rest
  } = toastProps;
  const toastId = props.registration.toastId;
  const openState = controllableState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const hasTitleState = state(
    collectJsxElements(children, (element) => element.type === ToastTitle)
      .length > 0
  );
  const hasDescriptionState = state(
    collectJsxElements(children, (element) => element.type === ToastDescription)
      .length > 0
  );
  const hasTitle = hasTitleState();
  const hasDescription = hasDescriptionState();
  const entry = getToastEntry(toastId);
  const resolvedDuration = duration ?? props.provider.duration;
  const setOpen = (nextOpen: boolean) => {
    openState.set(nextOpen);
  };
  const setHasTitle = (present: boolean) => {
    hasTitleState.set(present);
  };
  const setHasDescription = (present: boolean) => {
    hasDescriptionState.set(present);
  };
  const setNode = (node: HTMLElement | null) => {
    entry.node = node;
  };
  const rootContext: ToastRootContextValue = {
    providerId: props.provider.providerId,
    toastId,
    open: openState(),
    setOpen,
    titleId: resolvePartId(toastId, 'title'),
    descriptionId: resolvePartId(toastId, 'description'),
    variant,
    hasTitle,
    hasDescription,
    setHasTitle,
    setHasDescription,
    setNode,
  };

  resource(
    ({ signal }) => {
      if (!rootContext.open) {
        return null;
      }

      if (entry.previousFocused === null) {
        entry.previousFocused =
          document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null;
      }

      clearToastTimer(entry);

      const timeoutId = setTimeout(() => {
        if (entry.timer === timeoutId) {
          entry.timer = null;
        }

        rootContext.setOpen(false);
      }, resolvedDuration);

      entry.timer = timeoutId;
      signal.addEventListener(
        'abort',
        () => {
          if (entry.timer === timeoutId) {
            clearTimeout(timeoutId);
            entry.timer = null;
          }
        },
        { once: true }
      );

      return null;
    },
    [toastId, rootContext.open, resolvedDuration]
  );

  resource(() => {
    if (rootContext.open) {
      return null;
    }

    clearToastTimer(entry);
    restoreToastFocus(entry);
    return null;
  }, [toastId, rootContext.open]);

  resource(
    ({ signal }) => {
      signal.addEventListener(
        'abort',
        () => {
          clearToastTimer(entry);
          restoreToastFocus(entry);
          entry.node = null;
          toastEntries.delete(toastId);
        },
        { once: true }
      );

      return null;
    },
    [toastId]
  );

  const finalProps = mergeProps(rest, {
    ref: composeRefs(
      ref as
        | ((value: HTMLElement | null) => void)
        | { current: HTMLElement | null }
        | null
        | undefined,
      rootContext.setNode
    ),
    id: toastId,
    role: 'status',
    'aria-live': 'polite',
    'aria-labelledby': rootContext.hasTitle ? rootContext.titleId : undefined,
    'aria-describedby': rootContext.hasDescription
      ? rootContext.descriptionId
      : undefined,
    'data-slot': 'toast',
    'data-state': rootContext.open ? 'open' : 'closed',
    'data-toast': 'true',
    'data-variant': variant && variant !== 'default' ? variant : undefined,
  });

  return (
    <ToastRootContext.Scope value={rootContext}>
      <Presence present={rootContext.open}>
        <DismissableLayer
          onEscapeKeyDown={() => {
            rootContext.setOpen(false);
          }}
          onDismiss={() => {
            rootContext.setOpen(false);
          }}
        >
          <div {...finalProps}>{children}</div>
        </DismissableLayer>
      </Presence>
    </ToastRootContext.Scope>
  );
}

/**
 * ToastProvider owns the registry of active toast entries and the default
 * display duration for the family.
 */
export function ToastProvider(props: ToastProviderProps) {
  const { children, duration = 5000, id, ref, ...rest } = props;
  const providerId = resolveCompoundId('toast-provider', id, children);
  const toastRegistrationsState = state<ToastRegistration[]>([]);
  const providerContext = getToastProviderContext(providerId);
  const registerToast = (registration: ToastRegistration) => {
    const nextRegistrations = toastRegistrationsState().filter(
      (entry) => entry.toastId !== registration.toastId
    );
    nextRegistrations.push(registration);
    toastRegistrationsState.set(nextRegistrations);
    providerContext.toasts = nextRegistrations;
  };
  const unregisterToast = (toastId: string) => {
    const nextRegistrations = toastRegistrationsState().filter(
      (entry) => entry.toastId !== toastId
    );
    toastRegistrationsState.set(nextRegistrations);
    providerContext.toasts = nextRegistrations;
  };
  providerContext.providerId = providerId;
  providerContext.duration = duration;
  providerContext.toasts = toastRegistrationsState();
  providerContext.registerToast = registerToast;
  providerContext.unregisterToast = unregisterToast;
  const finalProps = mergeProps(rest, {
    ref,
    'data-slot': 'toast-provider',
    'data-toast-provider': 'true',
  });

  resource(
    ({ signal }) => {
      signal.addEventListener(
        'abort',
        () => {
          toastProviderContexts.delete(providerId);
        },
        { once: true }
      );

      return null;
    },
    [providerId]
  );

  return (
    <ToastProviderContext.Scope value={providerContext}>
      <div {...finalProps}>{children}</div>
    </ToastProviderContext.Scope>
  );
}

/**
 * ToastViewport renders the live toast stack and the notification region.
 */
export function ToastViewport(props: ToastViewportProps): JSX.Element;
export function ToastViewport(props: ToastViewportAsChildProps): JSX.Element;
export function ToastViewport(
  props: ToastViewportProps | ToastViewportAsChildProps
) {
  const { asChild, children, ref, ...rest } = props;
  const provider = readToastProviderContext();
  const content = (
    <>
      {provider.toasts.map((registration) => (
        <ToastRegistrationView
          key={registration.toastId}
          registration={registration}
          provider={provider}
        />
      ))}
      {children}
    </>
  );
  const finalProps = mergeProps(rest, {
    ref,
    role: 'region',
    'aria-live': 'polite',
    'aria-label': 'Notifications',
    'data-slot': 'toast-viewport',
    'data-toast-viewport': 'true',
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={content as JSX.Element} />;
  }

  return <div {...finalProps}>{content}</div>;
}

/**
 * Toast registers a notification entry with the provider and returns no DOM on
 * its own.
 */
export function Toast(props: ToastProps): JSX.Element | null {
  const provider = readToastProviderContext();
  const toastId = resolveCompoundId('toast', props.id, props.children);

  resource(
    ({ signal }) => {
      provider.registerToast({
        toastId,
        props,
      });

      signal.addEventListener(
        'abort',
        () => {
          provider.unregisterToast(toastId);
        },
        { once: true }
      );

      return null;
    },
    [
      provider.providerId,
      toastId,
      props.children,
      props.defaultOpen,
      props.duration,
      props.onOpenChange,
      props.open,
      props.variant,
    ]
  );

  return null;
}

/**
 * ToastTitle marks the accessible title slot for a toast entry.
 */
export function ToastTitle(props: ToastTitleProps): JSX.Element;
export function ToastTitle(props: ToastTitleAsChildProps): JSX.Element;
export function ToastTitle(props: ToastTitleProps | ToastTitleAsChildProps) {
  const { asChild, children, ref, ...rest } = props;
  const root = readToastRootContext();
  const deferHasTitle = (present: boolean) => {
    queueMicrotask(() => {
      root.setHasTitle(present);
    });
  };
  const finalProps = mergeProps(rest, {
    ref: composeRefs(
      ref as
        | ((value: HTMLElement | null) => void)
        | { current: HTMLElement | null }
        | null
        | undefined,
      (node: HTMLElement | null) => {
        deferHasTitle(Boolean(node));
      }
    ),
    id: root.titleId,
    'data-slot': 'toast-title',
    'data-toast-title': 'true',
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return <div {...finalProps}>{children}</div>;
}

/**
 * ToastDescription marks the accessible description slot for a toast entry.
 */
export function ToastDescription(props: ToastDescriptionProps): JSX.Element;
export function ToastDescription(
  props: ToastDescriptionAsChildProps
): JSX.Element;
export function ToastDescription(
  props: ToastDescriptionProps | ToastDescriptionAsChildProps
) {
  const { asChild, children, ref, ...rest } = props;
  const root = readToastRootContext();
  const deferHasDescription = (present: boolean) => {
    queueMicrotask(() => {
      root.setHasDescription(present);
    });
  };
  const finalProps = mergeProps(rest, {
    ref: composeRefs(
      ref as
        | ((value: HTMLElement | null) => void)
        | { current: HTMLElement | null }
        | null
        | undefined,
      (node: HTMLElement | null) => {
        deferHasDescription(Boolean(node));
      }
    ),
    id: root.descriptionId,
    'data-slot': 'toast-description',
    'data-toast-description': 'true',
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return <div {...finalProps}>{children}</div>;
}

/**
 * ToastAction closes the toast after handling a user-triggered action.
 */
export function ToastAction(props: ToastActionProps): JSX.Element;
export function ToastAction(props: ToastActionAsChildProps): JSX.Element;
export function ToastAction(props: ToastActionProps | ToastActionAsChildProps) {
  const {
    asChild,
    children,
    disabled = false,
    onPress,
    ref,
    type: typeProp,
    ...rest
  } = props;
  const root = readToastRootContext();
  const interactionProps = pressable({
    disabled,
    onPress: (event) => {
      onPress?.(event);

      if (!event.defaultPrevented) {
        root.setOpen(false);
      }
    },
    isNativeButton: !asChild,
  });
  const finalProps = mergeProps(rest, {
    ...interactionProps,
    ref,
    'data-slot': 'toast-action',
    'data-disabled': disabled ? 'true' : undefined,
    'data-toast-action': 'true',
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return (
    <button type={typeProp ?? 'button'} {...finalProps}>
      {children}
    </button>
  );
}

/**
 * ToastClose is the dedicated dismiss control for a toast entry.
 */
export function ToastClose(props: ToastCloseProps): JSX.Element;
export function ToastClose(props: ToastCloseAsChildProps): JSX.Element;
export function ToastClose(props: ToastCloseProps | ToastCloseAsChildProps) {
  const {
    asChild,
    children,
    disabled = false,
    onPress,
    ref,
    type: typeProp,
    ...rest
  } = props;
  const root = readToastRootContext();
  const interactionProps = pressable({
    disabled,
    onPress: (event) => {
      onPress?.(event);

      if (!event.defaultPrevented) {
        root.setOpen(false);
      }
    },
    isNativeButton: !asChild,
  });
  const finalProps = mergeProps(rest, {
    ...interactionProps,
    ref,
    'data-slot': 'toast-close',
    'data-disabled': disabled ? 'true' : undefined,
    'data-toast-close': 'true',
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return (
    <button type={typeProp ?? 'button'} {...finalProps}>
      {children ?? 'Close'}
    </button>
  );
}
