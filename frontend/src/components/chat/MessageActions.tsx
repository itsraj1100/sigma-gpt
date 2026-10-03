import { useState } from "react";
import { Check, Copy, Pencil, RotateCcw, ThumbsDown, ThumbsUp } from "lucide-react";

interface MessageActionsProps {
  variant: "user" | "assistant";
  content: string;
  onEdit?: () => void;
  onRegenerate?: () => void;
  disabled?: boolean;
}

const buttonClass =
  "flex h-7 w-7 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-bg-tertiary hover:text-text disabled:opacity-40 disabled:hover:bg-transparent";

export function MessageActions({
  variant,
  content,
  onEdit,
  onRegenerate,
  disabled,
}: MessageActionsProps) {
  const [copied, setCopied] = useState(false);
  // Like/dislike are lightweight UI feedback only - they are not persisted to the backend.
  const [feedback, setFeedback] = useState<"liked" | "disliked" | null>(null);

  async function handleCopy() {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex items-center gap-0.5">
      <button
        type="button"
        onClick={handleCopy}
        aria-label="Copy message"
        title="Copy"
        className={buttonClass}
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </button>

      {variant === "user" && onEdit && (
        <button
          type="button"
          onClick={onEdit}
          aria-label="Edit message"
          title="Edit"
          disabled={disabled}
          className={buttonClass}
        >
          <Pencil size={14} />
        </button>
      )}

      {variant === "assistant" && (
        <>
          {onRegenerate && (
            <button
              type="button"
              onClick={onRegenerate}
              aria-label="Regenerate response"
              title="Regenerate"
              disabled={disabled}
              className={buttonClass}
            >
              <RotateCcw size={14} />
            </button>
          )}
          <button
            type="button"
            onClick={() => setFeedback((f) => (f === "liked" ? null : "liked"))}
            aria-label="Good response"
            aria-pressed={feedback === "liked"}
            title="Good response"
            className={`${buttonClass} ${feedback === "liked" ? "text-accent" : ""}`}
          >
            <ThumbsUp size={14} />
          </button>
          <button
            type="button"
            onClick={() => setFeedback((f) => (f === "disliked" ? null : "disliked"))}
            aria-label="Bad response"
            aria-pressed={feedback === "disliked"}
            title="Bad response"
            className={`${buttonClass} ${feedback === "disliked" ? "text-danger" : ""}`}
          >
            <ThumbsDown size={14} />
          </button>
        </>
      )}
    </div>
  );
}
