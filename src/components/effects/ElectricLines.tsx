import { useEffect, useRef } from "react";

type Point = {
  x: number;
  y: number;
};

const ElectricLines = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let animationFrame = 0;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const nodes: Point[] = [];

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      nodes.length = 0;

      const spacing = 180;

      for (let y = 80; y < height; y += spacing) {
        for (let x = 80; x < width; x += spacing) {
          nodes.push({
            x: x + (Math.random() * 60 - 30),
            y: y + (Math.random() * 60 - 30),
          });
        }
      }
    };

    resize();

    let pulse = 0;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      pulse += 0.01;

      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(0,180,255,.15)";

      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];

        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];

          const dist = Math.hypot(a.x - b.x, a.y - b.y);

          if (dist > 230) continue;

          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();

          const t = (Math.sin(pulse * 2 + i * 0.4 + j) + 1) / 2;

          const px = a.x + (b.x - a.x) * t;
          const py = a.y + (b.y - a.y) * t;

          const glow = ctx.createRadialGradient(px, py, 0, px, py, 12);
          glow.addColorStop(0, "rgba(0,255,255,.9)");
          glow.addColorStop(1, "rgba(0,255,255,0)");

          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(px, py, 12, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = "#67e8f9";
          ctx.beginPath();
          ctx.arc(px, py, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationFrame = requestAnimationFrame(draw);
    };

    draw();

    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-0 opacity-80"
    />
  );
};

export default ElectricLines;