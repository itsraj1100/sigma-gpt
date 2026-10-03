import { useEffect, useRef, useState } from "react";

const BOTTOM_THRESHOLD_PX = 80;

/**
 * Keeps a scroll container pinned to the bottom while `dependency`
 * changes (e.g. new streamed tokens arriving), but stops doing so as
 * soon as the user manually scrolls up - and resumes once they
 * scroll back near the bottom themselves.
 */
export function useAutoScroll<T extends HTMLElement>(dependency: unknown) {
  const containerRef = useRef<T>(null);
  const [isPinnedToBottom, setIsPinnedToBottom] = useState(true);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function handleScroll() {
      if (!el) return;
      const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      setIsPinnedToBottom(distanceFromBottom < BOTTOM_THRESHOLD_PX);
    }

    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !isPinnedToBottom) return;
    el.scrollTop = el.scrollHeight;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dependency, isPinnedToBottom]);

  return containerRef;
}
