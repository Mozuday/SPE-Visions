import { lazy, Suspense } from "react";

const ElectricLines = lazy(() => import("./ElectricLines"));
const FloatingParticles = lazy(() => import("./FloatingParticles"));
const GridBackground = lazy(() => import("./GridBackground"));
const GlowBackground = lazy(() => import("./GlowBackground"));

interface AnimatedBackgroundProps {
  className?: string;
  showGrid?: boolean;
  showGlow?: boolean;
  showParticles?: boolean;
  showElectricLines?: boolean;
}

const AnimatedBackground = ({
  className = "",
  showGrid = true,
  showGlow = true,
  showParticles = true,
  showElectricLines = true,
}: AnimatedBackgroundProps) => {
  return (
    <div
      aria-hidden="true"
      className={`
        pointer-events-none
        absolute
        inset-0
        overflow-hidden
        ${className}
      `}
    >
      {showGlow && (
        <Suspense fallback={null}>
          <GlowBackground />
        </Suspense>
      )}

      {showGrid && (
        <Suspense fallback={null}>
          <GridBackground />
        </Suspense>
      )}

      {showElectricLines && (
        <Suspense fallback={null}>
          <ElectricLines />
        </Suspense>
      )}

      {showParticles && (
        <Suspense fallback={null}>
          <FloatingParticles />
        </Suspense>
      )}
    </div>
  );
};

export default AnimatedBackground;