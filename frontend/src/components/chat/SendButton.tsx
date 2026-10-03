import { ArrowUp } from "lucide-react";

interface SendButtonProps {
  disabled: boolean;
}

export function SendButton({ disabled }: SendButtonProps) {
  return (
    <button
      type="submit"
      disabled={disabled}
      aria-label="Send message"
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-accent-contrast transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:bg-bg-tertiary disabled:text-text-muted"
    >
      <ArrowUp size={17} />
    </button>
  );
}
