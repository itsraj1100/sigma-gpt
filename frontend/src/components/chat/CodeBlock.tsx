import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Check, Copy } from "lucide-react";
import { useThemeStore } from "../../store/themeStore";

interface CodeBlockProps {
  language: string;
  code: string;
}

export function CodeBlock({ language, code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const theme = useThemeStore((s) => s.theme);

  async function handleCopy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="my-1 overflow-hidden rounded-lg border border-border">
      <div className="flex items-center justify-between bg-bg-tertiary px-3.5 py-1.5">
        <span className="font-mono text-xs text-text-muted">{language || "text"}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded px-1.5 py-0.5 text-xs text-text-muted transition-colors hover:bg-bg hover:text-text"
        >
          {copied ? (
            <>
              <Check size={13} /> Copied
            </>
          ) : (
            <>
              <Copy size={13} /> Copy
            </>
          )}
        </button>
      </div>
      <SyntaxHighlighter
        language={language || "text"}
        style={theme === "dark" ? vscDarkPlus : oneLight}
        customStyle={{
          margin: 0,
          padding: "0.9rem",
          fontSize: "0.85rem",
          background: "rgb(var(--color-bg-secondary))",
        }}
        wrapLongLines
      >
        {code.replace(/\n$/, "")}
      </SyntaxHighlighter>
    </div>
  );
}
