// components/ui/Textarea.tsx
import { forwardRef } from "react";
import type { TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = "", id, rows = 5, ...rest }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={textareaId} className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className={`resize-none rounded-xl border bg-white/80 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 backdrop-blur-sm transition focus:outline-none focus:ring-2 dark:bg-slate-900/60 dark:text-slate-100 dark:placeholder:text-slate-500 ${
            error
              ? "border-rose-400 focus:ring-rose-200 dark:border-rose-500 dark:focus:ring-rose-500/20"
              : "border-slate-200 focus:border-blue-500 focus:ring-blue-100 dark:border-slate-700 dark:focus:border-cyan-500 dark:focus:ring-cyan-500/20"
          } ${className}`}
          {...rest}
        />
        {error && <span className="text-xs font-medium text-rose-500 dark:text-rose-400">{error}</span>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
export default Textarea;