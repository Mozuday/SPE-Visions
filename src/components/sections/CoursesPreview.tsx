import { useEffect, useState } from "react";
import { ArrowRight, BookOpen, Clock3, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

import { supabase } from "../../lib/supabase";
import type { Tables } from "../../types/supabase";

import Badge from "../ui/Badge";
import Section from "../ui/Section";
import SectionHeading from "../ui/SectionHeading";
import Reveal from "../effects/Reveal";

type Course = Tables<"courses">;

const CoursesPreview = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(3);

      if (!mounted) return;

      if (error) {
        console.error("Failed to load courses preview:", error);
      } else {
        setCourses(data ?? []);
      }

      setLoading(false);
    };

    void load();

    return () => {
      mounted = false;
    };
  }, []);

  if (!loading && courses.length === 0) return null;

  return (
    <Section tone="muted">
      <SectionHeading
        index="03"
        eyebrow="SPE Academy"
        title="Learn skills that companies actually need"
        description="Project-based courses built around real development workflows and the technologies developers use every day."
        action={
          <Link
            to="/courses"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400"
          >
            All courses
            <ArrowRight size={15} />
          </Link>
        }
      />

      {loading ? (
        <div className="mt-12 flex justify-center text-slate-500">
          <Loader2 size={22} className="animate-spin" />
        </div>
      ) : (
        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {courses.map((course, index) => (
            <Reveal key={course.id} delay={index * 80}>
              <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-colors hover:border-brand-400 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-500/60">
                <div className="h-40 overflow-hidden border-b border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-800">
                  {course.thumbnail_url ? (
                    <img
                      src={course.thumbnail_url}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-300 dark:text-slate-600">
                      <BookOpen size={30} />
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <div className="flex flex-wrap gap-1.5">
                    <Badge>
                      <Clock3 size={12} />
                      {course.duration}
                    </Badge>

                    {course.level && <Badge tone="brand">{course.level}</Badge>}
                  </div>

                  <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
                    {course.title}
                  </h3>

                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                    {course.description}
                  </p>

                  <div className="mt-auto flex items-center justify-between pt-5">
                    <span className="tabular font-mono text-sm font-semibold text-slate-900 dark:text-white">
                      {course.price != null && course.price > 0
                        ? `₹${course.price}`
                        : "Free"}
                    </span>

                    <Link
                      to={`/courses/${course.slug}`}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 after:absolute after:inset-0 after:content-[''] dark:text-brand-400"
                    >
                      View course
                      <ArrowRight size={15} />
                    </Link>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      )}
    </Section>
  );
};

export default CoursesPreview;