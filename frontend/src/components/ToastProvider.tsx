"use client";

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  useState,
  useEffect,
} from "react";
import { createPortal } from "react-dom";
import { Toast, type ToastData, type ToastType } from "./Toast";

// ── Actions context (stable references — no re-render for consumers) ──

interface ToastActions {
  addToast: (type: ToastType, message: string) => void;
  dismissToast: (id: string) => void;
}

const ToastActionsContext = createContext<ToastActions | null>(null);

// ── Reducer ──

type Action =
  | { type: "ADD"; toast: ToastData }
  | { type: "DISMISS"; id: string };

function reducer(state: ToastData[], action: Action): ToastData[] {
  switch (action.type) {
    case "ADD": {
      const next = [...state, action.toast];
      return next.length > 5 ? next.slice(-5) : next;
    }
    case "DISMISS":
      return state.filter((t) => t.id !== action.id);
  }
}

// ── Provider ──

let toastCounter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [toasts, dispatch] = useReducer(reducer, []);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = `toast-${++toastCounter}-${Date.now()}`;
    dispatch({ type: "ADD", toast: { id, type, message } });
  }, []);

  const dismissToast = useCallback((id: string) => {
    dispatch({ type: "DISMISS", id });
  }, []);

  const actions = useMemo(
    () => ({ addToast, dismissToast }),
    [addToast, dismissToast],
  );

  return (
    <ToastActionsContext.Provider value={actions}>
      {children}
      {mounted &&
        createPortal(
          <div
            aria-live="polite"
            className="fixed top-20 right-6 z-[60] flex flex-col gap-2 w-80 pointer-events-none"
          >
            {toasts.map((toast) => (
              <div key={toast.id} className="pointer-events-auto">
                <Toast toast={toast} onDismiss={dismissToast} />
              </div>
            ))}
          </div>,
          document.body,
        )}
    </ToastActionsContext.Provider>
  );
}

// ── Hook ──

export function useToast(): ToastActions {
  const ctx = useContext(ToastActionsContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
