import { useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { Link, Navigate, useSearchParams } from "react-router-dom";

import { supabase } from "../../lib/supabase";
import useAuth from "../../hooks/useAuth";
import { safeRedirect } from "../../utils/redirect";

import AuthShell from "../../components/auth/AuthShell";
import {
  inputClass,
  labelClass,
  primaryButtonClass,
} from "../../components/auth/authStyles";

const Login = () => {
  const [params] = useSearchParams();
  const redirect = safeRedirect(params.get("redirect"));

  const { user, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /*
   * Already signed in, or just signed in: AuthContext updates
   * `user`, and this redirect takes over.
   */
  if (!loading && user) {
    return <Navigate to={redirect} replace />;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (submitting) return;

    setError(null);

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setSubmitting(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (signInError) {
      setError(
        signInError.message.toLowerCase().includes("not confirmed")
          ? "Please confirm your email first. Check your inbox for the link."
          : "Invalid email or password."
      );
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to access your courses and certificates."
      footer={
        <>
          New here?{" "}
          <Link
            to={`/signup${redirect !== "/my-courses" ? `?redirect=${encodeURIComponent(redirect)}` : ""}`}
            className="font-semibold text-blue-600 hover:underline dark:text-cyan-400"
          >
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300"
          >
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label htmlFor="email" className={labelClass}>
            Email
          </label>

          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={submitting}
            className={inputClass}
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label
              htmlFor="password"
              className="text-sm font-semibold text-slate-700 dark:text-slate-300"
            >
              Password
            </label>

            <Link
              to="/forgot-password"
              className="text-xs font-medium text-blue-600 hover:underline dark:text-cyan-400"
            >
              Forgot password?
            </Link>
          </div>

          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={submitting}
            className={inputClass}
          />
        </div>

        <button type="submit" disabled={submitting} className={primaryButtonClass}>
          {submitting && <Loader2 size={18} className="animate-spin" />}
          {submitting ? "Logging in..." : "Log In"}
        </button>
      </form>
    </AuthShell>
  );
};

export default Login;