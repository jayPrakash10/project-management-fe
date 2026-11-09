import { createContext } from 'react';

export type ToastTone = 'success' | 'error' | 'info';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastOptions {
  description?: string;
  action?: ToastAction;
}

export interface ToastItem extends ToastOptions {
  id: number;
  tone: ToastTone;
  message: string;
}

export interface ToastContextValue {
  toasts: ToastItem[];
  show: (tone: ToastTone, message: string, options?: ToastOptions) => number;
  dismiss: (id: number) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);
