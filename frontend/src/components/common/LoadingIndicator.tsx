import { Loader2 } from "lucide-react";

interface LoadingIndicatorProps {
  label?: string;
  size?: number;
  className?: string;
}

export function LoadingIndicator({ label, size = 18, className = "" }: LoadingIndicatorProps) {
  return (
    <div className={`flex items-center gap-2 text-text-muted ${className}`} role="status">
      <Loader2 size={size} className="animate-spin" aria-hidden="true" />
      {label && <span className="text-sm">{label}</span>}
      <span className="sr-only">Loading</span>
    </div>
  );
}
