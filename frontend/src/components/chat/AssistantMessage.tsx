import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Bot } from "lucide-react";
import { Message } from "../../types";
import { CodeBlock } from "./CodeBlock";
import { MessageActions } from "./MessageActions";

interface AssistantMessageProps {
  message: Message;
  isStreaming: boolean;
  onRegenerate: () => void;
  regenerateDisabled: boolean;
}

export function AssistantMessage({
  message,
  isStreaming,
  onRegenerate,
  regenerateDisabled,
}: AssistantMessageProps) {
  const showCaret = isStreaming && message.content.length > 0;
  const showThinking = isStreaming && message.content.length === 0;

  return (
    <div className="group flex gap-3 px-4 py-5 sm:px-6">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-accent-contrast">
        <Bot size={15} />
      </div>
      <div className="min-w-0 flex-1">
        {showThinking ? (
          <div className="flex gap-1 py-1.5">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-text-muted [animation-delay:-0.3s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-text-muted [animation-delay:-0.15s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-text-muted" />
          </div>
        ) : (
          <div className="prose-chat max-w-none text-[0.95rem] text-text">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "");
                  const codeString = String(children).replace(/\n$/, "");
                  const isBlock = Boolean(match) || codeString.includes("\n");
                  if (!isBlock) {
                    return (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  }
                  return <CodeBlock language={match?.[1] ?? ""} code={codeString} />;
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
            {showCaret && <span className="streaming-caret" aria-hidden="true" />}
          </div>
        )}

        {!isStreaming && (
          <div className="mt-1.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
            <MessageActions
              variant="assistant"
              content={message.content}
              onRegenerate={onRegenerate}
              disabled={regenerateDisabled}
            />
          </div>
        )}
      </div>
    </div>
  );
}
