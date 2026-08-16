'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
  Sparkles,
} from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  toasts: ToastItem[];
  showToast: (toast: Omit<ToastItem, 'id'>) => string;
  success: (message: string, title?: string, duration?: number) => string;
  error: (message: string, title?: string, duration?: number) => string;
  warning: (message: string, title?: string, duration?: number) => string;
  info: (message: string, title?: string, duration?: number) => string;
  dismissToast: (id: string) => void;
  clearAll: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Global dispatcher reference for non-React contexts
let globalToastDispatcher: ((toast: Omit<ToastItem, 'id'>) => string) | null = null;

export const toast = {
  show: (t: Omit<ToastItem, 'id'>) => globalToastDispatcher?.(t) || '',
  success: (message: string, title?: string, duration?: number) =>
    globalToastDispatcher?.({ type: 'success', message, title, duration }) || '',
  error: (message: string, title?: string, duration?: number) =>
    globalToastDispatcher?.({ type: 'error', message, title, duration }) || '',
  warning: (message: string, title?: string, duration?: number) =>
    globalToastDispatcher?.({ type: 'warning', message, title, duration }) || '',
  info: (message: string, title?: string, duration?: number) =>
    globalToastDispatcher?.({ type: 'info', message, title, duration }) || '',
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  const showToast = useCallback(
    ({ type, title, message, duration = 4500, action }: Omit<ToastItem, 'id'>) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const newToast: ToastItem = { id, type, title, message, duration, action };

      setToasts((prev) => [newToast, ...prev.slice(0, 4)]); // Keep at most 5 active toasts

      if (duration > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, duration);
      }

      return id;
    },
    [dismissToast]
  );

  const success = useCallback(
    (message: string, title?: string, duration?: number) =>
      showToast({ type: 'success', message, title, duration }),
    [showToast]
  );

  const error = useCallback(
    (message: string, title?: string, duration?: number) =>
      showToast({ type: 'error', message, title, duration }),
    [showToast]
  );

  const warning = useCallback(
    (message: string, title?: string, duration?: number) =>
      showToast({ type: 'warning', message, title, duration }),
    [showToast]
  );

  const info = useCallback(
    (message: string, title?: string, duration?: number) =>
      showToast({ type: 'info', message, title, duration }),
    [showToast]
  );

  globalToastDispatcher = showToast;

  const value = useMemo(
    () => ({
      toasts,
      showToast,
      success,
      error,
      warning,
      info,
      dismissToast,
      clearAll,
    }),
    [toasts, showToast, success, error, warning, info, dismissToast, clearAll]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* Floating Toast Notification Container */}
      <div
        aria-live="assertive"
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[99999] flex flex-col gap-2.5 max-w-sm sm:max-w-md w-full pointer-events-none px-3 sm:px-0"
      >
        {toasts.map((t) => {
          const isSuccess = t.type === 'success';
          const isError = t.type === 'error';
          const isWarning = t.type === 'warning';

          return (
            <div
              key={t.id}
              role="alert"
              className={`pointer-events-auto w-full flex items-start gap-3 p-4 rounded-2xl shadow-2xl backdrop-blur-xl border transition-all duration-300 transform translate-y-0 animate-in fade-in slide-in-from-bottom-3 ${
                isSuccess
                  ? 'bg-emerald-900/95 dark:bg-emerald-950/95 border-emerald-500/40 text-white shadow-emerald-950/30'
                  : isError
                  ? 'bg-rose-900/95 dark:bg-rose-950/95 border-rose-500/40 text-white shadow-rose-950/30'
                  : isWarning
                  ? 'bg-amber-900/95 dark:bg-amber-950/95 border-amber-500/40 text-white shadow-amber-950/30'
                  : 'bg-stone-900/95 dark:bg-stone-950/95 border-stone-700/60 text-white shadow-black/40'
              }`}
            >
              {/* Icon */}
              <div className="shrink-0 mt-0.5">
                {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                {isError && <AlertCircle className="w-5 h-5 text-rose-400" />}
                {isWarning && <AlertTriangle className="w-5 h-5 text-amber-400" />}
                {!isSuccess && !isError && !isWarning && <Info className="w-5 h-5 text-blue-400" />}
              </div>

              {/* Message Content */}
              <div className="flex-1 min-w-0 pr-1">
                {t.title && <h5 className="text-xs font-bold tracking-tight mb-0.5">{t.title}</h5>}
                <p className="text-xs text-stone-200 leading-relaxed break-words">{t.message}</p>
                {t.action && (
                  <button
                    onClick={() => {
                      t.action?.onClick();
                      dismissToast(t.id);
                    }}
                    className="mt-2 text-xs font-bold underline text-amber-300 hover:text-amber-200 cursor-pointer"
                  >
                    {t.action.label}
                  </button>
                )}
              </div>

              {/* Dismiss Button */}
              <button
                onClick={() => dismissToast(t.id)}
                className="shrink-0 text-stone-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
