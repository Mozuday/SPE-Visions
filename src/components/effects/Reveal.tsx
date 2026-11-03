import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  distance?: number;
}

const Reveal = ({
  children,
  className = "",
  delay = 0,
  direction = "up",
  distance = 50,
}: RevealProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMotion) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry], obs) => {
        if (!entry.isIntersecting) return;

        setIsVisible(true);
        obs.unobserve(entry.target);
      },
      {
        threshold: 0.15,
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const transforms = {
    up: `translateY(${distance}px)`,
    down: `translateY(-${distance}px)`,
    left: `translateX(${distance}px)`,
    right: `translateX(-${distance}px)`,
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translate3d(0,0,0)" : transforms[direction],
        transition: `opacity .8s ease, transform .8s cubic-bezier(.22,.61,.36,1) ${delay}ms`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
};

export default Reveal;