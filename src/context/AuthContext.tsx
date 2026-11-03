import { createContext, useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";

import { supabase } from "../lib/supabase";

type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: "user" | "admin";
};

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);

type AuthProviderProps = {
  children: ReactNode;
};

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  /*
   * Fetch the profile row for a given user id.
   *
   * This is the single source of truth for role checks across
   * the entire app — AdminLogin, AdminLayout, and anywhere else
   * that needs to know "is this user an admin" all read from here
   * instead of hitting Supabase independently.
   */
  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, role")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Failed to fetch profile:", error);
      setProfile(null);
      return;
    }

    setProfile(data);
  }, []);

  useEffect(() => {
    let mounted = true;

    /*
     * Initial load — check if a session already exists
     * (e.g. page refresh while logged in).
     */
    const init = async () => {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      setSession(currentSession);

      if (currentSession?.user) {
        await fetchProfile(currentSession.user.id);
      }

      if (mounted) {
        setLoading(false);
      }
    };

    void init();

    /*
     * Keep auth state synchronized across tabs and after
     * sign-in / sign-out / token refresh.
     */
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;

      setSession(newSession);

      if (newSession?.user) {
        await fetchProfile(newSession.user.id);
      } else {
        setProfile(null);
      }

      if (event === "SIGNED_OUT" || event === "SIGNED_IN") {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
  };

  /*
   * Re-read the profile after it has been edited (Settings page),
   * so the header and anything else showing the name updates.
   */
  const refreshProfile = useCallback(async () => {
    if (session?.user) {
      await fetchProfile(session.user.id);
    }
  }, [session, fetchProfile]);

  const value: AuthContextValue = {
    session,
    user: session?.user ?? null,
    profile,
    isAdmin: profile?.role === "admin",
    loading,
    signOut,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;