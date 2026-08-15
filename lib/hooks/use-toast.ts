/**
 * Toast notification hook
 * Simple toast system for user feedback
 */

import { useState, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

let toastCounter = 0;
const listeners: Set<(toasts: Toast[]) => void> = new Set();
let toasts: Toast[] = [];

function notifyListeners() {
  listeners.forEach(listener => listener([...toasts]));
}

export function addToast(toast: Omit<Toast, 'id'>): string {
  const id = `toast-${++toastCounter}`;
  const newToast: Toast = {
    id,
    duration: 5000,
    ...toast,
  };
  
  toasts = [...toasts, newToast];
  notifyListeners();
  
  // Auto-remove after duration
  if (newToast.duration) {
    setTimeout(() => {
      removeToast(id);
    }, newToast.duration);
  }
  
  return id;
}

export function removeToast(id: string) {
  toasts = toasts.filter(t => t.id !== id);
  notifyListeners();
}

export function useToast() {
  const [currentToasts, setCurrentToasts] = useState<Toast[]>([]);
  
  // Subscribe to toast updates
  useState(() => {
    const listener = (newToasts: Toast[]) => {
      setCurrentToasts(newToasts);
    };
    listeners.add(listener);
    
    return () => {
      listeners.delete(listener);
    };
  });
  
  const toast = useCallback((toast: Omit<Toast, 'id'>) => {
    return addToast(toast);
  }, []);
  
  const dismiss = useCallback((id: string) => {
    removeToast(id);
  }, []);
  
  return {
    toasts: currentToasts,
    toast,
    dismiss,
  };
}

// Helper functions for common toast types
export const toast = {
  success: (title: string, message?: string) => 
    addToast({ type: 'success', title, message }),
  
  error: (title: string, message?: string) => 
    addToast({ type: 'error', title, message, duration: 7000 }),
  
  warning: (title: string, message?: string) => 
    addToast({ type: 'warning', title, message }),
  
  info: (title: string, message?: string) => 
    addToast({ type: 'info', title, message }),
};
