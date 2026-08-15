import { defineScope, readScope } from '@askrjs/askr';
import type { ToastVariant, ToastProps } from './toast.types';

/** Toast Registration. */
export type ToastRegistration = {
  toastId: string;
  signature: string;
  props: ToastProps;
};

/** Shape of the Toast Host Context Value. */
export type ToastHostContextValue = {
  hostId: string;
  duration: number;
  toasts: ToastRegistration[];
  getToasts: () => ToastRegistration[];
  registerToast: (registration: ToastRegistration) => void;
  unregisterToast: (toastId: string, registration: ToastRegistration) => void;
};

/** Shape of the Toast Root Context Value. */
export type ToastRootContextValue = {
  hostId: string;
  toastId: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  titleId: string;
  descriptionId: string;
  variant?: ToastVariant;
  hasTitle: boolean;
  hasDescription: boolean;
  setNode: (node: HTMLElement | null) => void;
};

export const ToastHostContext = defineScope<ToastHostContextValue | null>(null);
export const ToastRootContext = defineScope<ToastRootContextValue | null>(null);

/**
 * Reads the Toast Host Context; throws if called outside its provider.
 */
export function readToastHostContext(): ToastHostContextValue {
  const context = readScope(ToastHostContext);

  if (!context) {
    throw new Error('Toast components must be used within <ToastHost>');
  }

  return context;
}

/**
 * Reads the Toast Root Context; throws if called outside its provider.
 */
export function readToastRootContext(): ToastRootContextValue {
  const context = readScope(ToastRootContext);

  if (!context) {
    throw new Error('Toast parts must be used within <Toast>');
  }

  return context;
}
