import { useState } from "react";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { Link, Navigate, useSearchParams } from "react-router-dom";

import { supabase } from "../../lib/supabase";
import useAuth from "../../hooks/useAuth";
import { isValidEmail } from "../../utils/validators";
import { safeRedirect } from "../../utils/redirect";

import AuthShell from "../../components/auth/AuthShell";
import {
  inputClass,
  labelClass,
  primaryButtonClass,
} from "../../components/auth/authStyles";

const Signup = () => {
  const [params] = useSearchParams();
  const redirect = safeRedirect(params.get("redirect"));

  const { user, loading } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  if (!loading && user) {
    return <Navigate to={redirect} replace />;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (submitting) return;

    setError(null);

    const name = fullName.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (name.length < 2) {
      setError("Please enter your full name.");
      return;
    }

    if (!isValidEmail(normalizedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setSubmitting(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });

    if (signUpError) {
      setError(
        signUpError.message.toLowerCase().includes("rate")
          ? "Too many attempts. Please wait a few minutes and try again."
          : "Couldn't create your account. Please try again."
      );
      setSubmitting(false);
      return;
    }

    /*
     * Supabase returns an empty identities list (instead of an
     * error) when the email is already registered.
     */
    if (data.user && data.user.identities?.length === 0) {
      setError("This email is already registered. Try logging in instead.");
      setSubmitting(false);
      return;
    }

    /*
     * With "Confirm email" on, there is no session yet.
     * With it off, the session exists and the redirect above runs.
     */
    if (!data.session) {
      setNeedsConfirmation(true);
    }

    setSubmitting(false);
  };

  if (needsConfirmation) {
    return (
      <AuthShell
        title="Check your email"
        subtitle="We sent a confirmation link to finish creating your account."
        footer={
          <Link
            to="/login"
            className="font-semibold text-blue-600 hover:underline dark:text-cyan-400"
          >
            Back to log in
          </Link>
        }
      >
        <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700 dark:border-green-900/50 dark:bg-green-950/30 dark:text-green-300">
          <CheckCircle size={18} className="mt-0.5 shrink-0" />
          <span>
            Open the link we sent to <strong>{email.trim()}</strong>, then log
            in. Check your spam folder if you don't see it.
          </span>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Sign up to buy courses, track progress and get certificates."
      footer={
        <>
          Already have an account?{" "}
          <Link
            to={`/login${redirect !== "/my-courses" ? `?redirect=${encodeURIComponent(redirect)}` : ""}`}
            className="font-semibold text-blue-600 hover:underline dark:text-cyan-400"
          >
            Log in
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
          <label htmlFor="name" className={labelClass}>
            Full name
          </label>

          <input
            id="name"
            type="text"
            autoComplete="name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            disabled={submitting}
            className={inputClass}
          />
        </div>

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
          <label htmlFor="password" className={labelClass}>
            Password
          </label>

          <input
            id="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={submitting}
            className={inputClass}
          />

          <p className="mt-2 text-xs text-slate-500">At least 8 characters.</p>
        </div>

        <div>
          <label htmlFor="confirm" className={labelClass}>
            Confirm password
          </label>

          <input
            id="confirm"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            disabled={submitting}
            className={inputClass}
          />
        </div>

        <button type="submit" disabled={submitting} className={primaryButtonClass}>
          {submitting && <Loader2 size={18} className="animate-spin" />}
          {submitting ? "Creating account..." : "Create Account"}
        </button>

        <p className="text-center text-xs text-slate-500">
          By signing up you agree to our{" "}
          <Link to="/privacy" className="underline">
            Privacy Policy
          </Link>
          .
        </p>
      </form>
    </AuthShell>
  );
};

export default Signup;