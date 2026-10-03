import { useNavigate } from "react-router-dom";
import { useConversationStore } from "../../store/conversationStore";
import { useUiStore } from "../../store/uiStore";
import { NewChatButton } from "./NewChatButton";
import { SearchBar } from "./SearchBar";
import { ConversationList } from "./ConversationList";
import { ProfileMenu } from "./ProfileMenu";

export function Sidebar() {
  const navigate = useNavigate();
  const closeMobileSidebar = useUiStore((s) => s.closeMobileSidebar);
  const {
    conversations,
    isLoadingConversations,
    currentConversationId,
    searchResults,
    isSearching,
    newChat,
    openConversation,
    search,
    clearSearch,
  } = useConversationStore();

  function handleNewChat() {
    newChat();
    navigate("/");
    closeMobileSidebar();
  }

  function handleOpen(id: string) {
    openConversation(id);
    navigate(`/chat/${id}`);
    closeMobileSidebar();
  }

  const isSearchActive = searchResults !== null;

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col gap-3 border-r border-border bg-bg-secondary p-3">
      <NewChatButton onClick={handleNewChat} />
      <SearchBar onSearch={search} onClear={clearSearch} />

      <div className="flex-1 overflow-y-auto pr-1">
        {isSearchActive ? (
          <ConversationList
            conversations={searchResults ?? []}
            isLoading={isSearching}
            activeId={currentConversationId}
            onOpen={handleOpen}
            emptyLabel="No matching conversations"
          />
        ) : (
          <ConversationList
            conversations={conversations}
            isLoading={isLoadingConversations}
            activeId={currentConversationId}
            onOpen={handleOpen}
          />
        )}
      </div>

      <ProfileMenu />
    </aside>
  );
}
