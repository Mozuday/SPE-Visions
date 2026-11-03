import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Code2,
  Database,
  Layers,
  Loader2,
  Monitor,
  Smartphone,
  Terminal,
  Users,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
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

type Internship = Tables<"internships">;

/*
 * Category → icon. Keys must match the category list in
 * admin/pages/internships/ManageInternships.tsx.
 */
const categoryIcons: Record<string, LucideIcon> = {
  "Web Design": Monitor,
  "Frontend Development": Code2,
  "Backend Development": Database,
  "App Development": Smartphone,
  "Full Stack Development": Layers,
  "Software Development": Terminal,
  Other: BriefcaseBusiness,
};

const getCategoryIcon = (category: string | null): LucideIcon =>
  (category && categoryIcons[category]) || BriefcaseBusiness;

const formatDeadline = (value: string) => {
  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/*
 * Deadline is a plain date (YYYY-MM-DD). Applications stay open
 * through the end of that day.
 */
const isClosed = (internship: Internship) => {
  if (!internship.deadline) return false;

  const end = new Date(`${internship.deadline}T23:59:59`);

  return !Number.isNaN(end.getTime()) && end.getTime() < Date.now();
};

const steps = [
  {
    title: "Apply",
    text: "Submit your application and pick the internship that matches your interests.",
  },
  {
    title: "Learn & build",
    text: "Work on practical assignments and projects to grow your technical skills.",
  },
  {
    title: "Complete & get certified",
    text: "Finish the requirements and receive an internship completion certificate.",
  },
];

const Internships = () => {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadInternships = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from("internships")
          .select("*")
          .eq("is_published", true)
          .order("created_at", { ascending: false });

        if (fetchError) {
          throw fetchError;
        }

        if (mounted) {
          setInternships(data ?? []);
        }
      } catch (err) {
        console.error("Failed to load internships:", err);

        if (mounted) {
          setError(
            "Unable to load internships right now. Please try again later."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void loadInternships();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main>
      {/* Hero */}
      <section className="bg-hero-glow relative overflow-hidden border-b border-slate-200 dark:border-slate-800">
        <Blueprint />

        <Container className="relative py-14 md:py-20">
          <Reveal>
            <Eyebrow label="Internship program" />

            <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.1] text-slate-950 sm:text-5xl dark:text-white">
              Build skills through{" "}
              <span className="text-brand-600 dark:text-brand-400">
                real experience.
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-400">
              Gain practical experience on real projects, strengthen your
              technical skills and build a professional portfolio with SPE
              Visions.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink to="/internships/apply">
                Apply for an internship
                <ArrowRight size={16} />
              </ButtonLink>

              <a
                href="#openings"
                className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-800 transition-colors hover:border-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:bg-slate-900"
              >
                See openings
              </a>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* Openings */}
      <Section id="openings">
        <SectionHeading
          eyebrow="Openings"
          title="Choose your learning path"
          description="Select an area that matches your interests and start building practical, industry-ready skills."
        />

        {loading && (
          <div className="mt-12 flex items-center justify-center gap-3 text-slate-500">
            <Loader2 size={22} className="animate-spin" />
            Loading internships...
          </div>
        )}

        {!loading && error && (
          <div className="mt-12 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        {!loading && !error && internships.length === 0 && (
          <EmptyState
            icon={BriefcaseBusiness}
            message="No internships are open right now. Check back soon."
          />
        )}

        {!loading && !error && internships.length > 0 && (
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {internships.map((internship, index) => {
              const Icon = getCategoryIcon(internship.category);
              const closed = isClosed(internship);

              return (
                <Reveal key={internship.id} delay={Math.min(index, 5) * 70}>
                  <article
                    data-spotlight
                    className={`spotlight flex h-full flex-col rounded-xl border border-slate-200 bg-white p-6 transition-all duration-200 dark:border-slate-800 dark:bg-slate-900 ${
                      closed
                        ? "opacity-70"
                        : "hover:-translate-y-1 hover:border-brand-400 dark:hover:border-brand-500/60"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-brand-600 dark:border-slate-700 dark:text-brand-400">
                        <Icon size={20} strokeWidth={1.8} />
                      </div>

                      <div className="min-w-0">
                        {internship.category && (
                          <p className="font-mono text-xs uppercase tracking-[0.14em] text-brand-600 dark:text-brand-400">
                            {internship.category}
                          </p>
                        )}

                        <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
                          {internship.title}
                        </h3>
                      </div>
                    </div>

                    {internship.description && (
                      <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-400">
                        {internship.description}
                      </p>
                    )}

                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {internship.duration && (
                        <Badge>
                          <Clock3 size={12} />
                          {internship.duration}
                        </Badge>
                      )}

                      {internship.seats !== null && (
                        <Badge>
                          <Users size={12} />
                          {internship.seats} seats
                        </Badge>
                      )}

                      {internship.stipend && (
                        <Badge tone="success">
                          <Wallet size={12} />
                          {internship.stipend}
                        </Badge>
                      )}

                      {internship.deadline && (
                        <Badge tone={closed ? "danger" : "neutral"}>
                          <CalendarClock size={12} />
                          {closed ? "Closed" : "Apply by"}{" "}
                          {formatDeadline(internship.deadline)}
                        </Badge>
                      )}
                    </div>

                    {internship.eligibility && (
                      <div className="mt-5">
                        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-slate-400">
                          Eligibility
                        </p>

                        <p className="mt-1.5 text-sm leading-6 text-slate-600 dark:text-slate-400">
                          {internship.eligibility}
                        </p>
                      </div>
                    )}

                    {internship.skills && internship.skills.length > 0 && (
                      <div className="mt-5 flex-1 border-t border-slate-200 pt-5 dark:border-slate-800">
                        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-slate-400">
                          Skills you'll work with
                        </p>

                        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                          {internship.skills.map((skill) => (
                            <li
                              key={skill}
                              className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300"
                            >
                              <CheckCircle2
                                size={15}
                                className="shrink-0 text-brand-600 dark:text-brand-400"
                              />
                              {skill}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="pt-6">
                      {closed ? (
                        <span className="text-sm font-semibold text-slate-400 dark:text-slate-500">
                          Applications closed
                        </span>
                      ) : (
                        <Link
                          to={`/internships/apply?internship=${internship.slug}`}
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400"
                        >
                          Apply for this internship
                          <ArrowRight size={15} />
                        </Link>
                      )}
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        )}
      </Section>

      {/* Process */}
      <Section tone="muted">
        <SectionHeading
          eyebrow="How it works"
          title="From application to certificate"
          description="A simple process designed to move you from learning to practical experience."
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

      {/* CTA */}
      <Section bordered={false}>
        <div className="flex flex-col items-start justify-between gap-6 rounded-xl border border-slate-200 bg-white p-8 md:flex-row md:items-center dark:border-slate-800 dark:bg-slate-900">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
              Ready to start your journey?
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-400">
              Take the next step toward building practical skills and a
              stronger professional portfolio.
            </p>
          </div>

          <ButtonLink to="/internships/apply" className="shrink-0">
            Apply now
            <ArrowRight size={16} />
          </ButtonLink>
        </div>
      </Section>
    </main>
  );
};

export default Internships;