import { useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { supabase } from "../../lib/supabase";
import useAuth from "../../hooks/useAuth";

import AuthShell from "../../components/auth/AuthShell";
import {
  inputClass,
  labelClass,
  primaryButtonClass,
} from "../../components/auth/authStyles";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (submitting) return;

    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setSubmitting(true);

    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError("Couldn't update your password. The link may have expired.");
      setSubmitting(false);
      return;
    }

    navigate("/my-courses", { replace: true });
  };

  if (loading) {
    return (
      <AuthShell title="Reset your password" subtitle="Checking your link...">
        <div className="flex justify-center text-slate-500">
          <Loader2 size={24} className="animate-spin" />
        </div>
      </AuthShell>
    );
  }

  /*
   * The emailed link signs the user in temporarily. No session
   * means the link is invalid or expired.
   */
  if (!user) {
    return (
      <AuthShell
        title="Link expired"
        subtitle="This reset link is invalid or has expired."
      >
        <Link to="/forgot-password" className={primaryButtonClass}>
          Request a New Link
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Choose a new password"
      subtitle="Use at least 8 characters."
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
          <label htmlFor="password" className={labelClass}>
            New password
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
        </div>

        <div>
          <label htmlFor="confirm" className={labelClass}>
            Confirm new password
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
          {submitting ? "Saving..." : "Update Password"}
        </button>
      </form>
    </AuthShell>
  );
};

export default ResetPassword;