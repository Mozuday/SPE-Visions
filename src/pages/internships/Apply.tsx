import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CalendarClock,
  CheckCircle,
  Clock3,
  Loader2,
  Send,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

import { supabase } from "../../lib/supabase";
import { uploadResume } from "../../lib/cloudinary";
import type { Tables } from "../../types/supabase";
import { isValidEmail, isValidPhone } from "../../utils/validators";

import Badge from "../../components/ui/Badge";
import Blueprint from "../../components/ui/Blueprint";
import Container from "../../components/ui/Container";
import Eyebrow from "../../components/ui/Eyebrow";
import Reveal from "../../components/effects/Reveal";

type Internship = Tables<"internships">;

type ApplicationForm = {
  internshipId: string;
  fullName: string;
  email: string;
  phone: string;
  college: string;
  education: string;
  experience: string;
  message: string;
  /*
   * Honeypot: hidden from real users. Bots tend to fill every
   * input, so any value here means the submission is spam.
   */
  website: string;
};

const initialForm: ApplicationForm = {
  internshipId: "",
  fullName: "",
  email: "",
  phone: "",
  college: "",
  education: "",
  experience: "",
  message: "",
  website: "",
};

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white";

const labelClass =
  "mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300";

const getErrorCode = (err: unknown): string | undefined => {
  if (err && typeof err === "object" && "code" in err) {
    return String((err as { code: unknown }).code);
  }

  return undefined;
};

const isClosed = (internship: Internship) => {
  if (!internship.deadline) return false;

  const end = new Date(`${internship.deadline}T23:59:59`);

  return !Number.isNaN(end.getTime()) && end.getTime() < Date.now();
};

const formatDeadline = (value: string) => {
  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const Apply = () => {
  const [searchParams] = useSearchParams();
  const requestedSlug = searchParams.get("internship");

  const [internships, setInternships] = useState<Internship[]>([]);
  const [loadingInternships, setLoadingInternships] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [form, setForm] = useState<ApplicationForm>(initialForm);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // =========================================================
  // Load open internships
  // =========================================================

  useEffect(() => {
    let mounted = true;

    const loadInternships = async () => {
      try {
        setLoadingInternships(true);
        setLoadError(null);

        const { data, error: fetchError } = await supabase
          .from("internships")
          .select("*")
          .eq("is_published", true)
          .order("created_at", { ascending: false });

        if (fetchError) {
          throw fetchError;
        }

        if (!mounted) return;

        const open = (data ?? []).filter((item) => !isClosed(item));

        setInternships(open);

        // Preselect the internship the visitor came from
        const requested = open.find((item) => item.slug === requestedSlug);

        if (requested) {
          setForm((current) => ({
            ...current,
            internshipId: requested.id,
          }));
        }
      } catch (err) {
        console.error("Failed to load internships:", err);

        if (mounted) {
          setLoadError(
            "Unable to load internships right now. Please try again later."
          );
        }
      } finally {
        if (mounted) {
          setLoadingInternships(false);
        }
      }
    };

    void loadInternships();

    return () => {
      mounted = false;
    };
  }, [requestedSlug]);

  const selectedInternship = useMemo(
    () => internships.find((item) => item.id === form.internshipId) ?? null,
    [internships, form.internshipId]
  );

  // =========================================================
  // Handlers
  // =========================================================

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) {
      setError(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (submitting) return;

    setError(null);

    // Honeypot tripped: pretend it worked, store nothing
    if (form.website) {
      setSubmitted(true);
      return;
    }

    const fullName = form.fullName.trim();
    const email = form.email.trim().toLowerCase();
    const phone = form.phone.trim();
    const message = form.message.trim();

    if (!form.internshipId) {
      setError("Please select an internship.");
      return;
    }

    if (fullName.length < 2) {
      setError("Please enter your full name.");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!isValidPhone(phone)) {
      setError("Please enter a valid phone number.");
      return;
    }

    if (!form.education.trim()) {
      setError("Please tell us your education.");
      return;
    }

    if (message.length < 20) {
      setError("Please write at least a couple of sentences about yourself.");
      return;
    }

    /*
     * Extra details have no dedicated columns yet, so they are
     * stored as labelled lines at the top of cover_note.
     */
    const coverNote = [
      `College: ${form.college.trim() || "-"}`,
      `Education: ${form.education.trim()}`,
      `Experience: ${form.experience.trim() || "-"}`,
      "",
      message,
    ].join("\n");

    try {
      setSubmitting(true);

      /*
       * The resume is stored privately; only its id is saved.
       * Admins open it through a short-lived signed link.
       */
      const resumeId = resumeFile ? await uploadResume(resumeFile) : null;

      /*
       * No .select() here: anonymous visitors may insert but
       * are not allowed to read applications back.
       */
      const { error: insertError } = await supabase
        .from("internship_applications")
        .insert({
          internship_id: form.internshipId,
          full_name: fullName,
          email,
          phone,
          resume_url: resumeId,
          cover_note: coverNote,
        });

      if (insertError) {
        throw insertError;
      }

      setSubmitted(true);
    } catch (err) {
      console.error("Failed to submit application:", err);

      if (getErrorCode(err) === "23505") {
        setError(
          "You have already applied for this internship with this email address."
        );
      } else if (err instanceof Error && resumeFile && !getErrorCode(err)) {
        // Upload helper errors are already user-friendly
        setError(err.message);
      } else {
        setError(
          "Something went wrong submitting your application. Please try again."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  // =========================================================
  // Success
  // =========================================================

  if (submitted) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center px-6">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
            <CheckCircle size={26} />
          </div>

          <h1 className="mt-5 text-2xl font-semibold text-slate-900 dark:text-white">
            Application submitted
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
            Thank you for applying
            {selectedInternship ? (
              <>
                {" "}
                for{" "}
                <span className="font-semibold text-slate-900 dark:text-white">
                  {selectedInternship.title}
                </span>
              </>
            ) : null}
            . We have received your application and will review your details.
          </p>

          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/internships"
              className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-400"
            >
              Back to internships
            </Link>

            <Link
              to="/"
              className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900"
            >
              Go home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // =========================================================
  // Form
  // =========================================================

  return (
    <main className="relative">
      <div className="bg-hero-glow absolute inset-x-0 top-0 h-[360px] overflow-hidden">
        <Blueprint />
      </div>

      <Container narrow className="relative py-10 md:py-14">
        <Link
          to="/internships"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          <ArrowLeft size={15} />
          All internships
        </Link>

        <Reveal>
          <Eyebrow label="Internship application" className="mt-8" />

          <h1 className="mt-3 text-3xl font-semibold leading-tight text-slate-950 md:text-4xl dark:text-white">
            Start your internship journey
          </h1>

          <p className="mt-4 leading-7 text-slate-600 dark:text-slate-400">
            Fill in your details below. Our team will review your application
            and contact you about the next steps.
          </p>
        </Reveal>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="mt-8 space-y-6 rounded-xl border border-slate-200 bg-white p-6 md:p-8 dark:border-slate-800 dark:bg-slate-900"
        >
          {loadError && (
            <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              {loadError}
            </div>
          )}

          {error && (
            <div
              role="alert"
              aria-live="polite"
              className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300"
            >
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          {/* Internship */}
          <div>
            <label htmlFor="internshipId" className={labelClass}>
              Internship *
            </label>

            {loadingInternships ? (
              <div className="flex items-center gap-3 rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-500 dark:border-slate-700">
                <Loader2 size={16} className="animate-spin" />
                Loading internships...
              </div>
            ) : internships.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-300 px-4 py-4 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                No internships are open for applications right now. Please
                check back soon.
              </div>
            ) : (
              <select
                id="internshipId"
                name="internshipId"
                value={form.internshipId}
                onChange={handleChange}
                required
                disabled={submitting}
                className={inputClass}
              >
                <option value="">Select an internship</option>

                {internships.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                  </option>
                ))}
              </select>
            )}

            {selectedInternship && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {selectedInternship.duration && (
                  <Badge>
                    <Clock3 size={12} />
                    {selectedInternship.duration}
                  </Badge>
                )}

                {selectedInternship.deadline && (
                  <Badge>
                    <CalendarClock size={12} />
                    Apply by {formatDeadline(selectedInternship.deadline)}
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* About you */}
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label htmlFor="fullName" className={labelClass}>
                Full name *
              </label>

              <input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Your full name"
                required
                disabled={submitting}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="email" className={labelClass}>
                Email address *
              </label>

              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                disabled={submitting}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="phone" className={labelClass}>
                Phone number *
              </label>

              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="+91 XXXXX XXXXX"
                required
                disabled={submitting}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="education" className={labelClass}>
                Education *
              </label>

              <input
                id="education"
                name="education"
                type="text"
                value={form.education}
                onChange={handleChange}
                placeholder="B.Tech, BCA, MCA, etc."
                required
                disabled={submitting}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="college" className={labelClass}>
                College / institution
              </label>

              <input
                id="college"
                name="college"
                type="text"
                value={form.college}
                onChange={handleChange}
                placeholder="Where do you study?"
                disabled={submitting}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="experience" className={labelClass}>
                Previous experience
              </label>

              <input
                id="experience"
                name="experience"
                type="text"
                value={form.experience}
                onChange={handleChange}
                placeholder="Projects, skills, internships"
                disabled={submitting}
                className={inputClass}
              />
            </div>
          </div>

          {/* Resume */}
          <div>
            <label htmlFor="resume" className={labelClass}>
              Resume (optional)
            </label>

            <input
              id="resume"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(event) =>
                setResumeFile(event.target.files?.[0] ?? null)
              }
              disabled={submitting}
              className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:font-semibold file:text-brand-700 hover:file:bg-brand-100 dark:text-slate-300 dark:file:bg-brand-500/10 dark:file:text-brand-300"
            />

            <p className="mt-2 text-xs text-slate-500">
              PDF or Word, up to 5 MB. Only our team can open it.
            </p>
          </div>

          {/* Honeypot: invisible to real users */}
          <div
            aria-hidden="true"
            className="absolute left-[-9999px] h-0 w-0 overflow-hidden"
          >
            <label htmlFor="website">Website</label>

            <input
              id="website"
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={form.website}
              onChange={handleChange}
            />
          </div>

          {/* Message */}
          <div>
            <label htmlFor="message" className={labelClass}>
              Tell us about yourself *
            </label>

            <textarea
              id="message"
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Your interests, goals and why you want to join this internship."
              rows={6}
              required
              disabled={submitting}
              className={`${inputClass} resize-none`}
            />
          </div>

          <div className="border-t border-slate-200 pt-6 dark:border-slate-800">
            <button
              type="submit"
              disabled={
                submitting || loadingInternships || internships.length === 0
              }
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto dark:bg-brand-500 dark:hover:bg-brand-400"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit application
                  <Send size={16} />
                </>
              )}
            </button>
          </div>
        </form>
      </Container>
    </main>
  );
};

export default Apply;