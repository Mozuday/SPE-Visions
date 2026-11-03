// src/components/effects/SectionGlow.tsx

type SectionGlowProps = {
  className?: string;
  size?: number;
  color?:
    | "blue"
    | "cyan"
    | "purple"
    | "pink"
    | "amber"
    | "orange"
    | "emerald"
    | "green"
    | "violet"
    | "rose"
    | "indigo";
  opacity?: number;
};

const colors = {
  blue: "bg-blue-500",
  cyan: "bg-cyan-400",
  purple: "bg-purple-500",
  pink: "bg-pink-500",
  amber: "bg-amber-500",
  orange: "bg-orange-500",
  emerald: "bg-emerald-500",
  green: "bg-green-500",
  violet: "bg-violet-500",
  rose: "bg-rose-500",
  indigo: "bg-indigo-500",
};

const SectionGlow = ({
  className = "",
  size = 420,
  color = "blue",
  opacity = 0.12,
}: SectionGlowProps) => {
  return (
    <div
      aria-hidden="true"
      className={`
        pointer-events-none
        absolute
        rounded-full
        blur-[140px]
        ${colors[color]}
        ${className}
      `}
      style={{
        width: size,
        height: size,
        opacity,
      }}
    />
  );
};

export default SectionGlow;