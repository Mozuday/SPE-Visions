import { useEffect, useState } from "react";
import { ArrowRight, ArrowUpRight, Layers3, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

import { supabase } from "../../lib/supabase";
import type { Tables } from "../../types/supabase";

import Badge from "../ui/Badge";
import Section from "../ui/Section";
import SectionHeading from "../ui/SectionHeading";
import Reveal from "../effects/Reveal";

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

const PortfolioPreview = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const { data, error } = await supabase
        .from("portfolio_projects")
        .select("*")
        .eq("is_published", true)
        .order("order_index", { ascending: true })
        .limit(3);

      if (!mounted) return;

      if (error) {
        console.error("Failed to load portfolio preview:", error);
      } else {
        setProjects(data ?? []);
      }

      setLoading(false);
    };

    void load();

    return () => {
      mounted = false;
    };
  }, []);

  if (!loading && projects.length === 0) return null;

  return (
    <Section>
      <SectionHeading
        index="02"
        eyebrow="Selected work"
        title="Projects built with purpose"
        description="A selection of products and websites we have designed and developed."
        action={
          <Link
            to="/portfolio"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400"
          >
            Full portfolio
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
          {projects.map((project, index) => {
            const projectUrl = getSafeUrl(project.project_url);
            const tags = project.tags ?? [];

            return (
              <Reveal key={project.id} delay={index * 80}>
                <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-colors hover:border-brand-400 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-500/60">
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
                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                        {project.description}
                      </p>
                    )}

                    {tags.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {tags.slice(0, 4).map((tag) => (
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
  );
};

export default PortfolioPreview;