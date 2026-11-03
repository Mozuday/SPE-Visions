import { useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  Clock3,
  Loader2,
  Mail,
  MessageCircle,
  Phone,
  Send,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";

import { supabase } from "../../lib/supabase";
import { COMPANY } from "../../constants/company";
import { isValidEmail, isValidPhone } from "../../utils/validators";

import Blueprint from "../../components/ui/Blueprint";
import Container from "../../components/ui/Container";
import Eyebrow from "../../components/ui/Eyebrow";
import Reveal from "../../components/effects/Reveal";

type ContactForm = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  /*
   * Honeypot: hidden from real users. Bots tend to fill every
   * input, so any value here means the submission is spam.
   */
  website: string;
};

const initialForm: ContactForm = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
  website: "",
};

const subjects = [
  "Website Development",
  "App Development",
  "Software Development",
  "Bug Fixing",
  "Technical Consulting",
  "Courses",
  "Internships",
  "Other",
];

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white";

const labelClass =
  "mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300";

const next = [
  {
    icon: Mail,
    title: "We review your message",
    text: "Our team reads every enquiry personally.",
  },
  {
    icon: Clock3,
    title: "We reply soon",
    text: "You'll hear back by email or phone with next steps.",
  },
  {
    icon: ShieldCheck,
    title: "Your details stay private",
    text: "We only use your information to respond to you.",
  },
];

const Contact = () => {
  const [form, setForm] = useState<ContactForm>(initialForm);

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const phoneHref = COMPANY.phone
    ? `tel:${COMPANY.phone.replace(/[^\d+]/g, "")}`
    : "";

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

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const phone = form.phone.trim();
    const message = form.message.trim();

    if (name.length < 2) {
      setError("Please enter your name.");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (phone && !isValidPhone(phone)) {
      setError("Please enter a valid phone number, or leave it blank.");
      return;
    }

    if (message.length < 10) {
      setError("Please write a little more so we can help you properly.");
      return;
    }

    try {
      setSubmitting(true);

      /*
       * No .select(): anonymous visitors may insert but are not
       * allowed to read messages back.
       */
      const { error: insertError } = await supabase
        .from("contact_messages")
        .insert({
          name,
          email,
          phone: phone || null,
          subject: form.subject || null,
          message,
        });

      if (insertError) {
        throw insertError;
      }

      setSubmitted(true);
    } catch (err) {
      console.error("Failed to send contact message:", err);

      setError("Something went wrong sending your message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center px-6">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
            <CheckCircle size={26} />
          </div>

          <h1 className="mt-5 text-2xl font-semibold text-slate-900 dark:text-white">
            Message sent
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
            Thank you for reaching out to {COMPANY.name}. We have received your
            message and will get back to you soon.
          </p>

          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/"
              className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-400"
            >
              Go home
            </Link>

            <Link
              to="/services"
              className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900"
            >
              View services
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main>
      {/* Hero */}
      <section className="bg-hero-glow relative overflow-hidden border-b border-slate-200 dark:border-slate-800">
        <Blueprint />

        <Container className="relative py-14 md:py-20">
          <Reveal>
            <Eyebrow label="Contact us" />

            <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.1] text-slate-950 sm:text-5xl dark:text-white">
              Let's build something{" "}
              <span className="text-brand-600 dark:text-brand-400">
                together.
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-400">
              Tell us about your project, question or idea. We'll review it and
              get back to you with practical next steps.
            </p>
          </Reveal>
        </Container>
      </section>

      {/* Form + info */}
      <Container className="grid gap-10 py-14 md:py-20 lg:grid-cols-[1fr_340px]">
        <Reveal>
          <form
            onSubmit={handleSubmit}
            noValidate
            className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 md:p-8 dark:border-slate-800 dark:bg-slate-900"
          >
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Send us a message
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Fields marked * are required.
              </p>
            </div>

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

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label htmlFor="name" className={labelClass}>
                  Full name *
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your name"
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
                  Phone number
                </label>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+91 XXXXX XXXXX"
                  disabled={submitting}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="subject" className={labelClass}>
                  What do you need help with?
                </label>

                <select
                  id="subject"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  disabled={submitting}
                  className={inputClass}
                >
                  <option value="">Select a topic</option>

                  {subjects.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
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

            <div>
              <label htmlFor="message" className={labelClass}>
                Message *
              </label>

              <textarea
                id="message"
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Tell us about your project or question..."
                rows={7}
                required
                disabled={submitting}
                className={`${inputClass} resize-none`}
              />
            </div>

            <div className="border-t border-slate-200 pt-5 dark:border-slate-800">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto dark:bg-brand-500 dark:hover:bg-brand-400"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send message
                    <Send size={16} />
                  </>
                )}
              </button>
            </div>
          </form>
        </Reveal>

        <Reveal delay={120}>
          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            {(COMPANY.email || COMPANY.phone || COMPANY.whatsapp) && (
              <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <p className="font-mono text-xs uppercase tracking-[0.16em] text-slate-400">
                  Reach us directly
                </p>

                <div className="mt-4 space-y-3 text-sm">
                  {COMPANY.email && (
                    <a
                      href={`mailto:${COMPANY.email}`}
                      className="flex items-center gap-3 break-all text-slate-700 transition-colors hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-400"
                    >
                      <Mail size={16} className="shrink-0" />
                      {COMPANY.email}
                    </a>
                  )}

                  {COMPANY.phone && (
                    <a
                      href={phoneHref}
                      className="flex items-center gap-3 text-slate-700 transition-colors hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-400"
                    >
                      <Phone size={16} className="shrink-0" />
                      {COMPANY.phone}
                    </a>
                  )}

                  {COMPANY.whatsapp && (
                    <a
                      href={COMPANY.whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-slate-700 transition-colors hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-400"
                    >
                      <MessageCircle size={16} className="shrink-0" />
                      WhatsApp
                    </a>
                  )}
                </div>
              </div>
            )}

            <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-slate-400">
                What happens next
              </p>

              <ul className="mt-5 space-y-5">
                {next.map((item) => {
                  const Icon = item.icon;

                  return (
                    <li key={item.title} className="flex gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-brand-600 dark:border-slate-700 dark:text-brand-400">
                        <Icon size={17} />
                      </div>

                      <div>
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                          {item.title}
                        </h3>

                        <p className="mt-0.5 text-sm leading-6 text-slate-600 dark:text-slate-400">
                          {item.text}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>
        </Reveal>
      </Container>
    </main>
  );
};

export default Contact;