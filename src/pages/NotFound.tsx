import { ArrowLeft, Compass } from "lucide-react";
import { Link } from "react-router-dom";

import AnimatedBackground from "../components/effects/AnimatedBackground";
import SectionGlow from "../components/effects/SectionGlow";

const NotFound = () => (
  <main className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-slate-50 px-6 py-20 dark:bg-slate-950">
    <AnimatedBackground />

    <SectionGlow
      size={380}
      color="blue"
      className="left-1/2 top-1/3 -translate-x-1/2 opacity-15"
    />

    <div className="relative z-10 max-w-md text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 text-blue-600 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-400">
        <Compass size={30} />
      </div>

      <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-cyan-400">
        Error 404
      </p>

      <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
        Page not found
      </h1>

      <p className="mt-4 leading-7 text-slate-600 dark:text-slate-400">
        The page you're looking for doesn't exist or has moved.
      </p>

      <Link
        to="/"
        className="mt-8 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-7 py-3 font-semibold text-white transition hover:bg-blue-600 dark:bg-white dark:text-slate-950 dark:hover:bg-cyan-400"
      >
        <ArrowLeft size={18} />
        Back to home
      </Link>
    </div>
  </main>
);

export default NotFound;