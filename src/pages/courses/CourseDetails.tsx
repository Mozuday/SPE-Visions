import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  Loader2,
  Lock,
  PlayCircle,
} from "lucide-react";

import { supabase } from "../../lib/supabase";
import useAuth from "../../hooks/useAuth";
import type { Tables, ViewRows } from "../../types/supabase";

import Badge from "../../components/ui/Badge";
import Blueprint from "../../components/ui/Blueprint";
import Container from "../../components/ui/Container";
import Eyebrow from "../../components/ui/Eyebrow";
import Reveal from "../../components/effects/Reveal";

type Course = Tables<"courses">;
type Lesson = ViewRows<"course_lessons">;

const formatDuration = (totalSeconds: number | null): string => {
  if (totalSeconds == null) return "";

  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const ss = String(s).padStart(2, "0");

  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${ss}` : `${m}:${ss}`;
};

const buttonClass =
  "mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-400";

const included = [
  "Complete course content",
  "Practical project-based learning",
  "Access to every lesson video",
  "Verifiable completion certificate",
];

const CourseDetails = () => {
  // Route param is still named "courseId" in AppRoutes, but we
  // look the course up by its slug.
  const { courseId: slug } = useParams<{ courseId: string }>();
  const { user, loading: authLoading } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [enrolled, setEnrolled] = useState(false);

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // =========================================================
  // Course + lessons (lessons come from the safe view: no URLs)
  // =========================================================

  useEffect(() => {
    let mounted = true;

    const loadCourse = async () => {
      if (!slug) return;

      setLoading(true);
      setError(null);
      setNotFound(false);

      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();

      if (!mounted) return;

      if (courseError || !courseData) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setCourse(courseData);

      const { data: lessonData, error: lessonError } = await supabase
        .from("course_lessons")
        .select("*")
        .eq("course_id", courseData.id)
        .order("order_index", { ascending: true });

      if (!mounted) return;

      if (lessonError) {
        console.error("Failed to load lessons:", lessonError);
        setError("Some course content couldn't be loaded.");
      } else {
        setLessons(lessonData ?? []);
      }

      setLoading(false);
    };

    void loadCourse();

    return () => {
      mounted = false;
    };
  }, [slug]);

  // =========================================================
  // Does this student already own the course?
  // =========================================================

  useEffect(() => {
    if (!user || !course) {
      setEnrolled(false);
      return;
    }

    let mounted = true;

    const checkEnrollment = async () => {
      const { data } = await supabase
        .from("enrollments")
        .select("id")
        .eq("user_id", user.id)
        .eq("course_id", course.id)
        .maybeSingle();

      if (mounted) {
        setEnrolled(Boolean(data));
      }
    };

    void checkEnrollment();

    return () => {
      mounted = false;
    };
  }, [user, course]);

  // =========================================================
  // States
  // =========================================================

  if (loading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
          <Loader2 size={24} className="animate-spin" />
          Loading course...
        </div>
      </main>
    );
  }

  if (notFound || !course) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center px-6">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg border border-slate-200 text-slate-400 dark:border-slate-700">
            <BookOpen size={22} />
          </div>

          <h1 className="mt-5 text-2xl font-semibold text-slate-900 dark:text-white">
            Course not found
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
            This course doesn't exist or may have been removed.
          </p>

          <Link
            to="/courses"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400"
          >
            <ArrowLeft size={16} />
            Back to courses
          </Link>
        </div>
      </main>
    );
  }

  // =========================================================
  // Course
  // =========================================================

  const isFree = course.price == null || course.price === 0;
  const hasAccess = enrolled || (Boolean(user) && isFree);

  const returnTo = encodeURIComponent(`/courses/${course.slug}`);
  const loginPath = `/login?redirect=${returnTo}`;
  const signupPath = `/signup?redirect=${returnTo}`;

  /*
   * One place decides what the main button does.
   */
  const renderAction = () => {
    if (authLoading) {
      return (
        <div className="mt-6 flex justify-center text-slate-400">
          <Loader2 size={20} className="animate-spin" />
        </div>
      );
    }

    if (hasAccess) {
      return (
        <Link to={`/learn/${course.slug}`} className={buttonClass}>
          {enrolled ? "Continue learning" : "Start learning"}
          <ArrowRight size={16} />
        </Link>
      );
    }

    if (!user) {
      return (
        <>
          <Link to={isFree ? signupPath : loginPath} className={buttonClass}>
            {isFree ? "Sign up to start free" : "Log in to enroll"}
            <ArrowRight size={16} />
          </Link>

          <p className="mt-4 text-center text-xs text-slate-500">
            Already have an account?{" "}
            <Link to={loginPath} className="underline">
              Log in
            </Link>
          </p>
        </>
      );
    }

    // Logged in, paid course: online payment arrives with Razorpay
    return (
      <>
        <Link to="/contact" className={buttonClass}>
          Enroll now
          <ArrowRight size={16} />
        </Link>

        <p className="mt-4 text-center text-xs text-slate-500">
          Online payment is coming soon. Contact us to enroll for now.
        </p>
      </>
    );
  };

  return (
    <main className="relative">
      {/* Background grid behind the top of the page */}
      <div className="bg-hero-glow absolute inset-x-0 top-0 h-[420px] overflow-hidden">
        <Blueprint />
      </div>

      <Container className="relative py-10 md:py-14">
        <Link
          to="/courses"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          <ArrowLeft size={15} />
          All courses
        </Link>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_340px]">
          {/* Left column */}
          <div>
            <Reveal>
              <Eyebrow label="SPE Academy" />

              <h1 className="mt-3 text-4xl font-semibold leading-[1.1] text-slate-950 md:text-5xl dark:text-white">
                {course.title}
              </h1>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-400">
                {course.description}
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                <Badge>
                  <Clock3 size={12} />
                  {course.duration}
                </Badge>

                {course.level && <Badge tone="brand">{course.level}</Badge>}

                <Badge>
                  <PlayCircle size={12} />
                  {lessons.length} lesson{lessons.length === 1 ? "" : "s"}
                </Badge>
              </div>
            </Reveal>

            {/* Curriculum */}
            <div className="mt-14">
              <Eyebrow label="Curriculum" />

              <h2 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">
                What you'll learn
              </h2>

              {error && (
                <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  {error}
                </div>
              )}

              {lessons.length === 0 ? (
                <div className="mt-6 rounded-xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  Lessons for this course will be added soon.
                </div>
              ) : (
                <ol className="mt-6 divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
                  {lessons.map((lesson, index) => (
                    <li
                      key={lesson.id}
                      className="flex items-center gap-4 px-5 py-4"
                    >
                      <span className="tabular w-6 shrink-0 font-mono text-xs text-slate-400">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <span className="flex-1 text-sm font-medium text-slate-900 dark:text-white">
                        {lesson.title}
                      </span>

                      {lesson.duration != null && (
                        <span className="tabular font-mono text-xs text-slate-500 dark:text-slate-400">
                          {formatDuration(lesson.duration)}
                        </span>
                      )}

                      {!hasAccess && (
                        <Lock size={15} className="shrink-0 text-slate-400" />
                      )}
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>

          {/* Sticky enrol card */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-slate-400">
                Course fee
              </p>

              <p className="tabular mt-2 font-mono text-4xl font-semibold text-slate-900 dark:text-white">
                {isFree ? "Free" : `₹${course.price}`}
              </p>

              {renderAction()}

              <ul className="mt-6 space-y-3 border-t border-slate-200 pt-6 dark:border-slate-800">
                {included.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300"
                  >
                    <CheckCircle2
                      size={17}
                      className="mt-0.5 shrink-0 text-brand-600 dark:text-brand-400"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </Container>
    </main>
  );
};

export default CourseDetails;