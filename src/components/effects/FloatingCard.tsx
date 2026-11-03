import { useRef, useState } from "react";
import type { MouseEvent, ReactNode } from "react";

interface FloatingCardProps {
  children: ReactNode;
  className?: string;
  glow?: boolean;
  floating?: boolean;
  rotate?: boolean;
  intensity?: number;
}

const FloatingCard = ({
  children,
  className = "",
  glow = true,
  floating = true,
  rotate = true,
  intensity = 12,
}: FloatingCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const [transform, setTransform] = useState(
    "perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)"
  );

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (!rotate || !cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const rotateY =
      ((x - rect.width / 2) / rect.width) * intensity;

    const rotateX =
      -((y - rect.height / 2) / rect.height) * intensity;

    setTransform(`
      perspective(1200px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      scale3d(1.03,1.03,1.03)
    `);
  };

  const handleMouseLeave = () => {
    setTransform(
      "perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)"
    );
  };

  return (
    <>
      <style>{`
        @keyframes floating-card {
          0%,100%{
            transform:translateY(0px);
          }
          50%{
            transform:translateY(-10px);
          }
        }

        .floating-card{
          animation:floating-card 6s ease-in-out infinite;
        }

        @media (prefers-reduced-motion:reduce){
          .floating-card{
            animation:none;
          }
        }
      `}</style>

      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform,
          transformStyle: "preserve-3d",
          transition:
            "transform .18s ease, box-shadow .3s ease",
          willChange: "transform",
        }}
        className={`
          relative
          rounded-2xl
          border
          border-slate-200
          bg-white/80
          backdrop-blur-xl
          dark:border-slate-800
          dark:bg-slate-900/70

          ${
            glow
              ? "hover:shadow-[0_0_50px_rgba(34,211,238,.18)]"
              : ""
          }

          ${
            floating
              ? "floating-card"
              : ""
          }

          ${className}
        `}
      >
        {children}
      </div>
    </>
  );
};

export default FloatingCard;