import { useState } from "react";
import { Conversation } from "../../types";
import { groupConversationsByRecency } from "../../utils/groupConversations";
import { useConversationStore } from "../../store/conversationStore";
import { ConversationItem } from "./ConversationItem";
import { ConfirmDialog } from "../common/ConfirmDialog";
import { LoadingIndicator } from "../common/LoadingIndicator";

interface ConversationListProps {
  conversations: Conversation[];
  isLoading: boolean;
  activeId: string | null;
  onOpen: (id: string) => void;
  emptyLabel?: string;
}

export function ConversationList({
  conversations,
  isLoading,
  activeId,
  onOpen,
  emptyLabel = "No conversations yet",
}: ConversationListProps) {
  const { renameConversation, deleteConversation } = useConversationStore();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="px-2 py-4">
        <LoadingIndicator label="Loading chats..." />
      </div>
    );
  }

  if (conversations.length === 0) {
    return <p className="px-2 py-4 text-sm text-text-muted">{emptyLabel}</p>;
  }

  const groups = groupConversationsByRecency(conversations);

  return (
    <>
      <div className="space-y-4">
        {groups.map((group) => (
          <div key={group.label}>
            <h3 className="px-2 pb-1 text-xs font-semibold uppercase tracking-wide text-text-muted">
              {group.label}
            </h3>
            <div className="space-y-0.5">
              {group.items.map((conversation) => (
                <ConversationItem
                  key={conversation.id}
                  conversation={conversation}
                  isActive={conversation.id === activeId}
                  onOpen={() => onOpen(conversation.id)}
                  onRename={(title) => renameConversation(conversation.id, title)}
                  onDeleteRequest={() => setPendingDeleteId(conversation.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={pendingDeleteId !== null}
        title="Delete this conversation?"
        description="This will permanently delete the conversation and all of its messages. This can't be undone."
        confirmLabel="Delete"
        onCancel={() => setPendingDeleteId(null)}
        onConfirm={() => {
          if (pendingDeleteId) deleteConversation(pendingDeleteId);
          setPendingDeleteId(null);
        }}
      />
    </>
  );
}
