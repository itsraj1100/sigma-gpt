import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { StopGeneratingButton } from "./StopGeneratingButton";
import { SendButton } from "./SendButton";

const MAX_LENGTH = 8000;

interface ChatInputProps {
  onSend: (content: string) => void;
  onStop: () => void;
  isStreaming: boolean;
}

export function ChatInput({ onSend, onStop, isStreaming }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [value]);

  function handleSubmit(e?: FormEvent) {
    e?.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || trimmed.length > MAX_LENGTH || isStreaming) return;
    onSend(trimmed);
    setValue("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  const isOverLimit = value.length > MAX_LENGTH;

  return (
    <div className="border-t border-border bg-bg px-4 py-3 sm:px-6">
      <form onSubmit={handleSubmit} className="mx-auto flex max-w-3xl items-end gap-2">
        <div className="flex flex-1 items-end rounded-chat border border-border bg-bg-secondary px-3.5 py-2 focus-within:border-accent">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Message the assistant..."
            aria-label="Message"
            className="max-h-[200px] flex-1 resize-none bg-transparent text-[0.95rem] leading-6 text-text placeholder:text-text-muted focus:outline-none"
          />
        </div>
        {isStreaming ? (
          <StopGeneratingButton onClick={onStop} />
        ) : (
          <SendButton disabled={!value.trim() || isOverLimit} />
        )}
      </form>
      <div className="mx-auto mt-1.5 flex max-w-3xl items-center justify-between px-1">
        <p className="text-xs text-text-muted">Enter to send · Shift + Enter for a new line</p>
        {value.length > MAX_LENGTH * 0.8 && (
          <p className={`text-xs ${isOverLimit ? "text-danger" : "text-text-muted"}`}>
            {value.length}/{MAX_LENGTH}
          </p>
        )}
      </div>
    </div>
  );
}
