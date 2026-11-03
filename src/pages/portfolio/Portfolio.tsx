import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  FolderKanban,
  Layers3,
  Loader2,
} from "lucide-react";

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

type Project = Tables<"portfolio_projects">;

/*
 * Only allow http(s) links so a bad value in the database
 * can never become a javascript: link.
 */
const getSafeUrl = (value: string | null): string | null => {
  if (!value) return null;

  try {
    const url = new URL(value);

    return url.protocol === "http:" || url.protocol === "https:"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
};

const approach = [
  {
    title: "Understand",
    text: "We first understand the business requirement, users and problem the product needs to solve.",
  },
  {
    title: "Build",
    text: "We select suitable technologies and build with maintainability, usability and performance in mind.",
  },
  {
    title: "Improve",
    text: "We test, refine and improve the product based on real requirements and user feedback.",
  },
];

const Portfolio = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadProjects = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from("portfolio_projects")
          .select("*")
          .eq("is_published", true)
          .order("order_index", { ascending: true });

        if (fetchError) {
          throw fetchError;
        }

        if (mounted) {
          setProjects(data ?? []);
        }
      } catch (err) {
        console.error("Failed to load projects:", err);

        if (mounted) {
          setError("Unable to load projects right now. Please try again later.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void loadProjects();

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
            <Eyebrow label="Our portfolio" />

            <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.1] text-slate-950 sm:text-5xl dark:text-white">
              Projects built{" "}
              <span className="text-brand-600 dark:text-brand-400">
                with purpose.
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-400">
              Explore some of our digital projects. We focus on building
              products that are practical, reliable, scalable and easy to use.
            </p>
          </Reveal>
        </Container>
      </section>

      {/* Projects */}
      <Section>
        <SectionHeading
          eyebrow="Selected work"
          title="Digital solutions we have built"
          description="Each project solves a specific problem with a clean interface, maintainable architecture and a strong user experience."
        />

        {loading && (
          <div className="mt-12 flex items-center justify-center gap-3 text-slate-500">
            <Loader2 size={22} className="animate-spin" />
            Loading projects...
          </div>
        )}

        {!loading && error && (
          <div className="mt-12 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        {!loading && !error && projects.length === 0 && (
          <EmptyState
            icon={FolderKanban}
            message="Our projects will appear here soon."
          />
        )}

        {!loading && !error && projects.length > 0 && (
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, index) => {
              const projectUrl = getSafeUrl(project.project_url);
              const tags = project.tags ?? [];

              return (
                <Reveal key={project.id} delay={Math.min(index, 5) * 70}>
                  <article
                    data-spotlight
                    className="spotlight group flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-200 hover:-translate-y-1 hover:border-brand-400 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-500/60"
                  >
                    <div className="h-48 overflow-hidden border-b border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-800">
                      {project.cover_image_url ? (
                        <img
                          src={project.cover_image_url}
                          alt={project.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-slate-300 dark:text-slate-600">
                          <Layers3 size={32} />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col p-6">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        {project.title}
                      </h3>

                      {project.description && (
                        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                          {project.description}
                        </p>
                      )}

                      {tags.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {tags.map((tag) => (
                            <Badge key={tag}>{tag}</Badge>
                          ))}
                        </div>
                      )}

                      {projectUrl && (
                        <a
                          href={projectUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-slate-900 hover:text-brand-600 dark:text-white dark:hover:text-brand-400"
                        >
                          View project
                          <ArrowUpRight size={15} />
                        </a>
                      )}
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        )}
      </Section>

      {/* Approach */}
      <Section tone="muted">
        <SectionHeading
          eyebrow="Our approach"
          title="We build with purpose"
          description="Good software is not just about writing code. It should solve a real problem, provide a good experience and stay reliable as the product grows."
        />

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {approach.map((item, index) => (
            <Reveal key={item.title} delay={index * 100}>
              <p className="font-mono text-xs text-slate-400">0{index + 1}</p>

              <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
                {item.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                {item.text}
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
              Have an idea for your next project?
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-400">
              Tell us what you want to build, improve or fix, and we'll help
              turn it into a practical digital solution.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <ButtonLink to="/contact">
              Start a project
              <ArrowRight size={16} />
            </ButtonLink>

            <ButtonLink to="/services" variant="outline">
              View services
            </ButtonLink>
          </div>
        </div>
      </Section>
    </main>
  );
};

export default Portfolio;