import { useEffect, useState } from "react";

const command = "spe new project --stack web";

const outputs = [
  "scaffolding React + TypeScript",
  "connecting database & authentication",
  "running tests",
  "deploying to production",
];

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const TerminalDemo = () => {
  // With "reduce motion" on, show the finished state straight away
  const [typed, setTyped] = useState(() =>
    prefersReducedMotion() ? command.length : 0
  );
  const [shown, setShown] = useState(() =>
    prefersReducedMotion() ? outputs.length : 0
  );

  // Type the command, one character at a time
  useEffect(() => {
    if (typed >= command.length) return;

    const timer = setTimeout(() => setTyped((value) => value + 1), 45);

    return () => clearTimeout(timer);
  }, [typed]);

  // Then reveal each output line
  useEffect(() => {
    if (typed < command.length || shown >= outputs.length) return;

    const timer = setTimeout(
      () => setShown((value) => value + 1),
      shown === 0 ? 500 : 750
    );

    return () => clearTimeout(timer);
  }, [typed, shown]);

  const finished = shown >= outputs.length;

  return (
    <div
      aria-hidden="true"
      className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex items-center gap-1.5 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
        <span className="h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
        <span className="h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
        <span className="h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
        <span className="ml-3 font-mono text-xs text-slate-400">
          spe-visions ~ build
        </span>
      </div>

      <div className="min-h-[220px] space-y-2 p-5 font-mono text-[13px] sm:text-sm">
        <p className="text-slate-700 dark:text-slate-200">
          <span className="text-brand-600 dark:text-brand-400">$</span>{" "}
          {command.slice(0, typed)}
          {typed < command.length && (
            <span className="ml-0.5 inline-block h-4 w-2 translate-y-0.5 bg-brand-500" />
          )}
        </p>

        {outputs.slice(0, shown).map((line) => (
          <p key={line} className="text-slate-600 dark:text-slate-400">
            <span className="text-emerald-600 dark:text-emerald-400">✓</span>{" "}
            {line}
          </p>
        ))}

        {finished && (
          <>
            <p className="pt-1 font-semibold text-emerald-600 dark:text-emerald-400">
              ● live and ready for users
            </p>

            <p className="text-slate-400">
              <span className="text-brand-600 dark:text-brand-400">$</span>{" "}
              <span className="animate-pulse">_</span>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default TerminalDemo;