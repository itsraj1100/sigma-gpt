import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useConversationStore } from "../store/conversationStore";
import { ChatWindow } from "../components/chat/ChatWindow";

export function ChatPage() {
  const { conversationId } = useParams<{ conversationId?: string }>();
  const navigate = useNavigate();
  const currentConversationId = useConversationStore((s) => s.currentConversationId);
  const openConversation = useConversationStore((s) => s.openConversation);
  const newChat = useConversationStore((s) => s.newChat);

  // Keep the store in sync with the URL: open the requested conversation,
  // or reset to the empty "new chat" state on the bare "/" route.
  useEffect(() => {
    if (conversationId && conversationId !== currentConversationId) {
      openConversation(conversationId);
    } else if (!conversationId && currentConversationId) {
      newChat();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  // Once a lazily-created conversation gets an id (first message sent from
  // the empty state), push it into the URL so refresh/back-button work.
  useEffect(() => {
    if (currentConversationId && !conversationId) {
      navigate(`/chat/${currentConversationId}`, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentConversationId]);

  return <ChatWindow />;
}
