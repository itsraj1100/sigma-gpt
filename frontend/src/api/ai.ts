import { API_BASE_URL } from "./client";

export interface ChatRequestBody {
  content?: string;
  regenerate?: boolean;
  editMessageId?: string;
}

export interface ChatStreamCallbacks {
  onDelta: (delta: string) => void;
  onDone: (messageId: string | null) => void;
  onError: (message: string) => void;
}

/**
 * Streams an AI reply over Server-Sent Events using fetch + a readable
 * stream reader (rather than the EventSource API), because this needs
 * to be a POST request with a JSON body and an AbortSignal for the
 * "stop generating" button - EventSource supports neither.
 */
export async function streamChat(
  conversationId: string,
  body: ChatRequestBody,
  callbacks: ChatStreamCallbacks,
  signal: AbortSignal
): Promise<void> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/chat`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal,
    });
  } catch (err) {
    if ((err as Error).name === "AbortError") return;
    callbacks.onError("Can't reach the server. Check your connection and try again.");
    return;
  }

  if (!response.ok || !response.body) {
    try {
      const json = await response.json();
      callbacks.onError(json?.error?.message ?? "Something went wrong. Please try again.");
    } catch {
      callbacks.onError("Something went wrong. Please try again.");
    }
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split("\n\n");
      buffer = events.pop() ?? "";

      for (const rawEvent of events) {
        const lines = rawEvent.split("\n");
        let eventName = "message";
        let dataLine = "";

        for (const line of lines) {
          if (line.startsWith("event:")) eventName = line.slice("event:".length).trim();
          if (line.startsWith("data:")) dataLine = line.slice("data:".length).trim();
        }
        if (!dataLine) continue;

        const payload = JSON.parse(dataLine);

        if (eventName === "done") {
          callbacks.onDone(payload.messageId ?? null);
        } else if (eventName === "error") {
          callbacks.onError(payload.message ?? "Something went wrong. Please try again.");
        } else if (payload.delta) {
          callbacks.onDelta(payload.delta as string);
        }
      }
    }
  } catch (err) {
    if ((err as Error).name !== "AbortError") {
      callbacks.onError("The connection was interrupted. Please try again.");
    }
  }
}
