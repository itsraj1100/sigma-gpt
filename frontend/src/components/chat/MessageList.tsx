import { Message } from "../../types";
import { useAutoScroll } from "../../hooks/useAutoScroll";
import { UserMessage } from "./UserMessage";
import { AssistantMessage } from "./AssistantMessage";

interface MessageListProps {
  messages: Message[];
  isStreaming: boolean;
  onRegenerate: () => void;
  onEditMessage: (id: string, content: string) => void;
}

export function MessageList({
  messages,
  isStreaming,
  onRegenerate,
  onEditMessage,
}: MessageListProps) {
  const visibleMessages = messages.filter((m) => m.role !== "system");
  const containerRef = useAutoScroll<HTMLDivElement>(visibleMessages);

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-3xl pb-4 pt-2">
        {visibleMessages.map((message, index) => {
          const isLast = index === visibleMessages.length - 1;

          if (message.role === "user") {
            return (
              <UserMessage
                key={message.id}
                message={message}
                editDisabled={isStreaming}
                onSaveEdit={(content) => onEditMessage(message.id, content)}
              />
            );
          }

          return (
            <AssistantMessage
              key={message.id}
              message={message}
              isStreaming={isStreaming && isLast}
              onRegenerate={onRegenerate}
              regenerateDisabled={isStreaming}
            />
          );
        })}
      </div>
    </div>
  );
}
