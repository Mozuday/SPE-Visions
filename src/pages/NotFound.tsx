import { ArrowLeft, Compass } from "lucide-react";
import { Link } from "react-router-dom";

const NotFound = () => (
  <main className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-slate-50 px-6 py-20 dark:bg-slate-950">

    {/* Blueprint grid */}
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 opacity-40 dark:opacity-20"
      style={{
        backgroundImage:
          "linear-gradient(to right, rgba(100,116,139,0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(100,116,139,0.12) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }}
    />

    <div className="relative z-10 max-w-md text-center">

      {/* Icon */}
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400">
        <Compass size={30} />
      </div>

      {/* Error label */}
      <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
        Error 404
      </p>

      {/* Heading */}
      <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
        Page not found
      </h1>

      {/* Description */}
      <p className="mt-4 leading-7 text-slate-600 dark:text-slate-400">
        The page you're looking for doesn't exist or may have been moved.
      </p>

      {/* Home button */}
      <Link
        to="/"
        className="mt-8 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-7 py-3 font-semibold text-white transition hover:bg-blue-600 dark:bg-white dark:text-slate-950 dark:hover:bg-blue-400"
      >
        <ArrowLeft size={18} />
        Back to home
      </Link>

    </div>
  </main>
);

export default NotFound;
