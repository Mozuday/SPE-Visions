import type { LucideIcon } from "lucide-react";

type EmptyStateProps = {
  icon: LucideIcon;
  message: string;
};

const EmptyState = ({ icon: Icon, message }: EmptyStateProps) => (
  <div className="mt-12 flex flex-col items-center rounded-xl border border-dashed border-slate-300 px-6 py-14 text-center dark:border-slate-700">
    <Icon size={28} className="text-slate-300 dark:text-slate-600" />

    <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{message}</p>
  </div>
);

export default EmptyState;