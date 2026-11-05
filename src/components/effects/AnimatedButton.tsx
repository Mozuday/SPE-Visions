import type { ButtonHTMLAttributes, ReactNode } from "react";

interface AnimatedButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  className?: string;
}

const AnimatedButton = ({
  children,
  className = "",
  ...props
}: AnimatedButtonProps) => {
  return (
    <button
      {...props}
      className={`
        group
        relative
        inline-flex
        items-center
        justify-center
        overflow-hidden
        rounded-xl
        bg-slate-900
        px-6
        py-3
        text-sm
        font-semibold
        text-white
        transition-all
        duration-300
        hover:-translate-y-0.5
        hover:bg-blue-600
        hover:shadow-lg
        hover:shadow-blue-500/20
        dark:bg-white
        dark:text-slate-950
        dark:hover:bg-cyan-400
        ${className}
      `}
    >
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>

      <span
        aria-hidden="true"
        className="
          absolute
          inset-0
          -translate-x-full
          bg-gradient-to-r
          from-transparent
          via-white/15
          to-transparent
          transition-transform
          duration-700
          group-hover:translate-x-full
        "
      />
    </button>
  );
};

export default AnimatedButton;