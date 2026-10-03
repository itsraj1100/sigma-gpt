import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, Sparkles } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { extractErrorMessage } from "../api/client";
import { ErrorMessage } from "../components/common/ErrorMessage";

export function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-accent-contrast">
            <Sparkles size={20} />
          </div>
          <h1 className="mt-4 text-xl font-semibold text-text">Welcome back</h1>
          <p className="mt-1 text-sm text-text-muted">Log in to continue your conversations.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-text">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg-secondary px-3.5 py-2.5 text-sm text-text focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-text">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg-secondary px-3.5 py-2.5 text-sm text-text focus:border-accent focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-accent-contrast transition-colors hover:bg-accent-hover disabled:opacity-60"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" /> Logging in...
              </span>
            ) : (
              "Log in"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-text-muted">
          Don't have an account?{" "}
          <Link to="/register" className="font-medium text-accent hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
