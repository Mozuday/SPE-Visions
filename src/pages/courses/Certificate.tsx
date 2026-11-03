import { useEffect, useState } from "react";
import {
  AlertCircle,
  Award,
  BadgeCheck,
  Loader2,
  Printer,
  Search,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { supabase } from "../../lib/supabase";
import { COMPANY } from "../../constants/company";
import { formatDate } from "../../utils/formatters";

import AuthShell from "../../components/auth/AuthShell";
import {
  inputClass,
  labelClass,
  primaryButtonClass,
} from "../../components/auth/authStyles";

type CertificateData = {
  certificate_number: string;
  issued_at: string;
  holder_name: string | null;
  course_title: string;
};

type Status = "loading" | "valid" | "invalid" | "error";

const Certificate = () => {
  const { number } = useParams<{ number: string }>();
  const navigate = useNavigate();

  const [lookup, setLookup] = useState("");
  const [data, setData] = useState<CertificateData | null>(null);
  const [status, setStatus] = useState<Status>("loading");

  // Look the certificate up (public, exact number only)
  useEffect(() => {
    if (!number) return;

    let mounted = true;

    const load = async () => {
      setStatus("loading");

      const { data: rows, error } = await supabase.rpc("verify_certificate", {
        p_number: number.trim().toUpperCase(),
      });

      if (!mounted) return;

      if (error) {
        console.error("Failed to verify certificate:", error);
        setStatus("error");
        return;
      }

      if (!rows || rows.length === 0) {
        setStatus("invalid");
        return;
      }

      setData(rows[0]);
      setStatus("valid");
    };

    void load();

    return () => {
      mounted = false;
    };
  }, [number]);

  const handleLookup = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const value = lookup.trim().toUpperCase();

    if (value) {
      navigate(`/certificate/${encodeURIComponent(value)}`);
    }
  };

  // No number: verification form
  if (!number) {
    return (
      <AuthShell
        title="Verify a certificate"
        subtitle="Enter the certificate number to check that it is genuine."
      >
        <form onSubmit={handleLookup} className="space-y-5">
          <div>
            <label htmlFor="number" className={labelClass}>
              Certificate number
            </label>

            <input
              id="number"
              type="text"
              value={lookup}
              onChange={(event) => setLookup(event.target.value)}
              placeholder="SPE-2026-XXXXXXXX"
              autoComplete="off"
              className={`${inputClass} font-mono uppercase`}
            />
          </div>

          <button type="submit" className={primaryButtonClass}>
            <Search size={16} />
            Verify
          </button>
        </form>
      </AuthShell>
    );
  }

  if (status === "loading") {
    return (
      <main className="flex min-h-[70vh] items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
          <Loader2 size={24} className="animate-spin" />
          Verifying certificate...
        </div>
      </main>
    );
  }

  if (status !== "valid" || !data) {
    return (
      <AuthShell
        title={status === "error" ? "Something went wrong" : "Not found"}
        subtitle={
          status === "error"
            ? "We couldn't check this certificate right now. Please try again."
            : "No certificate matches this number. Check it and try again."
        }
        footer={
          <Link
            to="/certificate"
            className="font-semibold text-brand-600 hover:underline dark:text-brand-400"
          >
            Try another number
          </Link>
        }
      >
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <span className="break-all font-mono">{number}</span>
        </div>
      </AuthShell>
    );
  }

  const verifyUrl = `${window.location.origin}/certificate/${data.certificate_number}`;

  return (
    <main className="py-10 print:py-0">
      <div className="mx-auto max-w-4xl px-5">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <p className="inline-flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 font-mono text-xs text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
            <BadgeCheck size={15} />
            Verified certificate
          </p>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-400"
          >
            <Printer size={16} />
            Download PDF
          </button>
        </div>

        {/* The certificate stays light in dark mode, like paper */}
        <div className="flex min-h-[460px] flex-col items-center justify-center rounded-lg border-[10px] border-double border-amber-500 bg-white p-8 text-center text-slate-900 shadow-xl sm:p-14 md:aspect-[1.414/1] print:shadow-none">
          <Award size={52} className="text-amber-500" />

          <p className="mt-4 text-sm font-semibold uppercase tracking-[0.3em] text-amber-600">
            {COMPANY.name} Academy
          </p>

          <h1 className="mt-3 font-serif text-4xl font-bold tracking-wide sm:text-5xl">
            Certificate of Completion
          </h1>

          <p className="mt-8 text-sm text-slate-500">This is to certify that</p>

          <p className="mt-3 break-words font-serif text-3xl font-semibold sm:text-4xl">
            {data.holder_name || "Student"}
          </p>

          <div className="mt-3 h-px w-48 bg-amber-400" />

          <p className="mt-5 text-sm text-slate-500">
            has successfully completed the course
          </p>

          <p className="mt-3 max-w-xl text-xl font-bold sm:text-2xl">
            {data.course_title}
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-x-12 gap-y-4 text-sm">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400">
                Issued on
              </p>
              <p className="mt-1 font-semibold">
                {formatDate(data.issued_at, "long")}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400">
                Certificate no.
              </p>
              <p className="mt-1 font-mono font-semibold">
                {data.certificate_number}
              </p>
            </div>
          </div>

          <p className="mt-8 break-all text-xs text-slate-400">
            Verify at {verifyUrl}
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500 print:hidden">
          In the print window choose "Save as PDF" as the destination.
        </p>
      </div>
    </main>
  );
};

export default Certificate;