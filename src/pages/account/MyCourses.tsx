import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Clock3,
  Loader2,
  LogOut,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { supabase } from "../../lib/supabase";
import useAuth from "../../hooks/useAuth";
import type { Tables } from "../../types/supabase";
import { formatDate } from "../../utils/formatters";

import Badge from "../../components/ui/Badge";
import Container from "../../components/ui/Container";
import EmptyState from "../../components/ui/EmptyState";
import Eyebrow from "../../components/ui/Eyebrow";

type Enrollment = Tables<"enrollments"> & {
  courses: Pick<
    Tables<"courses">,
    "title" | "slug" | "thumbnail_url" | "duration" | "level"
  > | null;
};

const MyCourses = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("enrollments")
        .select("*, courses(title, slug, thumbnail_url, duration, level)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!mounted) return;

      if (fetchError) {
        console.error("Failed to load enrollments:", fetchError);
        setError("Couldn't load your courses. Please try again.");
      } else {
        setEnrollments((data ?? []) as unknown as Enrollment[]);
      }

      setLoading(false);
    };

    void load();

    return () => {
      mounted = false;
    };
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    navigate("/", { replace: true });
  };

  const name = profile?.full_name || user?.email?.split("@")[0] || "there";

  return (
    <main>
      <Container className="py-12 md:py-16">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <Eyebrow label="SPE Academy" />

            <h1 className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">
              Welcome, {name}
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {user?.email}
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 self-start rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900"
          >
            <LogOut size={15} />
            Log out
          </button>
        </div>

        <h2 className="mb-5 mt-12 text-xl font-semibold text-slate-900 dark:text-white">
          My courses
        </h2>

        {loading && (
          <div className="flex items-center justify-center gap-3 py-12 text-slate-500">
            <Loader2 size={22} className="animate-spin" />
            Loading your courses...
          </div>
        )}

        {!loading && error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        {!loading && !error && enrollments.length === 0 && (
          <div>
            <EmptyState
              icon={BookOpen}
              message="You haven't enrolled in a course yet."
            />

            <div className="mt-6 text-center">
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-400"
              >
                Browse courses
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        )}

        {!loading && !error && enrollments.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {enrollments.map((enrollment) =>
              enrollment.courses ? (
                <article
                  key={enrollment.id}
                  data-spotlight
                  className="spotlight group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-200 hover:-translate-y-1 hover:border-brand-400 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-500/60"
                >
                  <div className="h-36 overflow-hidden border-b border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-800">
                    {enrollment.courses.thumbnail_url ? (
                      <img
                        src={enrollment.courses.thumbnail_url}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-300 dark:text-slate-600">
                        <BookOpen size={28} />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex flex-wrap gap-1.5">
                      <Badge>
                        <Clock3 size={12} />
                        {enrollment.courses.duration}
                      </Badge>

                      {enrollment.courses.level && (
                        <Badge tone="brand">{enrollment.courses.level}</Badge>
                      )}
                    </div>

                    <h3 className="mt-3 font-semibold text-slate-900 dark:text-white">
                      {enrollment.courses.title}
                    </h3>

                    <p className="mt-1 font-mono text-xs text-slate-400">
                      Enrolled {formatDate(enrollment.created_at)}
                    </p>

                    <Link
                      to={`/learn/${enrollment.courses.slug}`}
                      className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-brand-600 after:absolute after:inset-0 after:content-[''] dark:text-brand-400"
                    >
                      Continue learning
                      <ArrowRight size={15} />
                    </Link>
                  </div>
                </article>
              ) : null
            )}
          </div>
        )}
      </Container>
    </main>
  );
};

export default MyCourses;