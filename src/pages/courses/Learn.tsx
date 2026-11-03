import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  Award,
  CheckCircle,
  Circle,
  Loader2,
  Lock,
  PlayCircle,
} from "lucide-react";

import { supabase } from "../../lib/supabase";
import useAuth from "../../hooks/useAuth";
import type { Tables } from "../../types/supabase";
import { getYouTubeId } from "../../utils/youtube";

type Course = Tables<"courses">;
type Video = Tables<"course_videos">;

// =========================================================
// YouTube IFrame API (loaded once, only the parts we use)
// =========================================================

type YTPlayer = {
  loadVideoById: (videoId: string) => void;
  stopVideo: () => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlayerState: () => number;
  destroy: () => void;
};

type YTPlayerOptions = {
  videoId?: string;
  host?: string;
  width?: string;
  height?: string;
  playerVars?: Record<string, number>;
  events?: {
    onStateChange?: (event: { data: number }) => void;
  };
};

declare global {
  interface Window {
    YT?: { Player: new (el: HTMLElement, options: YTPlayerOptions) => YTPlayer };
    onYouTubeIframeAPIReady?: () => void;
  }
}

const YT_PLAYING = 1;
const YT_ENDED = 0;

/*
 * A lesson counts as watched once this much of it has played.
 */
const COMPLETE_AT = 0.9;

let apiPromise: Promise<void> | null = null;

const loadYouTubeApi = (): Promise<void> => {
  if (window.YT?.Player) return Promise.resolve();

  if (!apiPromise) {
    apiPromise = new Promise((resolve) => {
      const previous = window.onYouTubeIframeAPIReady;

      window.onYouTubeIframeAPIReady = () => {
        previous?.();
        resolve();
      };

      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(script);
    });
  }

  return apiPromise;
};

const getErrorCode = (err: unknown): string | undefined => {
  if (err && typeof err === "object" && "code" in err) {
    return String((err as { code: unknown }).code);
  }

  return undefined;
};

const formatDuration = (totalSeconds: number | null): string => {
  if (totalSeconds == null) return "";

  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const ss = String(s).padStart(2, "0");

  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${ss}` : `${m}:${ss}`;
};

const Learn = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [currentId, setCurrentId] = useState<string | null>(null);

  // Fraction (0 to 1) of the current lesson watched in this session
  const [watched, setWatched] = useState(0);

  const [status, setStatus] = useState<
    "loading" | "ready" | "denied" | "notfound"
  >("loading");
  const [error, setError] = useState<string | null>(null);
  const [certificate, setCertificate] = useState<string | null>(null);

  // =========================================================
  // Refs: the player's callbacks outlive renders, so they read
  // the latest values from here instead of stale closures.
  // =========================================================

  const hostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const loadedVideoRef = useRef<string | null>(null);
  const completedRef = useRef(completed);
  const videosRef = useRef(videos);
  const currentIdRef = useRef(currentId);
  const onEndedRef = useRef<() => void>(() => {});

  completedRef.current = completed;
  videosRef.current = videos;
  currentIdRef.current = currentId;

  const current = useMemo(
    () => videos.find((video) => video.id === currentId) ?? null,
    [videos, currentId]
  );

  const currentYtId = current ? getYouTubeId(current.video_url) : null;

  // =========================================================
  // Load course, check access, load lessons and progress
  // =========================================================

  useEffect(() => {
    if (!slug || !user) return;

    let mounted = true;

    const load = async () => {
      setStatus("loading");
      setError(null);

      const { data: courseData } = await supabase
        .from("courses")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();

      if (!mounted) return;

      if (!courseData) {
        setStatus("notfound");
        return;
      }

      setCourse(courseData);

      // The database decides: enrolled, free (while logged in), or admin
      const { data: hasAccess } = await supabase.rpc("has_course_access", {
        p_course_id: courseData.id,
      });

      if (!mounted) return;

      if (!hasAccess) {
        setStatus("denied");
        return;
      }

      /*
       * Free course: make sure a real enrollment exists so it
       * shows up in My Courses. Best effort; access already works.
       */
      const isFree = courseData.price == null || courseData.price === 0;

      if (isFree) {
        const { error: enrollError } = await supabase.functions.invoke(
          "enroll-free",
          { body: { courseId: courseData.id } }
        );

        if (enrollError) {
          console.error("Free enrollment failed:", enrollError);
        }
      }

      const [videosRes, progressRes] = await Promise.all([
        supabase
          .from("course_videos")
          .select("*")
          .eq("course_id", courseData.id)
          .eq("is_published", true)
          .order("order_index", { ascending: true }),
        supabase
          .from("lesson_progress")
          .select("video_id")
          .eq("user_id", user.id)
          .eq("course_id", courseData.id),
      ]);

      if (!mounted) return;

      if (videosRes.error) {
        console.error("Failed to load lessons:", videosRes.error);
        setError("Couldn't load the lessons. Please refresh.");
      }

      const lessons = videosRes.data ?? [];
      const done = new Set((progressRes.data ?? []).map((row) => row.video_id));

      setVideos(lessons);
      setCompleted(done);

      // Resume at the first lesson that isn't finished
      setCurrentId(
        (lessons.find((lesson) => !done.has(lesson.id)) ?? lessons[0])?.id ??
          null
      );

      setStatus("ready");
    };

    void load();

    return () => {
      mounted = false;
    };
  }, [slug, user]);

  // =========================================================
  // Progress saving
  // =========================================================

  /*
   * Mark a lesson complete. Safe to call twice: a duplicate row
   * is treated as success. Optionally moves to the next lesson.
   */
  const completeLesson = useCallback(
    async (videoId: string, advance: boolean) => {
      if (!user || !course) return;

      const lessons = videosRef.current;
      const next = new Set(completedRef.current);

      if (!next.has(videoId)) {
        next.add(videoId);
        setCompleted(next);

        const { error: saveError } = await supabase
          .from("lesson_progress")
          .insert({
            user_id: user.id,
            course_id: course.id,
            video_id: videoId,
          });

        // 23505 = already saved, which is fine
        if (saveError && getErrorCode(saveError) !== "23505") {
          console.error("Failed to save progress:", saveError);

          const reverted = new Set(completedRef.current);
          reverted.delete(videoId);
          setCompleted(reverted);
          setError("Couldn't save your progress. Please try again.");
          return;
        }
      }

      if (advance) {
        const index = lessons.findIndex((item) => item.id === videoId);
        const upcoming = lessons[index + 1];

        if (upcoming) {
          setCurrentId(upcoming.id);
        }
      }
    },
    [user, course]
  );

  const uncompleteLesson = async (videoId: string) => {
    if (!user) return;

    setError(null);

    const previous = completedRef.current;
    const next = new Set(previous);
    next.delete(videoId);
    setCompleted(next);

    const { error: deleteError } = await supabase
      .from("lesson_progress")
      .delete()
      .eq("user_id", user.id)
      .eq("video_id", videoId);

    if (deleteError) {
      console.error("Failed to update progress:", deleteError);
      setCompleted(previous);
      setError("Couldn't save your progress. Please try again.");
    }
  };

  // The video ended: finish the lesson and play the next one
  onEndedRef.current = () => {
    const id = currentIdRef.current;

    if (id) {
      void completeLesson(id, true);
    }
  };

  // =========================================================
  // YouTube player
  // =========================================================

  useEffect(() => {
    if (status !== "ready" || videos.length === 0) return;

    let cancelled = false;
    const wrapper = hostRef.current;

    if (!wrapper) return;

    void loadYouTubeApi().then(() => {
      if (cancelled || !window.YT) return;

      const startId = getYouTubeId(
        videosRef.current.find((video) => video.id === currentIdRef.current)
          ?.video_url ?? null
      );

      // YouTube replaces this element with an iframe
      const target = document.createElement("div");
      wrapper.appendChild(target);

      loadedVideoRef.current = startId;

      playerRef.current = new window.YT.Player(target, {
        videoId: startId ?? undefined,
        host: "https://www.youtube-nocookie.com",
        width: "100%",
        height: "100%",
        playerVars: { rel: 0, modestbranding: 1, playsinline: 1 },
        events: {
          onStateChange: (event) => {
            if (event.data === YT_ENDED) {
              onEndedRef.current();
            }
          },
        },
      });
    });

    return () => {
      cancelled = true;

      playerRef.current?.destroy();
      playerRef.current = null;
      loadedVideoRef.current = null;
      wrapper.innerHTML = "";
    };
  }, [status, videos.length]);

  // Switching lessons: load the new video into the same player
  useEffect(() => {
    setWatched(0);

    const player = playerRef.current;

    if (!player) return;

    if (!currentYtId) {
      player.stopVideo();
      loadedVideoRef.current = null;
      return;
    }

    if (loadedVideoRef.current !== currentYtId) {
      loadedVideoRef.current = currentYtId;
      player.loadVideoById(currentYtId);
    }
  }, [currentYtId]);

  /*
   * While a video plays, read its position once a second.
   * This is what makes the progress bar move with the video.
   */
  useEffect(() => {
    if (status !== "ready") return;

    const timer = window.setInterval(() => {
      const player = playerRef.current;

      if (!player || typeof player.getPlayerState !== "function") return;
      if (player.getPlayerState() !== YT_PLAYING) return;

      const duration = player.getDuration();

      if (!duration || duration <= 0) return;

      const fraction = Math.min(1, player.getCurrentTime() / duration);

      setWatched(fraction);

      const id = currentIdRef.current;

      if (
        id &&
        fraction >= COMPLETE_AT &&
        !completedRef.current.has(id)
      ) {
        // Save it, but let the video keep playing to the end
        void completeLesson(id, false);
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, [status, completeLesson]);

  // =========================================================
  // Progress numbers
  // =========================================================

  const currentDone = current ? completed.has(current.id) : false;

  /*
   * Finished lessons plus the part of the current lesson watched.
   */
  const percent =
    videos.length === 0
      ? 0
      : Math.min(
          100,
          Math.round(
            ((completed.size + (current && !currentDone ? watched : 0)) /
              videos.length) *
              100
          )
        );

  const lessonPercent = currentDone ? 100 : Math.round(watched * 100);

  const allDone = videos.length > 0 && completed.size === videos.length;

  /*
   * Finished every lesson: ask the database to issue the
   * certificate. It checks completion itself and is safe to repeat.
   */
  useEffect(() => {
    if (!allDone || !course) {
      setCertificate(null);
      return;
    }

    let mounted = true;

    const issue = async () => {
      const { data, error: issueError } = await supabase.rpc(
        "issue_certificate",
        { p_course_id: course.id }
      );

      if (!mounted) return;

      if (issueError) {
        console.error("Failed to issue certificate:", issueError);
        return;
      }

      setCertificate(data);
    };

    void issue();

    return () => {
      mounted = false;
    };
  }, [allDone, course]);

  // =========================================================
  // States
  // =========================================================

  if (status === "loading") {
    return (
      <main className="flex min-h-[70vh] items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
          <Loader2 size={24} className="animate-spin" />
          Loading your course...
        </div>
      </main>
    );
  }

  if (status === "notfound" || status === "denied") {
    return (
      <main className="flex min-h-[70vh] items-center justify-center px-6">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg border border-slate-200 text-slate-400 dark:border-slate-700">
            <Lock size={22} />
          </div>

          <h1 className="mt-5 text-2xl font-semibold text-slate-900 dark:text-white">
            {status === "notfound" ? "Course not found" : "No access yet"}
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
            {status === "notfound"
              ? "This course doesn't exist or isn't available."
              : "You haven't enrolled in this course. Enroll to start learning."}
          </p>

          <Link
            to={status === "denied" && slug ? `/courses/${slug}` : "/courses"}
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400"
          >
            <ArrowLeft size={16} />
            {status === "denied" ? "View course" : "Browse courses"}
          </Link>
        </div>
      </main>
    );
  }

  // =========================================================
  // Player
  // =========================================================

  return (
    <main className="py-8">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <Link
          to="/my-courses"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          <ArrowLeft size={15} />
          My courses
        </Link>

        <div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <h1 className="text-2xl font-semibold text-slate-900 md:text-3xl dark:text-white">
            {course?.title}
          </h1>

          <div className="w-full sm:w-64">
            <div className="flex justify-between font-mono text-xs text-slate-600 dark:text-slate-400">
              <span>
                {completed.size}/{videos.length} lessons
              </span>
              <span className="tabular">{percent}%</span>
            </div>

            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-brand-500 transition-all duration-700"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {allDone && (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
            <span className="flex items-center gap-3">
              <Award size={20} className="shrink-0" />
              You finished every lesson. Congratulations!
            </span>

            {certificate ? (
              <Link
                to={`/certificate/${certificate}`}
                className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-emerald-700"
              >
                View certificate
              </Link>
            ) : (
              <span className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Preparing your certificate...
              </span>
            )}
          </div>
        )}

        {videos.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed border-slate-300 p-12 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
            Lessons will be added to this course soon.
          </div>
        ) : (
          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
            {/* Video */}
            <div>
              <div className="relative aspect-video overflow-hidden rounded-xl bg-black">
                {/* The YouTube player is created inside this element */}
                <div
                  ref={hostRef}
                  className="h-full w-full [&_iframe]:h-full [&_iframe]:w-full"
                />

                {!currentYtId && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black px-6 text-center text-sm text-slate-300">
                    This lesson's video isn't available yet.
                  </div>
                )}
              </div>

              {/* Current lesson progress */}
              <div className="mt-3 h-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    currentDone ? "bg-emerald-500" : "bg-brand-500"
                  }`}
                  style={{ width: `${lessonPercent}%` }}
                />
              </div>

              {current && (
                <div className="mt-5 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div>
                      <p className="font-mono text-xs uppercase tracking-[0.14em] text-slate-400">
                        Lesson{" "}
                        {videos.findIndex((video) => video.id === current.id) +
                          1}
                      </p>

                      <h2 className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">
                        {current.title}
                      </h2>

                      {current.description && (
                        <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-400">
                          {current.description}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        currentDone
                          ? void uncompleteLesson(current.id)
                          : void completeLesson(current.id, true)
                      }
                      className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
                        currentDone
                          ? "border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
                          : "bg-brand-600 text-white hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-400"
                      }`}
                    >
                      <CheckCircle size={16} />
                      {currentDone ? "Completed" : "Mark as complete"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Lessons */}
            <aside className="h-fit rounded-xl border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-900">
              <p className="px-3 pb-2 pt-2 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
                Lessons
              </p>

              <div className="max-h-[560px] space-y-0.5 overflow-y-auto">
                {videos.map((video, index) => {
                  const isCurrent = video.id === currentId;
                  const isDone = completed.has(video.id);

                  return (
                    <button
                      key={video.id}
                      type="button"
                      onClick={() => setCurrentId(video.id)}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors ${
                        isCurrent
                          ? "bg-brand-50 dark:bg-brand-500/10"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle
                          size={18}
                          className="shrink-0 text-emerald-500"
                        />
                      ) : isCurrent ? (
                        <PlayCircle
                          size={18}
                          className="shrink-0 text-brand-600 dark:text-brand-400"
                        />
                      ) : (
                        <Circle
                          size={18}
                          className="shrink-0 text-slate-300 dark:text-slate-600"
                        />
                      )}

                      <div className="min-w-0 flex-1">
                        <p
                          className={`truncate text-sm font-medium ${
                            isCurrent
                              ? "text-brand-700 dark:text-brand-300"
                              : "text-slate-800 dark:text-slate-200"
                          }`}
                        >
                          {index + 1}. {video.title}
                        </p>

                        {video.duration != null && (
                          <p className="tabular mt-0.5 font-mono text-xs text-slate-500 dark:text-slate-400">
                            {formatDuration(video.duration)}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
};

export default Learn;