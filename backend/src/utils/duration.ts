/** Parses simple duration strings like "7d", "12h", "30m", "45s" into milliseconds. */
export function parseDurationMs(value: string, fallbackMs = 7 * 24 * 60 * 60 * 1000): number {
  const match = /^(\d+)\s*(ms|s|m|h|d)$/.exec(value.trim());
  if (!match) return fallbackMs;

  const amount = parseInt(match[1], 10);
  const unit = match[2];
  const unitMs: Record<string, number> = {
    ms: 1,
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };
  return amount * unitMs[unit];
}
