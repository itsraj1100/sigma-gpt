import { SquarePen } from "lucide-react";

interface NewChatButtonProps {
  onClick: () => void;
}

export function NewChatButton({ onClick }: NewChatButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2.5 rounded-lg border border-border px-3 py-2.5 text-sm font-medium text-text transition-colors hover:bg-bg-tertiary"
    >
      <SquarePen size={16} />
      New chat
    </button>
  );
}
