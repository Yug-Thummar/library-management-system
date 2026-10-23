import { CheckCircle2, Info, X, XCircle } from 'lucide-react'
import { useToast } from '../../context/ToastContext'

export function ToastStack() {
  const { toasts, dismissToast } = useToast()

  if (toasts.length === 0) {
    return null
  }

  return (
    <div className="fixed right-4 bottom-20 z-50 flex w-[min(100%-2rem,22rem)] flex-col gap-2 lg:bottom-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="flex items-start gap-3 rounded-2xl border border-line bg-white px-4 py-3 shadow-lg"
          role="status"
        >
          <span className="mt-0.5 text-accent">
            {toast.tone === 'success' ? <CheckCircle2 size={18} /> : null}
            {toast.tone === 'error' ? <XCircle size={18} className="text-rose-700" /> : null}
            {toast.tone === 'info' ? <Info size={18} /> : null}
          </span>
          <p className="flex-1 text-sm leading-5 text-ink">{toast.message}</p>
          <button
            type="button"
            onClick={() => dismissToast(toast.id)}
            className="rounded-lg p-1 text-muted hover:bg-paper hover:text-ink focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/20"
            aria-label="Dismiss message"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
