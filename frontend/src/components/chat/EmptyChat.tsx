import { Code2, Lightbulb, NotebookPen, Sparkles } from "lucide-react";

interface EmptyChatProps {
  onSuggestion: (prompt: string) => void;
}

const SUGGESTIONS = [
  { icon: Lightbulb, text: "Explain a concept to me simply" },
  { icon: Code2, text: "Help me debug a piece of code" },
  { icon: NotebookPen, text: "Draft an email for me" },
  { icon: Sparkles, text: "Brainstorm ideas for a project" },
];

export function EmptyChat({ onSuggestion }: EmptyChatProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-accent-contrast">
        <Sparkles size={22} />
      </div>
      <h1 className="mt-5 text-2xl font-semibold text-text">How can I help you today?</h1>
      <p className="mt-2 max-w-sm text-sm text-text-muted">
        Ask a question, paste some code, or pick a starting point below.
      </p>
      <div className="mt-8 grid w-full max-w-lg grid-cols-1 gap-2.5 sm:grid-cols-2">
        {SUGGESTIONS.map(({ icon: Icon, text }) => (
          <button
            key={text}
            type="button"
            onClick={() => onSuggestion(text)}
            className="flex items-start gap-2.5 rounded-chat border border-border bg-bg-secondary px-4 py-3 text-left text-sm text-text transition-colors hover:bg-bg-tertiary"
          >
            <Icon size={16} className="mt-0.5 shrink-0 text-accent" />
            {text}
          </button>
        ))}
      </div>
    </div>
  );
}
