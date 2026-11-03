import { useEffect, useRef, useState } from "react";

import { supabase } from "../../lib/supabase";

import Container from "../ui/Container";

const reduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/*
 * Counts up once, when scrolled into view.
 */
const CountUp = ({ value }: { value: number }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const el = ref.current;

    if (!el) return;

    if (reduced()) {
      setDisplay(value);
      return;
    }

    let frame = 0;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        observer.disconnect();

        const start = performance.now();
        const duration = 1200;

        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 3);

          setDisplay(Math.round(value * eased));

          if (t < 1) frame = requestAnimationFrame(tick);
        };

        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value]);

  return <span ref={ref}>{display}</span>;
};

type Stat = { label: string; value: number };

const count = async (table: string, filter?: [string, string | boolean]) => {
  let query = supabase.from(table as "courses").select("id", {
    count: "exact",
    head: true,
  });

  if (filter) query = query.eq(filter[0], filter[1] as boolean);

  const { count: total } = await query;

  return total ?? 0;
};

const LiveStats = () => {
  const [stats, setStats] = useState<Stat[]>([]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const [services, projects, courses, internships] = await Promise.all([
        count("services", ["is_published", true]),
        count("portfolio_projects", ["is_published", true]),
        count("courses", ["is_published", true]),
        count("internships", ["is_published", true]),
      ]);

      if (!mounted) return;

      // Real numbers only: anything at zero is left out
      setStats(
        [
          { label: "Services offered", value: services },
          { label: "Projects showcased", value: projects },
          { label: "Courses available", value: courses },
          { label: "Internship programs", value: internships },
        ].filter((stat) => stat.value > 0)
      );
    };

    void load();

    return () => {
      mounted = false;
    };
  }, []);

  if (stats.length === 0) return null;

  return (
    <section className="border-b border-slate-200 py-12 dark:border-slate-800">
      <Container>
        <dl className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="border-l-2 border-brand-500/40 pl-4"
            >
              <dt className="text-sm text-slate-500 dark:text-slate-400">
                {stat.label}
              </dt>

              <dd className="tabular mt-1 font-mono text-4xl font-semibold text-slate-900 dark:text-white">
                <CountUp value={stat.value} />
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
};

export default LiveStats;