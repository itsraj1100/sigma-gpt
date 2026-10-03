import { Conversation } from "../types";

export type ConversationGroupLabel = "Today" | "Yesterday" | "Previous 7 Days" | "Older";

const GROUP_ORDER: ConversationGroupLabel[] = ["Today", "Yesterday", "Previous 7 Days", "Older"];

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function groupLabelFor(updatedAt: string, now: Date): ConversationGroupLabel {
  const date = new Date(updatedAt);
  const dayDiff = Math.round((startOfDay(now) - startOfDay(date)) / 86_400_000);

  if (dayDiff <= 0) return "Today";
  if (dayDiff === 1) return "Yesterday";
  if (dayDiff <= 7) return "Previous 7 Days";
  return "Older";
}

/** Buckets conversations into ChatGPT-style recency groups, most recent group first. */
export function groupConversationsByRecency(
  conversations: Conversation[]
): Array<{ label: ConversationGroupLabel; items: Conversation[] }> {
  const now = new Date();
  const buckets = new Map<ConversationGroupLabel, Conversation[]>();

  for (const conversation of conversations) {
    const label = groupLabelFor(conversation.updatedAt, now);
    if (!buckets.has(label)) buckets.set(label, []);
    buckets.get(label)!.push(conversation);
  }

  return GROUP_ORDER.filter((label) => buckets.has(label)).map((label) => ({
    label,
    items: buckets.get(label)!,
  }));
}
