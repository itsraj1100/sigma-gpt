# Frontend — ChatGPT Clone

React + TypeScript + Vite + Tailwind CSS single-page app.

See the [root README](../README.md) for full setup instructions. Quick start from this folder:

```bash
cp .env.example .env       # set VITE_API_BASE_URL
npm install
npm run dev                 # http://localhost:5173
```

## Layout

```
src/
├── api/           axios client + one module per resource, plus the SSE streaming client
├── components/
│   ├── layout/    AppLayout, MobileSidebar, ProtectedRoute
│   ├── sidebar/   NewChatButton, SearchBar, ConversationList/Item, ProfileMenu
│   ├── chat/      ChatWindow, MessageList, User/AssistantMessage, ChatInput, CodeBlock, ...
│   └── common/    LoadingIndicator, ErrorMessage, ConfirmDialog, ThemeToggle
├── pages/         LoginPage, RegisterPage, ChatPage
├── store/         Zustand stores: auth, conversation (the big one), theme, ui
├── hooks/         useAutoScroll, useDebounce
└── types/, utils/
```

State is intentionally centralized in `store/conversationStore.ts` - it owns the conversation list, the open conversation's messages, and the streaming lifecycle (send / regenerate / edit / stop), so components stay presentational.
