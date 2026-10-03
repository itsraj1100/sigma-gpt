import { useEffect } from "react";
import { X } from "lucide-react";
import { useUiStore } from "../../store/uiStore";
import { Sidebar } from "../sidebar/Sidebar";

export function MobileSidebar() {
  const isOpen = useUiStore((s) => s.isMobileSidebarOpen);
  const close = useUiStore((s) => s.closeMobileSidebar);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex md:hidden">
      <div className="absolute inset-0 bg-black/40" onClick={close} aria-hidden="true" />
      <div className="relative z-50 h-full max-w-[85vw] shadow-xl">
        <Sidebar />
        <button
          type="button"
          onClick={close}
          aria-label="Close menu"
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg bg-bg text-text shadow"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
