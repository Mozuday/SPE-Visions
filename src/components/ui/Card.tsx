import type { HTMLAttributes, ReactNode } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  className?: string;
  hover?: boolean;
};

const Card = ({
  children,
  className = "",
  hover = true,
  ...props
}: CardProps) => (
  <div
    className={`rounded-xl border border-slate-200 bg-white p-6 text-slate-900 transition-colors duration-150 dark:border-slate-800 dark:bg-slate-900 dark:text-white ${
      hover
        ? "hover:border-brand-400 dark:hover:border-brand-500/60"
        : ""
    } ${className}`}
    {...props}
  >
    {children}
  </div>
);

export default Card;