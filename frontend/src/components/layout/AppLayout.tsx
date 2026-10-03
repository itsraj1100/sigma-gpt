import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Menu, SquarePen } from "lucide-react";
import { useUiStore } from "../../store/uiStore";
import { useConversationStore } from "../../store/conversationStore";
import { Sidebar } from "../sidebar/Sidebar";
import { MobileSidebar } from "./MobileSidebar";

export function AppLayout() {
  const openMobileSidebar = useUiStore((s) => s.openMobileSidebar);
  const newChat = useConversationStore((s) => s.newChat);
  const loadConversations = useConversationStore((s) => s.loadConversations);
  const navigate = useNavigate();

  useEffect(() => {
    loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-bg">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <MobileSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border px-3 py-2.5 md:hidden">
          <button
            type="button"
            onClick={openMobileSidebar}
            aria-label="Open menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-text hover:bg-bg-tertiary"
          >
            <Menu size={19} />
          </button>
          <span className="text-sm font-semibold text-text">Chat</span>
          <button
            type="button"
            onClick={() => {
              newChat();
              navigate("/");
            }}
            aria-label="New chat"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-text hover:bg-bg-tertiary"
          >
            <SquarePen size={17} />
          </button>
        </header>

        <main className="min-h-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
