import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { LoadingIndicator } from "../common/LoadingIndicator";

/** Gates authenticated-only routes; redirects to /login if there's no session. */
export function ProtectedRoute() {
  const status = useAuthStore((s) => s.status);
  const init = useAuthStore((s) => s.init);

  useEffect(() => {
    if (status === "idle") init();
  }, [status, init]);

  if (status === "idle" || status === "loading") {
    return (
      <div className="flex h-dvh items-center justify-center bg-bg">
        <LoadingIndicator label="Loading..." />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
