import { defineContext, readContext } from '@askrjs/askr';
import type { JSXElement } from '@askrjs/askr/foundations';
import type { ToastVariant } from './toast.types';

export type ToastProviderContextValue = {
  providerId: string;
  duration: number;
  toasts: JSXElement[];
};

export type ToastRootContextValue = {
  providerId: string;
  toastId: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  titleId: string;
  descriptionId: string;
  variant?: ToastVariant;
  hasTitle: boolean;
  hasDescription: boolean;
  setHasTitle: (present: boolean) => void;
  setHasDescription: (present: boolean) => void;
  setNode: (node: HTMLElement | null) => void;
};

export const ToastProviderContext =
  defineContext<ToastProviderContextValue | null>(null);
export const ToastRootContext = defineContext<ToastRootContextValue | null>(
  null
);

export function readToastProviderContext(): ToastProviderContextValue {
  const context = readContext(ToastProviderContext);

  if (!context) {
    throw new Error('Toast components must be used within <ToastProvider>');
  }

  return context;
}

export function readToastRootContext(): ToastRootContextValue {
  const context = readContext(ToastRootContext);

  if (!context) {
    throw new Error('Toast parts must be used within <Toast>');
  }

  return context;
}
