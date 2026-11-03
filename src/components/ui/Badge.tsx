import type { ReactNode } from "react";

type Tone = "neutral" | "brand" | "success" | "warning" | "danger";

const tones: Record<Tone, string> = {
  neutral:
    "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300",
  brand:
    "border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-300",
  success:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300",
  warning:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300",
  danger:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300",
};

type BadgeProps = {
  children: ReactNode;
  tone?: Tone;
  className?: string;
};

const Badge = ({ children, tone = "neutral", className = "" }: BadgeProps) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 font-mono text-xs font-medium ${tones[tone]} ${className}`}
  >
    {children}
  </span>
);

export default Badge;