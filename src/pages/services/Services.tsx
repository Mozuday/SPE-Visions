import { useEffect, useState } from "react";
import { AlertCircle, ArrowRight, Loader2, Wrench } from "lucide-react";
import { Link } from "react-router-dom";

import { supabase } from "../../lib/supabase";
import type { Tables } from "../../types/supabase";
import { getIcon } from "../../utils/iconMap";

import Blueprint from "../../components/ui/Blueprint";
import { ButtonLink } from "../../components/ui/Button";
import Container from "../../components/ui/Container";
import EmptyState from "../../components/ui/EmptyState";
import Eyebrow from "../../components/ui/Eyebrow";
import Section from "../../components/ui/Section";
import SectionHeading from "../../components/ui/SectionHeading";
import Reveal from "../../components/effects/Reveal";

type Service = Tables<"services">;

const steps = [
  {
    title: "Understand",
    text: "We learn your requirements, goals, users and technical challenges.",
  },
  {
    title: "Build",
    text: "We design and develop the solution using appropriate technologies and practices.",
  },
  {
    title: "Deliver",
    text: "We test, refine and deliver a reliable solution ready for real-world use.",
  },
];

const Services = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadServices = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from("services")
          .select("*")
          .eq("is_published", true)
          .order("order_index", { ascending: true });

        if (fetchError) {
          throw fetchError;
        }

        if (mounted) {
          setServices(data ?? []);
        }
      } catch (err) {
        console.error("Failed to load services:", err);

        if (mounted) {
          setError("Unable to load services right now. Please try again later.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void loadServices();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main>
      {/* Hero */}
      <section className="bg-hero-glow relative overflow-hidden border-b border-slate-200 dark:border-slate-800">
        <Blueprint />

        <Container className="relative py-14 md:py-20">
          <Reveal>
            <Eyebrow label="Our services" />

            <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.1] text-slate-950 sm:text-5xl dark:text-white">
              Complete{" "}
              <span className="text-brand-600 dark:text-brand-400">
                digital solutions.
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-400">
              We help startups, businesses and individuals turn ideas into
              reliable digital products through practical technology, thoughtful
              design and scalable development.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink to="/contact">
                Start a project
                <ArrowRight size={16} />
              </ButtonLink>

              <ButtonLink to="/portfolio" variant="outline">
                View our work
              </ButtonLink>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* Services */}
      <Section>
        <SectionHeading
          eyebrow="What we do"
          title="Technology built around your needs"
          description="From websites and mobile applications to custom software and technical support, we provide focused solutions for real business requirements."
        />

        {loading && (
          <div className="mt-12 flex items-center justify-center gap-3 text-slate-500">
            <Loader2 size={22} className="animate-spin" />
            Loading services...
          </div>
        )}

        {!loading && error && (
          <div className="mt-12 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        {!loading && !error && services.length === 0 && (
          <EmptyState
            icon={Wrench}
            message="Our services will appear here soon."
          />
        )}

        {!loading && !error && services.length > 0 && (
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {services.map((service, index) => {
              const Icon = getIcon(service.icon);

              return (
                <Reveal key={service.id} delay={Math.min(index, 5) * 70}>
                  <article
                    data-spotlight
                    className="spotlight group flex h-full flex-col rounded-xl border border-slate-200 bg-white p-6 transition-all duration-200 hover:-translate-y-1 hover:border-brand-400 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-500/60"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-brand-600 transition-colors group-hover:border-brand-400 group-hover:bg-brand-50 dark:border-slate-700 dark:text-brand-400 dark:group-hover:bg-brand-500/10">
                      <Icon size={20} strokeWidth={1.8} />
                    </div>

                    <h2 className="mt-5 text-lg font-semibold text-slate-900 dark:text-white">
                      {service.title}
                    </h2>

                    <p className="mt-2 flex-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                      {service.description}
                    </p>

                    <Link
                      to="/contact"
                      className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400"
                    >
                      Discuss your project
                      <ArrowRight size={15} />
                    </Link>
                  </article>
                </Reveal>
              );
            })}
          </div>
        )}
      </Section>

      {/* Process */}
      <Section tone="muted">
        <SectionHeading
          eyebrow="Our process"
          title="From idea to solution"
          description="A simple and transparent process focused on understanding your requirements and delivering useful technology."
        />

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <Reveal key={step.title} delay={index * 100}>
              <p className="font-mono text-xs text-slate-400">0{index + 1}</p>

              <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
                {step.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                {step.text}
              </p>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <Section bordered={false}>
        <div className="flex flex-col items-start justify-between gap-6 rounded-xl border border-slate-200 bg-white p-8 md:flex-row md:items-center dark:border-slate-800 dark:bg-slate-900">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
              Have a project in mind?
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-400">
              Tell us what you want to build, improve or fix. We'll help you
              find a practical technology solution.
            </p>
          </div>

          <ButtonLink to="/contact" className="shrink-0">
            Request a quote
            <ArrowRight size={16} />
          </ButtonLink>
        </div>
      </Section>
    </main>
  );
};

export default Services;