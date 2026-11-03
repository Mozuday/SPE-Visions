import { useEffect } from "react";

/*
 * One listener for the whole site: elements marked data-spotlight
 * get --mx / --my set to the cursor position, which the
 * `spotlight` utility uses.
 */
const SpotlightListener = () => {
  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      const el = (event.target as HTMLElement | null)?.closest<HTMLElement>(
        "[data-spotlight]"
      );

      if (!el) return;

      const rect = el.getBoundingClientRect();

      el.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      el.style.setProperty("--my", `${event.clientY - rect.top}px`);
    };

    document.addEventListener("pointermove", onMove, { passive: true });

    return () => document.removeEventListener("pointermove", onMove);
  }, []);

  return null;
};

export default SpotlightListener;