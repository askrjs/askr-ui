import { defineContext, readContext } from '@askrjs/askr';
import {
  Presence,
  Slot,
  composeRefs,
  controllableState,
  mergeProps,
  pressable,
} from '@askrjs/askr/foundations';
import { resource } from '@askrjs/askr/resources';
import { DismissableLayer } from '../../composites/dismissable-layer';
import { resolveCompoundId, resolvePartId } from '../../_internal/id';
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

type ToastProviderContextValue = {
  providerId: string;
  duration: number;
};

type ToastContextValue = {
  toastId: string;
  titleId: string;
  descriptionId: string;
  open: boolean;
  setOpen: (open: boolean) => void;
};

type ToastLifecycleEntry = {
  node: HTMLElement | null;
  timer: ReturnType<typeof setTimeout> | null;
  previousFocused: HTMLElement | null;
};

const toastEntries = new Map<string, ToastLifecycleEntry>();

const ToastProviderContext = defineContext<ToastProviderContextValue | null>(
  null
);
const ToastContext = defineContext<ToastContextValue | null>(null);

function readToastProviderContext(): ToastProviderContextValue {
  const context = readContext(ToastProviderContext);

  if (!context) {
    throw new Error('Toast components must be used within <ToastProvider>');
  }

  return context;
}

function readToastContext(): ToastContextValue {
  const context = readContext(ToastContext);

  if (!context) {
    throw new Error('Toast parts must be used within <Toast>');
  }

  return context;
}

function ToastProviderScopeView(props: {
  finalProps: Record<string, unknown>;
  children?: unknown;
}) {
  return <div {...props.finalProps}>{props.children}</div>;
}

function ToastScopeView(props: {
  finalProps: Record<string, unknown>;
  children?: unknown;
}) {
  return <div {...props.finalProps}>{props.children}</div>;
}

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

export function ToastProvider(props: ToastProviderProps) {
  const { children, duration = 5000, id, ref, ...rest } = props;
  const providerId = resolveCompoundId('toast-provider', id, children);
  const finalProps = mergeProps(rest, {
    ref,
    'data-slot': 'toast-provider',
    'data-toast-provider': 'true',
  });
  const providerContext: ToastProviderContextValue = {
    providerId,
    duration,
  };

  return (
    <ToastProviderContext.Scope value={providerContext}>
      <ToastProviderScopeView
        finalProps={finalProps as Record<string, unknown>}
      >
        {children}
      </ToastProviderScopeView>
    </ToastProviderContext.Scope>
  );
}

export function ToastViewport(props: ToastViewportProps): JSX.Element;
export function ToastViewport(props: ToastViewportAsChildProps): JSX.Element;
export function ToastViewport(
  props: ToastViewportProps | ToastViewportAsChildProps
) {
  const { asChild, children, ref, ...rest } = props;
  readToastProviderContext();
  const finalProps = mergeProps(rest, {
    ref,
    role: 'region',
    'aria-live': 'polite',
    'aria-label': 'Notifications',
    'data-slot': 'toast-viewport',
    'data-toast-viewport': 'true',
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return <div {...finalProps}>{children}</div>;
}

export function Toast(props: ToastProps): JSX.Element | null {
  const {
    children,
    open,
    defaultOpen = true,
    onOpenChange,
    duration,
    variant,
    ref,
    id,
    ...rest
  } = props;
  const provider = readToastProviderContext();
  const openState = controllableState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const toastId = resolveCompoundId(
    'toast',
    id ?? `${provider.providerId}-${String(children ?? '')}`,
    children
  );
  const titleId = resolvePartId(toastId, 'title');
  const descriptionId = resolvePartId(toastId, 'description');
  const entry = getToastEntry(toastId);
  const resolvedDuration = duration ?? provider.duration;
  const isOpen = openState();

  resource(
    ({ signal }) => {
      if (!isOpen) {
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

        openState.set(false);
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
    [toastId, isOpen, resolvedDuration]
  );

  resource(() => {
    if (isOpen) {
      return null;
    }

    clearToastTimer(entry);
    restoreToastFocus(entry);
    return null;
  }, [toastId, isOpen]);

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
      (node: HTMLElement | null) => {
        entry.node = node;
      }
    ),
    id: toastId,
    role: 'status',
    'aria-live': 'polite',
    'aria-labelledby': titleId,
    'aria-describedby': descriptionId,
    'data-slot': 'toast',
    'data-state': isOpen ? 'open' : 'closed',
    'data-toast': 'true',
    'data-variant': variant && variant !== 'default' ? variant : undefined,
  });
  const toastContext: ToastContextValue = {
    toastId,
    titleId,
    descriptionId,
    open: isOpen,
    setOpen: openState.set,
  };

  return (
    <Presence present={isOpen}>
      <DismissableLayer
        onEscapeKeyDown={() => {
          openState.set(false);
        }}
        onDismiss={() => {
          openState.set(false);
        }}
      >
        <ToastContext.Scope value={toastContext}>
          <ToastScopeView finalProps={finalProps as Record<string, unknown>}>
            {children}
          </ToastScopeView>
        </ToastContext.Scope>
      </DismissableLayer>
    </Presence>
  );
}

export function ToastTitle(props: ToastTitleProps): JSX.Element;
export function ToastTitle(props: ToastTitleAsChildProps): JSX.Element;
export function ToastTitle(props: ToastTitleProps | ToastTitleAsChildProps) {
  const { asChild, children, ref, ...rest } = props;
  const toast = readToastContext();
  const finalProps = mergeProps(rest, {
    ref,
    id: toast.titleId,
    'data-slot': 'toast-title',
    'data-toast-title': 'true',
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return <div {...finalProps}>{children}</div>;
}

export function ToastDescription(props: ToastDescriptionProps): JSX.Element;
export function ToastDescription(
  props: ToastDescriptionAsChildProps
): JSX.Element;
export function ToastDescription(
  props: ToastDescriptionProps | ToastDescriptionAsChildProps
) {
  const { asChild, children, ref, ...rest } = props;
  const toast = readToastContext();
  const finalProps = mergeProps(rest, {
    ref,
    id: toast.descriptionId,
    'data-slot': 'toast-description',
    'data-toast-description': 'true',
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return <div {...finalProps}>{children}</div>;
}

export function ToastAction(props: ToastActionProps): JSX.Element;
export function ToastAction(props: ToastActionAsChildProps): JSX.Element;
export function ToastAction(
  props: ToastActionProps | ToastActionAsChildProps
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
  const toast = readToastContext();
  const interactionProps = pressable({
    disabled,
    onPress: (event) => {
      onPress?.(event);

      if (!event.defaultPrevented) {
        toast.setOpen(false);
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
  const toast = readToastContext();
  const interactionProps = pressable({
    disabled,
    onPress: (event) => {
      onPress?.(event);

      if (!event.defaultPrevented) {
        toast.setOpen(false);
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
