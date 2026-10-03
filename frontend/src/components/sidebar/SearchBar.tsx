import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useDebounce } from "../../hooks/useDebounce";

interface SearchBarProps {
  onSearch: (query: string) => void;
  onClear: () => void;
}

export function SearchBar({ onSearch, onClear }: SearchBarProps) {
  const [input, setInput] = useState("");
  const debounced = useDebounce(input, 250);

  useEffect(() => {
    if (debounced.trim()) onSearch(debounced.trim());
    else onClear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  function handleClear() {
    setInput("");
    onClear();
  }

  return (
    <div className="relative">
      <Search
        size={15}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
      />
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Search conversations"
        aria-label="Search conversations"
        className="w-full rounded-lg border border-border bg-bg-tertiary py-2 pl-9 pr-8 text-sm text-text placeholder:text-text-muted focus:border-accent focus:outline-none"
      />
      {input && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-text-muted hover:text-text"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
