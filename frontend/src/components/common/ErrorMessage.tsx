import { AlertCircle, X } from "lucide-react";

interface ErrorMessageProps {
  message: string;
  onDismiss?: () => void;
}

export function ErrorMessage({ message, onDismiss }: ErrorMessageProps) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/10 px-3.5 py-2.5 text-sm text-danger"
    >
      <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
      <p className="flex-1">{message}</p>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="shrink-0 rounded p-0.5 hover:bg-danger/15"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
