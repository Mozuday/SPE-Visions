import { useEffect, useState } from "react";
import { ArrowRight, CalendarClock, Clock3, Loader2, Users } from "lucide-react";
import { Link } from "react-router-dom";

import { supabase } from "../../lib/supabase";
import type { Tables } from "../../types/supabase";

import Badge from "../ui/Badge";
import Section from "../ui/Section";
import SectionHeading from "../ui/SectionHeading";
import Reveal from "../effects/Reveal";

type Internship = Tables<"internships">;

const isClosed = (internship: Internship) => {
  if (!internship.deadline) return false;

  const end = new Date(`${internship.deadline}T23:59:59`);

  return !Number.isNaN(end.getTime()) && end.getTime() < Date.now();
};

const formatDeadline = (value: string) => {
  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const InternshipPreview = () => {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const { data, error } = await supabase
        .from("internships")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(12);

      if (!mounted) return;

      if (error) {
        console.error("Failed to load internship preview:", error);
      } else {
        // Closed ones are filtered out, then the newest four are shown
        setInternships(
          (data ?? []).filter((item) => !isClosed(item)).slice(0, 4)
        );
      }

      setLoading(false);
    };

    void load();

    return () => {
      mounted = false;
    };
  }, []);

  if (!loading && internships.length === 0) return null;

  return (
    <Section>
      <SectionHeading
        index="04"
        eyebrow="Internships"
        title="Start your career with real experience"
        description="Work on practical projects, build your portfolio and learn from working developers."
        action={
          <Link
            to="/internships"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400"
          >
            All internships
            <ArrowRight size={15} />
          </Link>
        }
      />

      {loading ? (
        <div className="mt-12 flex justify-center text-slate-500">
          <Loader2 size={22} className="animate-spin" />
        </div>
      ) : (
        <div className="mt-12 divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
          {internships.map((internship, index) => (
            <Reveal key={internship.id} delay={index * 60}>
              <Link
                to={`/internships/apply?internship=${internship.slug}`}
                className="group flex flex-col gap-4 p-6 transition-colors hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between dark:hover:bg-slate-800/50"
              >
                <div className="min-w-0">
                  {internship.category && (
                    <p className="font-mono text-xs uppercase tracking-[0.14em] text-brand-600 dark:text-brand-400">
                      {internship.category}
                    </p>
                  )}

                  <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
                    {internship.title}
                  </h3>

                  <div className="mt-3 flex flex-wrap gap-1.5">
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

                    {internship.deadline && (
                      <Badge>
                        <CalendarClock size={12} />
                        Apply by {formatDeadline(internship.deadline)}
                      </Badge>
                    )}
                  </div>
                </div>

                <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-brand-600 transition-all group-hover:gap-2.5 dark:text-brand-400">
                  Apply now
                  <ArrowRight size={15} />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      )}
    </Section>
  );
};

export default InternshipPreview;