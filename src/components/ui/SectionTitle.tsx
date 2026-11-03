import type { ReactNode } from "react";
import Reveal from "../effects/Reveal";

export type Accent = "blue" | "amber" | "emerald" | "violet" | "rose" | "indigo";

const accentStyles: Record<Accent, {
  badgeBorder: string;
  badgeBg: string;
  badgeText: string;
  dot: string;
  gradient: string;
}> = {
  blue: {
    badgeBorder: "border-blue-200 dark:border-cyan-500/20",
    badgeBg: "bg-blue-50/80 dark:bg-cyan-500/5",
    badgeText: "text-blue-700 dark:text-cyan-300",
    dot: "bg-blue-600 dark:bg-cyan-400",
    gradient: "from-blue-600 via-cyan-500 to-blue-600 dark:from-cyan-400 dark:via-blue-400 dark:to-cyan-400",
  },
  amber: {
    badgeBorder: "border-amber-200 dark:border-amber-500/20",
    badgeBg: "bg-amber-50/80 dark:bg-amber-500/5",
    badgeText: "text-amber-700 dark:text-amber-300",
    dot: "bg-amber-600 dark:bg-amber-400",
    gradient: "from-amber-600 via-orange-500 to-amber-600 dark:from-amber-400 dark:via-orange-400 dark:to-amber-400",
  },
  emerald: {
    badgeBorder: "border-emerald-200 dark:border-emerald-500/20",
    badgeBg: "bg-emerald-50/80 dark:bg-emerald-500/5",
    badgeText: "text-emerald-700 dark:text-emerald-300",
    dot: "bg-emerald-600 dark:bg-emerald-400",
    gradient: "from-emerald-600 via-green-500 to-emerald-600 dark:from-emerald-400 dark:via-green-400 dark:to-emerald-400",
  },
  violet: {
    badgeBorder: "border-violet-200 dark:border-violet-500/20",
    badgeBg: "bg-violet-50/80 dark:bg-violet-500/5",
    badgeText: "text-violet-700 dark:text-violet-300",
    dot: "bg-violet-600 dark:bg-violet-400",
    gradient: "from-violet-600 via-purple-500 to-violet-600 dark:from-violet-400 dark:via-purple-400 dark:to-violet-400",
  },
  rose: {
    badgeBorder: "border-rose-200 dark:border-rose-500/20",
    badgeBg: "bg-rose-50/80 dark:bg-rose-500/5",
    badgeText: "text-rose-700 dark:text-rose-300",
    dot: "bg-rose-600 dark:bg-rose-400",
    gradient: "from-rose-600 via-pink-500 to-rose-600 dark:from-rose-400 dark:via-pink-400 dark:to-rose-400",
  },
  indigo: {
    badgeBorder: "border-indigo-200 dark:border-indigo-500/20",
    badgeBg: "bg-indigo-50/80 dark:bg-indigo-500/5",
    badgeText: "text-indigo-700 dark:text-indigo-300",
    dot: "bg-indigo-600 dark:bg-indigo-400",
    gradient: "from-indigo-600 via-blue-500 to-indigo-600 dark:from-indigo-400 dark:via-blue-400 dark:to-indigo-400",
  },
};

interface SectionTitleProps {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  accent?: Accent;
  align?: "left" | "center";
}

const SectionTitle = ({ eyebrow, title, description, accent = "blue", align = "center" }: SectionTitleProps) => {
  const styles = accentStyles[accent];
  const alignClass = align === "center" ? "mx-auto text-center items-center" : "text-left items-start";

  return (
    <div className={`flex max-w-2xl flex-col ${alignClass}`}>
      <Reveal>
        <div className={`inline-flex items-center gap-2 rounded-full border ${styles.badgeBorder} ${styles.badgeBg} px-4 py-2 backdrop-blur-sm`}>
          <span className={`h-2 w-2 animate-pulse rounded-full ${styles.dot}`} />
          <span className={`text-xs font-semibold uppercase tracking-[0.18em] ${styles.badgeText}`}>
            {eyebrow}
          </span>
        </div>
      </Reveal>

      <Reveal delay={100}>
        <h2 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-slate-950 sm:text-4xl md:text-5xl dark:text-white">
          <span className={`bg-gradient-to-r ${styles.gradient} bg-clip-text text-transparent`}>
            {title}
          </span>
        </h2>
      </Reveal>

      {description && (
        <Reveal delay={200}>
          <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg dark:text-slate-400">
            {description}
          </p>
        </Reveal>
      )}
    </div>
  );
};

export default SectionTitle;
export { accentStyles };