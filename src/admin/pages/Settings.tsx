import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  KeyRound,
  Loader2,
  Mail,
  ShieldCheck,
  User,
} from "lucide-react";

import { supabase } from "../../lib/supabase";
import useAuth from "../../hooks/useAuth";

const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white";

const labelClass =
  "mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300";

type Message = { type: "success" | "error"; text: string } | null;

const Notice = ({ message }: { message: Message }) => {
  if (!message) return null;

  const isSuccess = message.type === "success";

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 rounded-xl border p-3.5 text-sm ${
        isSuccess
          ? "border-green-200 bg-green-50 text-green-700 dark:border-green-900/50 dark:bg-green-950/30 dark:text-green-300"
          : "border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300"
      }`}
    >
      {isSuccess ? (
        <CheckCircle size={18} className="mt-0.5 shrink-0" />
      ) : (
        <AlertCircle size={18} className="mt-0.5 shrink-0" />
      )}

      <span>{message.text}</span>
    </div>
  );
};

const Settings = () => {
  const { user, profile, refreshProfile } = useAuth();

  // Profile
  const [fullName, setFullName] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<Message>(null);

  // Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<Message>(null);

  /*
   * Fill the name field once the profile has loaded.
   */
  useEffect(() => {
    setFullName(profile?.full_name ?? "");
  }, [profile?.full_name]);

  // =========================================================
  // Profile
  // =========================================================

  const handleProfileSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!user || savingProfile) return;

    setProfileMessage(null);

    const name = fullName.trim();

    if (name.length < 2) {
      setProfileMessage({
        type: "error",
        text: "Please enter your name (at least 2 characters).",
      });
      return;
    }

    try {
      setSavingProfile(true);

      const { error } = await supabase
        .from("profiles")
        .update({ full_name: name })
        .eq("id", user.id);

      if (error) {
        throw error;
      }

      await refreshProfile();

      setProfileMessage({ type: "success", text: "Profile updated." });
    } catch (err) {
      console.error("Failed to update profile:", err);

      setProfileMessage({
        type: "error",
        text: "Couldn't update your profile. Please try again.",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  // =========================================================
  // Password
  // =========================================================

  const handlePasswordSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!user?.email || savingPassword) return;

    setPasswordMessage(null);

    if (!currentPassword) {
      setPasswordMessage({
        type: "error",
        text: "Please enter your current password.",
      });
      return;
    }

    if (newPassword.length < 8) {
      setPasswordMessage({
        type: "error",
        text: "New password must be at least 8 characters.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({
        type: "error",
        text: "New password and confirmation don't match.",
      });
      return;
    }

    if (newPassword === currentPassword) {
      setPasswordMessage({
        type: "error",
        text: "Choose a password different from your current one.",
      });
      return;
    }

    try {
      setSavingPassword(true);

      /*
       * Confirm the current password first, so someone at an
       * unlocked, logged-in computer can't silently change it.
       */
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (verifyError) {
        setPasswordMessage({
          type: "error",
          text: "Your current password is incorrect.",
        });
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        throw updateError;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setPasswordMessage({
        type: "success",
        text: "Password changed successfully.",
      });
    } catch (err) {
      console.error("Failed to change password:", err);

      setPasswordMessage({
        type: "error",
        text: "Couldn't change your password. Please try again.",
      });
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Settings
        </h1>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Manage your admin account.
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile */}
        <form
          onSubmit={handleProfileSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-100 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400">
              <User size={20} />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white">
                Profile
              </h2>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                How your name appears in the admin panel
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <Notice message={profileMessage} />

            <div>
              <label className={labelClass}>Email</label>

              <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-950">
                <Mail size={16} className="text-slate-400" />

                <span className="text-sm text-slate-700 dark:text-slate-300">
                  {user?.email ?? "Loading..."}
                </span>
              </div>

              <p className="mt-2 text-xs text-slate-500">
                Your login email can't be changed here.
              </p>
            </div>

            <div>
              <label htmlFor="full-name" className={labelClass}>
                Full name
              </label>

              <input
                id="full-name"
                type="text"
                autoComplete="name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Your name"
                disabled={savingProfile}
                className={inputClass}
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={savingProfile}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingProfile && (
                  <Loader2 size={18} className="animate-spin" />
                )}
                {savingProfile ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </div>
        </form>

        {/* Password */}
        <form
          onSubmit={handlePasswordSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400">
              <KeyRound size={20} />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white">
                Change password
              </h2>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Use a long, unique password
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <Notice message={passwordMessage} />

            <div>
              <label htmlFor="current-password" className={labelClass}>
                Current password
              </label>

              <input
                id="current-password"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                disabled={savingPassword}
                className={inputClass}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="new-password" className={labelClass}>
                  New password
                </label>

                <input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  disabled={savingPassword}
                  className={inputClass}
                />

                <p className="mt-2 text-xs text-slate-500">
                  At least 8 characters.
                </p>
              </div>

              <div>
                <label htmlFor="confirm-password" className={labelClass}>
                  Confirm new password
                </label>

                <input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  disabled={savingPassword}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={savingPassword}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingPassword && (
                  <Loader2 size={18} className="animate-spin" />
                )}
                {savingPassword ? "Updating..." : "Change Password"}
              </button>
            </div>
          </div>
        </form>

        {/* Security note */}
        <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          <ShieldCheck
            size={20}
            className="mt-0.5 shrink-0 text-cyan-600 dark:text-cyan-400"
          />

          <p>
            Admin permissions are managed in the database and can't be changed
            from this page. To add another administrator, create the user in
            Supabase and set their role there.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;