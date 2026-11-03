// Generic app-wide helpers — debounce for search, status badge coloring, etc.

export function debounce<Args extends unknown[]>(
  fn: (...args: Args) => void,
  delay = 300
): (...args: Args) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// Status badge color mapping — used in AdminTable for applications/messages
export type StatusVariant = "pending" | "reviewed" | "accepted" | "rejected" | "new" | "read" | "replied" | "archived";

export const statusColorMap: Record<StatusVariant, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
  reviewed: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
  accepted: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
  rejected: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20",
  new: "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/20",
  read: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
  replied: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
  archived: "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700",
};

export const classNames = (...classes: (string | false | undefined | null)[]): string =>
  classes.filter(Boolean).join(" ");

export const generateId = (): string =>
  typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);