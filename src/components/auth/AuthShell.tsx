import type { ReactNode } from "react";

import Blueprint from "../ui/Blueprint";
import Reveal from "../effects/Reveal";

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
};

const AuthShell = ({ title, subtitle, children, footer }: AuthShellProps) => (
  <main className="bg-hero-glow relative flex min-h-[75vh] items-center justify-center overflow-hidden px-5 py-16">
    <Blueprint />

    <div className="relative w-full max-w-md">
      <Reveal>
        <div className="rounded-xl border border-slate-200 bg-white p-7 shadow-sm sm:p-8 dark:border-slate-800 dark:bg-slate-900">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            {title}
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            {subtitle}
          </p>

          <div className="mt-7">{children}</div>
        </div>

        {footer && (
          <div className="mt-5 text-center text-sm text-slate-600 dark:text-slate-400">
            {footer}
          </div>
        )}
      </Reveal>
    </div>
  </main>
);

export default AuthShell;