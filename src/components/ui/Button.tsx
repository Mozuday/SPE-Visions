import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";

type Variant = "primary" | "outline" | "ghost";
type Size = "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-brand-600 text-white hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-400",
  outline:
    "border border-slate-300 bg-transparent text-slate-800 hover:border-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:bg-slate-900",
  ghost:
    "bg-transparent text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
};

const sizeClasses: Record<Size, string> = {
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3 text-sm",
};

const baseClasses =
  "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50";

type ButtonLinkProps = {
  to: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

export const ButtonLink = ({
  to,
  variant = "primary",
  size = "lg",
  className = "",
  children,
}: ButtonLinkProps) => (
  <Link
    to={to}
    className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
  >
    {children}
  </Link>
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
};

export const Button = ({
  variant = "primary",
  size = "lg",
  loading = false,
  className = "",
  children,
  disabled,
  ...rest
}: ButtonProps) => (
  <button
    className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    disabled={disabled || loading}
    {...rest}
  >
    {loading && (
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
    )}
    {children}
  </button>
);