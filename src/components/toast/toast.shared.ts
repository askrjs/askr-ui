import { defineScope, readScope } from '@askrjs/askr';
import type { ToastVariant, ToastProps } from './toast.types';

export type ToastRegistration = {
  toastId: string;
  signature: string;
  props: ToastProps;
};

export type ToastHostContextValue = {
  hostId: string;
  duration: number;
  toasts: ToastRegistration[];
  getToasts: () => ToastRegistration[];
  registerToast: (registration: ToastRegistration) => void;
  unregisterToast: (toastId: string, registration: ToastRegistration) => void;
};

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

export function readToastHostContext(): ToastHostContextValue {
  const context = readScope(ToastHostContext);

  if (!context) {
    throw new Error('Toast components must be used within <ToastHost>');
  }

  return context;
}

export function readToastRootContext(): ToastRootContextValue {
  const context = readScope(ToastRootContext);

  if (!context) {
    throw new Error('Toast parts must be used within <Toast>');
  }

  return context;
}
