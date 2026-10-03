/** Derives a short fallback title from a user's first message when AI title generation fails. */
export function fallbackTitle(firstMessage: string): string {
  const cleaned = firstMessage.replace(/\s+/g, " ").trim();
  if (cleaned.length <= 48) return cleaned || "New Chat";
  return cleaned.slice(0, 45).trimEnd() + "...";
}
