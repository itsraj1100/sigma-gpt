import { useEffect, useRef, useState, type MouseEvent, type FormEvent } from "react";
import { Check, MessageSquare, Pencil, Trash2, X } from "lucide-react";
import { Conversation } from "../../types";

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onOpen: () => void;
  onRename: (title: string) => void;
  onDeleteRequest: () => void;
}

export function ConversationItem({
  conversation,
  isActive,
  onOpen,
  onRename,
  onDeleteRequest,
}: ConversationItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(conversation.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) inputRef.current?.select();
  }, [isEditing]);

  function startEdit(e: MouseEvent) {
    e.stopPropagation();
    setDraft(conversation.title);
    setIsEditing(true);
  }

  function commitEdit(e?: FormEvent) {
    e?.preventDefault();
    const trimmed = draft.trim();
    if (trimmed && trimmed !== conversation.title) onRename(trimmed);
    setIsEditing(false);
  }

  if (isEditing) {
    return (
      <form
        onSubmit={commitEdit}
        className="flex items-center gap-1 rounded-lg bg-bg-tertiary px-2 py-1.5"
      >
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Escape" && setIsEditing(false)}
          className="min-w-0 flex-1 bg-transparent text-sm text-text focus:outline-none"
        />
        <button type="submit" aria-label="Save name" className="rounded p-1 hover:bg-bg">
          <Check size={14} />
        </button>
        <button
          type="button"
          onClick={() => setIsEditing(false)}
          aria-label="Cancel rename"
          className="rounded p-1 hover:bg-bg"
        >
          <X size={14} />
        </button>
      </form>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => e.key === "Enter" && onOpen()}
      className={`group flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors ${
        isActive ? "bg-bg-tertiary text-text" : "text-text-muted hover:bg-bg-tertiary hover:text-text"
      }`}
    >
      <MessageSquare size={15} className="shrink-0" />
      <span className="min-w-0 flex-1 truncate">{conversation.title}</span>
      <div className="hidden shrink-0 items-center gap-0.5 group-hover:flex">
        <button
          type="button"
          onClick={startEdit}
          aria-label="Rename conversation"
          title="Rename"
          className="rounded p-1 hover:bg-bg"
        >
          <Pencil size={13} />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteRequest();
          }}
          aria-label="Delete conversation"
          title="Delete"
          className="rounded p-1 hover:bg-bg hover:text-danger"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}
