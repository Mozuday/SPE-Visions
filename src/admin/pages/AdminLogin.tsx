import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { supabase } from "../../lib/supabase";
import useAuth from "../../hooks/useAuth";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { user, profile, isAdmin, loading: authLoading, signOut } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState<string | null>(null);

  /*
   * Once AuthContext resolves the profile after sign-in, decide
   * what to do — this runs instead of a second manual role check
   * inside handleSubmit.
   */
  
useEffect(() => {
  if (!submitting || authLoading) return;

  if (!user) return;

  if (isAdmin) {
    navigate("/admin", { replace: true });
    return;
  }

  if (profile) {
    signOut();
    setError("This account does not have admin access.");
    setSubmitting(false);
  }
}, [submitting, authLoading, user, isAdmin, profile, navigate, signOut]);

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

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (authError) {
      setError("Invalid email or password.");
      setSubmitting(false);
      return;
    }

    /*
     * Successful sign-in triggers AuthContext's onAuthStateChange
     * listener, which fetches the profile — the useEffect above
     * picks up the result and navigates or rejects accordingly.
     */
  };

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);

    if (error) {
      setError(null);
    }
  };

  const handlePasswordChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPassword(event.target.value);

    if (error) {
      setError(null);
    }
  };

  const loading = submitting || (submitting && authLoading);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-5 py-12 dark:bg-slate-950">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            SPE <span className="text-cyan-500">Visions</span>
          </h1>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Administration Panel
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-200/50 sm:p-8 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20">
          {/* Header */}
          <div className="mb-8">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400">
              <LockKeyhole size={26} />
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Welcome Back
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Sign in to manage your SPE Visions platform.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div
              role="alert"
              aria-live="polite"
              className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400"
            >
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="admin-email"
                className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Email Address
              </label>

              <div className="relative">
                <Mail
                  size={19}
                  aria-hidden="true"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="admin-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="admin@example.com"
                  required
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-300 bg-white py-3.5 pl-11 pr-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="admin-password"
                className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={19}
                  aria-hidden="true"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="admin-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-300 bg-white py-3.5 pl-11 pr-12 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  disabled={loading}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed dark:hover:bg-slate-800 dark:hover:text-slate-300"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3.5 font-semibold text-white transition hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:focus:ring-offset-slate-900"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight
                    size={18}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Authorized administrators only.
        </p>
      </div>
    </main>
  );
};

export default AdminLogin;