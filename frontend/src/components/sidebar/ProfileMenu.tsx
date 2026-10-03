import { useState } from "react";
import { LogOut, User as UserIcon } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { ConfirmDialog } from "../common/ConfirmDialog";
import { ThemeToggle } from "../common/ThemeToggle";

export function ProfileMenu() {
  const { user, logout } = useAuthStore();
  const [confirmingLogout, setConfirmingLogout] = useState(false);

  return (
    <div className="flex items-center gap-2 border-t border-border pt-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-accent-contrast">
        <UserIcon size={15} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-text">{user?.name}</p>
        <p className="truncate text-xs text-text-muted">{user?.email}</p>
      </div>
      <ThemeToggle />
      <button
        type="button"
        onClick={() => setConfirmingLogout(true)}
        aria-label="Log out"
        title="Log out"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-bg-tertiary hover:text-text"
      >
        <LogOut size={16} />
      </button>

      <ConfirmDialog
        open={confirmingLogout}
        title="Log out?"
        description="You'll need to sign in again to see your conversations."
        confirmLabel="Log out"
        onCancel={() => setConfirmingLogout(false)}
        onConfirm={() => {
          setConfirmingLogout(false);
          logout();
        }}
      />
    </div>
  );
}
