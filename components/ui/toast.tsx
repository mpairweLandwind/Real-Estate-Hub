"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ToastProps {
  id: string
  title?: string
  description?: string
  variant?: "default" | "success" | "error"
  duration?: number
}

const ToastContext = React.createContext<{
  toasts: ToastProps[]
  addToast: (toast: Omit<ToastProps, "id">) => void
  removeToast: (id: string) => void
}>({
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
})

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastProps[]>([])

  const addToast = React.useCallback((toast: Omit<ToastProps, "id">) => {
    const id = Math.random().toString(36).substring(7)
    const newToast = { ...toast, id }
    setToasts((prev) => [...prev, newToast])

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, toast.duration || 5000)
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "rounded-lg border p-4 shadow-lg animate-in slide-in-from-bottom-5",
              toast.variant === "success" && "bg-green-50 border-green-200 text-green-900",
              toast.variant === "error" && "bg-red-50 border-red-200 text-red-900",
              (!toast.variant || toast.variant === "default") && "bg-background border-border",
            )}
          >
            <div className="flex items-start gap-3">
              <div className="flex-1">
                {toast.title && <p className="font-semibold mb-1">{toast.title}</p>}
                {toast.description && <p className="text-sm opacity-90">{toast.description}</p>}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-current opacity-50 hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within ToastProvider")
  }
  return context
}
