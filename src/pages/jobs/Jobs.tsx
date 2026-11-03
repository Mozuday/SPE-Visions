import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowUpRight,
  Briefcase,
  CalendarDays,
  Loader2,
  MapPin,
  Search,
  Wallet,
} from "lucide-react";

import { supabase } from "../../lib/supabase";
import type { Tables } from "../../types/supabase";

import Badge from "../../components/ui/Badge";
import Blueprint from "../../components/ui/Blueprint";
import Container from "../../components/ui/Container";
import EmptyState from "../../components/ui/EmptyState";
import Eyebrow from "../../components/ui/Eyebrow";
import Section from "../../components/ui/Section";
import Reveal from "../../components/effects/Reveal";

type Job = Tables<"jobs">;

const employmentTypes = [
  "Full Time",
  "Part Time",
  "Internship",
  "Contract",
  "Freelance",
];

const inputClass =
  "rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white";

const isExpired = (deadline: string | null) => {
  if (!deadline) return false;

  const end = new Date(`${deadline}T23:59:59`);

  return !Number.isNaN(end.getTime()) && end.getTime() < Date.now();
};

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

const Jobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [type, setType] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadJobs = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from("jobs")
          .select("*")
          .eq("is_published", true)
          .order("created_at", { ascending: false });

        if (fetchError) {
          throw fetchError;
        }

        if (mounted) {
          setJobs((data ?? []).filter((job) => !isExpired(job.deadline)));
        }
      } catch (err) {
        console.error("Failed to load jobs:", err);

        if (mounted) {
          setError("Unable to load jobs right now. Please try again later.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void loadJobs();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredJobs = useMemo(() => {
    const query = search.trim().toLowerCase();

    return jobs.filter((job) => {
      if (type && job.employment_type !== type) return false;

      if (!query) return true;

      const haystack = [
        job.title,
        job.company,
        job.location,
        ...(job.skills ?? []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [jobs, search, type]);

  return (
    <main>
      {/* Hero */}
      <section className="bg-hero-glow relative overflow-hidden border-b border-slate-200 dark:border-slate-800">
        <Blueprint />

        <Container className="relative py-14 md:py-20">
          <Reveal>
            <Eyebrow label="Careers" />

            <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.1] text-slate-950 sm:text-5xl dark:text-white">
              Find your next{" "}
              <span className="text-brand-600 dark:text-brand-400">
                opportunity.
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-400">
              Fresh technology jobs, updated regularly. Browse openings and
              apply directly with the employer.
            </p>
          </Reveal>
        </Container>
      </section>

      {/* Listings */}
      <Section bordered={false}>
        <div className="flex flex-col gap-3 sm:flex-row">
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
              placeholder="Search by title, company, location or skill"
              aria-label="Search jobs"
              className={`${inputClass} w-full pl-10`}
            />
          </div>

          <select
            value={type}
            onChange={(event) => setType(event.target.value)}
            aria-label="Filter by job type"
            className={`${inputClass} sm:w-52`}
          >
            <option value="">All job types</option>

            {employmentTypes.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        {loading && (
          <div className="mt-12 flex items-center justify-center gap-3 text-slate-500">
            <Loader2 size={22} className="animate-spin" />
            Loading jobs...
          </div>
        )}

        {!loading && error && (
          <div className="mt-12 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        {!loading && !error && filteredJobs.length === 0 && (
          <EmptyState
            icon={Briefcase}
            message={
              jobs.length === 0
                ? "No openings right now. Check back soon."
                : "No jobs match your search."
            }
          />
        )}

        {!loading && !error && filteredJobs.length > 0 && (
          <div className="mt-8 space-y-4">
            {filteredJobs.map((job, index) => {
              const applyUrl = getSafeUrl(job.application_link);

              return (
                <Reveal key={job.id} delay={Math.min(index, 5) * 60}>
                  <article
                    data-spotlight
                    className="spotlight rounded-xl border border-slate-200 bg-white p-6 transition-colors hover:border-brand-400 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-500/60"
                  >
                    <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap gap-1.5">
                          {job.employment_type && (
                            <Badge tone="brand">{job.employment_type}</Badge>
                          )}

                          {job.work_mode && <Badge>{job.work_mode}</Badge>}
                        </div>

                        <h2 className="mt-3 text-xl font-semibold text-slate-900 dark:text-white">
                          {job.title}
                        </h2>

                        {job.company && (
                          <p className="mt-1 text-sm font-medium text-brand-600 dark:text-brand-400">
                            {job.company}
                          </p>
                        )}

                        {job.description && (
                          <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                            {job.description}
                          </p>
                        )}

                        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600 dark:text-slate-400">
                          {job.location && (
                            <span className="inline-flex items-center gap-1.5">
                              <MapPin size={14} />
                              {job.location}
                            </span>
                          )}

                          {job.experience && (
                            <span>Experience: {job.experience}</span>
                          )}

                          {job.salary && (
                            <span className="inline-flex items-center gap-1.5">
                              <Wallet size={14} />
                              {job.salary}
                            </span>
                          )}

                          {job.deadline && (
                            <span className="inline-flex items-center gap-1.5">
                              <CalendarDays size={14} />
                              Apply by {formatDeadline(job.deadline)}
                            </span>
                          )}
                        </div>

                        {job.skills.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-1.5">
                            {job.skills.map((skill) => (
                              <Badge key={skill}>{skill}</Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      {applyUrl && (
                        <a
                          href={applyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-400"
                        >
                          Apply now
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
    </main>
  );
};

export default Jobs;