import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  radius: number;
  speed: number;
  opacity: number;
  direction: number;
};

const FloatingParticles = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    let particles: Particle[] = [];
    let animationId = 0;

    const isDark = () =>
      document.documentElement.classList.contains("dark");

    const resize = () => {
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      createParticles();
    };

    const createParticles = () => {
      const count = Math.max(25, Math.floor(width / 50));

      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 0.8 + Math.random() * 2.2,
        speed: 0.15 + Math.random() * 0.35,
        opacity: 0.15 + Math.random() * 0.35,
        direction: Math.random() * Math.PI * 2,
      }));
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      const dark = isDark();

      particles.forEach((particle) => {
        particle.y -= particle.speed;
        particle.x += Math.sin(particle.direction) * 0.2;

        if (particle.y < -10) {
          particle.y = height + 10;
          particle.x = Math.random() * width;
        }

        const gradient = ctx.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          particle.radius * 8
        );

        gradient.addColorStop(
          0,
          dark
            ? `rgba(34,211,238,${particle.opacity})`
            : `rgba(37,99,235,${particle.opacity})`
        );

        gradient.addColorStop(1, "rgba(0,0,0,0)");

        ctx.fillStyle = gradient;

        ctx.beginPath();
        ctx.arc(
          particle.x,
          particle.y,
          particle.radius * 8,
          0,
          Math.PI * 2
        );
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = dark
          ? "rgba(255,255,255,.8)"
          : "rgba(37,99,235,.9)";

        ctx.arc(
          particle.x,
          particle.y,
          particle.radius,
          0,
          Math.PI * 2
        );
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    };

    resize();
    animate();

    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
};

export default FloatingParticles;