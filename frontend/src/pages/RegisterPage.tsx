import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, Sparkles } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { extractErrorMessage } from "../api/client";
import { ErrorMessage } from "../components/common/ErrorMessage";

function getPasswordIssue(password: string): string | null {
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(password)) return "Password must contain an uppercase letter.";
  if (!/[a-z]/.test(password)) return "Password must contain a lowercase letter.";
  if (!/[0-9]/.test(password)) return "Password must contain a number.";
  return null;
}

export function RegisterPage() {
  const navigate = useNavigate();
  const register = useAuthStore((s) => s.register);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    const passwordIssue = getPasswordIssue(password);
    if (passwordIssue) {
      setError(passwordIssue);
      return;
    }

    setIsSubmitting(true);
    try {
      await register(name, email, password);
      navigate("/");
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-bg px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-accent-contrast">
            <Sparkles size={20} />
          </div>
          <h1 className="mt-4 text-xl font-semibold text-text">Create your account</h1>
          <p className="mt-1 text-sm text-text-muted">Start chatting with the AI assistant.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-text">
              Name
            </label>
            <input
              id="name"
              type="text"
              required
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg-secondary px-3.5 py-2.5 text-sm text-text focus:border-accent focus:outline-none"
            />
          </div>

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
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg-secondary px-3.5 py-2.5 text-sm text-text focus:border-accent focus:outline-none"
            />
            <p className="mt-1.5 text-xs text-text-muted">
              At least 8 characters, with an uppercase letter, a lowercase letter, and a number.
            </p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-text">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
                <Loader2 size={16} className="animate-spin" /> Creating account...
              </span>
            ) : (
              "Sign up"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-text-muted">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-accent hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
