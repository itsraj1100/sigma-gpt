import { useConversationStore } from "../../store/conversationStore";
import { LoadingIndicator } from "../common/LoadingIndicator";
import { ErrorMessage } from "../common/ErrorMessage";
import { MessageList } from "./MessageList";
import { EmptyChat } from "./EmptyChat";
import { ChatInput } from "./ChatInput";

export function ChatWindow() {
  const {
    messages,
    isLoadingMessages,
    isStreaming,
    streamError,
    sendMessage,
    regenerate,
    editMessage,
    stopGenerating,
    dismissStreamError,
  } = useConversationStore();

  const hasMessages = messages.length > 0;

  return (
    <div className="flex h-full flex-col">
      {isLoadingMessages ? (
        <div className="flex flex-1 items-center justify-center">
          <LoadingIndicator label="Loading conversation..." />
        </div>
      ) : hasMessages ? (
        <MessageList
          messages={messages}
          isStreaming={isStreaming}
          onRegenerate={regenerate}
          onEditMessage={editMessage}
        />
      ) : (
        <EmptyChat onSuggestion={sendMessage} />
      )}

      {streamError && (
        <div className="px-4 pt-3 sm:px-6">
          <div className="mx-auto max-w-3xl">
            <ErrorMessage message={streamError} onDismiss={dismissStreamError} />
          </div>
        </div>
      )}

      <ChatInput onSend={sendMessage} onStop={stopGenerating} isStreaming={isStreaming} />
    </div>
  );
}
