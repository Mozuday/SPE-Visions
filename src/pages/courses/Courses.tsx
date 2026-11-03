import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Loader2,
  Search,
} from "lucide-react";
import { Link } from "react-router-dom";

import { supabase } from "../../lib/supabase";
import type { Tables } from "../../types/supabase";

import Badge from "../../components/ui/Badge";
import Blueprint from "../../components/ui/Blueprint";
import { ButtonLink } from "../../components/ui/Button";
import Container from "../../components/ui/Container";
import EmptyState from "../../components/ui/EmptyState";
import Eyebrow from "../../components/ui/Eyebrow";
import Section from "../../components/ui/Section";
import SectionHeading from "../../components/ui/SectionHeading";
import Reveal from "../../components/effects/Reveal";

type Course = Tables<"courses">;

const levels = [
  "Beginner",
  "Intermediate",
  "Advanced",
  "Beginner to Advanced",
];

const steps = [
  {
    title: "Learn",
    text: "Understand the fundamentals and concepts needed to work with modern technologies.",
  },
  {
    title: "Build",
    text: "Apply what you learn by developing practical projects and real applications.",
  },
  {
    title: "Get certified",
    text: "Finish every lesson and receive a certificate anyone can verify online.",
  },
];

const benefits = [
  "Project-focused learning",
  "Modern technologies",
  "Practical development skills",
  "Verifiable completion certificate",
];

const Courses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadCourses = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from("courses")
          .select("*")
          .eq("is_published", true)
          .order("created_at", { ascending: false });

        if (fetchError) {
          throw fetchError;
        }

        if (mounted) {
          setCourses(data ?? []);
        }
      } catch (err) {
        console.error("Failed to load courses:", err);

        if (mounted) {
          setError("Unable to load courses right now. Please try again later.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void loadCourses();

    return () => {
      mounted = false;
    };
  }, []);

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();

    return courses.filter((course) => {
      if (level && course.level !== level) return false;

      if (!query) return true;

      return `${course.title} ${course.description ?? ""}`
        .toLowerCase()
        .includes(query);
    });
  }, [courses, search, level]);

  const inputClass =
    "rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white";

  return (
    <main>
      {/* Hero */}
      <section className="bg-hero-glow relative overflow-hidden border-b border-slate-200 dark:border-slate-800">
        <Blueprint />

        <Container className="relative py-14 md:py-20">
          <Reveal>
            <Eyebrow label="SPE Academy" />

            <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.1] text-slate-950 sm:text-5xl dark:text-white">
              Learn skills that{" "}
              <span className="text-brand-600 dark:text-brand-400">
                build careers.
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-400">
              Practical technology courses for students, freshers and aspiring
              developers who want to learn by building real projects.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#courses"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-400"
              >
                Explore courses
                <ArrowRight size={16} />
              </a>

              <ButtonLink to="/certificate" variant="outline">
                <Award size={16} />
                Verify a certificate
              </ButtonLink>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* Courses */}
      <Section id="courses">
        <SectionHeading
          eyebrow="Available courses"
          title="Choose your learning path"
          description="Start with the area you want to learn and build practical skills through structured, project-focused lessons."
        />

        {/* Filters */}
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={16}
              aria-hidden="true"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search courses"
              aria-label="Search courses"
              className={`${inputClass} w-full pl-10`}
            />
          </div>

          <select
            value={level}
            onChange={(event) => setLevel(event.target.value)}
            aria-label="Filter by level"
            className={`${inputClass} sm:w-60`}
          >
            <option value="">All levels</option>

            {levels.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        {loading && (
          <div className="mt-12 flex items-center justify-center gap-3 text-slate-500">
            <Loader2 size={22} className="animate-spin" />
            Loading courses...
          </div>
        )}

        {!loading && error && (
          <div className="mt-12 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        {!loading && !error && visible.length === 0 && (
          <EmptyState
            icon={GraduationCap}
            message={
              courses.length === 0
                ? "New courses are on the way."
                : "No courses match your search."
            }
          />
        )}

        {!loading && !error && visible.length > 0 && (
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {visible.map((course, index) => (
              <Reveal key={course.id} delay={Math.min(index, 5) * 70}>
                <article
                  data-spotlight
                  className="spotlight group relative flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-200 hover:-translate-y-1 hover:border-brand-400 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-500/60"
                >
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

                      {course.level && (
                        <Badge tone="brand">{course.level}</Badge>
                      )}
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

      {/* How learning works */}
      <Section tone="muted">
        <SectionHeading
          eyebrow="How it works"
          title="Learn by building"
          description="We focus on understanding concepts and then applying them to practical development work."
        />

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <Reveal key={step.title} delay={index * 100}>
              <p className="font-mono text-xs text-slate-400">0{index + 1}</p>

              <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
                {step.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                {step.text}
              </p>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Benefits + CTA */}
      <Section bordered={false}>
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <Eyebrow label="Why learn with SPE" />

            <h2 className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">
              Focus on skills you can actually use.
            </h2>

            <p className="mt-4 leading-7 text-slate-600 dark:text-slate-400">
              Our courses are structured around practical development, helping
              you move from understanding concepts to creating working digital
              products.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#courses"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-400"
              >
                Browse courses
              </a>

              <ButtonLink to="/contact" variant="outline">
                Contact us
              </ButtonLink>
            </div>
          </div>

          <ul className="grid gap-3 sm:grid-cols-2">
            {benefits.map((benefit) => (
              <li
                key={benefit}
                className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
              >
                <CheckCircle2
                  size={18}
                  className="mt-0.5 shrink-0 text-brand-600 dark:text-brand-400"
                />
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      </Section>
    </main>
  );
};

export default Courses;