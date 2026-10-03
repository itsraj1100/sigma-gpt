import { Square } from "lucide-react";

interface StopGeneratingButtonProps {
  onClick: () => void;
}

export function StopGeneratingButton({ onClick }: StopGeneratingButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 rounded-full border border-border bg-bg px-4 py-2 text-sm font-medium text-text shadow-sm transition-colors hover:bg-bg-tertiary"
    >
      <Square size={13} fill="currentColor" />
      Stop generating
    </button>
  );
}
