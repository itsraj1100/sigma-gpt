import { useState } from "react";
import { Message } from "../../types";
import { MessageActions } from "./MessageActions";

interface UserMessageProps {
  message: Message;
  onSaveEdit: (newContent: string) => void;
  editDisabled: boolean;
}

export function UserMessage({ message, onSaveEdit, editDisabled }: UserMessageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(message.content);

  function startEdit() {
    setDraft(message.content);
    setIsEditing(true);
  }

  function save() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    setIsEditing(false);
    if (trimmed !== message.content) onSaveEdit(trimmed);
  }

  if (isEditing) {
    return (
      <div className="px-4 py-3 sm:px-6">
        <div className="ml-auto max-w-2xl">
          <textarea
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                save();
              }
              if (e.key === "Escape") setIsEditing(false);
            }}
            rows={Math.min(10, Math.max(2, draft.split("\n").length))}
            className="w-full resize-none rounded-chat border border-accent bg-bg px-4 py-3 text-[0.95rem] text-text outline-none"
          />
          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="rounded-lg px-3 py-1.5 text-sm text-text-muted hover:bg-bg-tertiary"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={save}
              className="rounded-lg bg-accent px-3.5 py-1.5 text-sm font-medium text-accent-contrast hover:bg-accent-hover"
            >
              Save & submit
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group flex justify-end px-4 py-3 sm:px-6">
      <div className="flex max-w-2xl flex-col items-end">
        <div className="whitespace-pre-wrap rounded-chat bg-accent px-4 py-2.5 text-[0.95rem] text-accent-contrast">
          {message.content}
        </div>
        <div className="mt-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
          <MessageActions
            variant="user"
            content={message.content}
            onEdit={startEdit}
            disabled={editDisabled}
          />
        </div>
      </div>
    </div>
  );
}
