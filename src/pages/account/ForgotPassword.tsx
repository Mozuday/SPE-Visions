import { useState } from "react";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

import { supabase } from "../../lib/supabase";
import { isValidEmail } from "../../utils/validators";

import AuthShell from "../../components/auth/AuthShell";
import {
  inputClass,
  labelClass,
  primaryButtonClass,
} from "../../components/auth/authStyles";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (submitting) return;

    setError(null);

    const normalizedEmail = email.trim().toLowerCase();

    if (!isValidEmail(normalizedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setSubmitting(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      normalizedEmail,
      { redirectTo: `${window.location.origin}/reset-password` }
    );

    setSubmitting(false);

    if (resetError && resetError.message.toLowerCase().includes("rate")) {
      setError("Too many attempts. Please wait a few minutes and try again.");
      return;
    }

    /*
     * Same message whether or not the email exists, so this form
     * can't be used to discover who has an account.
     */
    setSent(true);
  };

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter your email and we'll send you a reset link."
      footer={
        <Link
          to="/login"
          className="font-semibold text-blue-600 hover:underline dark:text-cyan-400"
        >
          Back to log in
        </Link>
      }
    >
      {sent ? (
        <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700 dark:border-green-900/50 dark:bg-green-950/30 dark:text-green-300">
          <CheckCircle size={18} className="mt-0.5 shrink-0" />
          <span>
            If an account exists for that email, a reset link is on its way.
          </span>
        </div>
      ) : (
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

          <button type="submit" disabled={submitting} className={primaryButtonClass}>
            {submitting && <Loader2 size={18} className="animate-spin" />}
            {submitting ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      )}
    </AuthShell>
  );
};

export default ForgotPassword;