import {
  ArrowRight,
  CheckCircle2,
  Code2,
  Globe,
  GraduationCap,
  Rocket,
  ShieldCheck,
  Smartphone,
  Target,
  Users,
  Wrench,
} from "lucide-react";

import { COMPANY } from "../../constants/company";

import Blueprint from "../../components/ui/Blueprint";
import { ButtonLink } from "../../components/ui/Button";
import Container from "../../components/ui/Container";
import Eyebrow from "../../components/ui/Eyebrow";
import Section from "../../components/ui/Section";
import SectionHeading from "../../components/ui/SectionHeading";
import Reveal from "../../components/effects/Reveal";

const whatWeDo = [
  {
    icon: Globe,
    title: "Websites",
    text: "Fast, responsive websites for businesses, startups and personal brands.",
  },
  {
    icon: Smartphone,
    title: "Applications",
    text: "Mobile and web applications built for reliable performance and clean experiences.",
  },
  {
    icon: Code2,
    title: "Custom software",
    text: "Software that automates operations and fits how your business actually works.",
  },
  {
    icon: Wrench,
    title: "Fixes & consulting",
    text: "Bug fixing, optimization and practical technical guidance for existing products.",
  },
  {
    icon: GraduationCap,
    title: "SPE Academy",
    text: "Project-based courses that help learners build real, job-relevant skills.",
  },
  {
    icon: Users,
    title: "Internships",
    text: "Hands-on internship programs that give students real project experience.",
  },
];

const values = [
  {
    icon: Target,
    title: "Practical first",
    text: "We choose technology that solves your problem, not technology that looks impressive.",
  },
  {
    icon: ShieldCheck,
    title: "Reliable and secure",
    text: "We build with maintainability and security in mind so products hold up as they grow.",
  },
  {
    icon: Rocket,
    title: "Built to scale",
    text: "Solutions are designed to grow with your users, your team and your ambitions.",
  },
  {
    icon: Users,
    title: "Transparent",
    text: "Clear communication and honest timelines, from the first call to delivery and beyond.",
  },
];

const process = [
  {
    title: "Understand",
    text: "We learn your goals, users and constraints before proposing anything.",
  },
  {
    title: "Build",
    text: "We design and develop the solution with regular progress you can see.",
  },
  {
    title: "Deliver & support",
    text: "We test, launch and stay available to improve and maintain what we built.",
  },
];

const expectations = [
  "Clear communication at every stage",
  "Clean, maintainable code",
  "Honest advice on the right solution",
  "Support after launch",
];

const About = () => {
  return (
    <main>
      {/* Hero */}
      <section className="bg-hero-glow relative overflow-hidden border-b border-slate-200 dark:border-slate-800">
        <Blueprint />

        <Container className="relative py-14 md:py-20">
          <Reveal>
            <Eyebrow label={`About ${COMPANY.name}`} />

            <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.1] text-slate-950 sm:text-5xl dark:text-white">
              Technology built to be{" "}
              <span className="text-brand-600 dark:text-brand-400">useful.</span>
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-400">
              {COMPANY.name} is a technology company that builds websites,
              applications and software for businesses that need more than a
              template, and trains the next generation of developers through
              real projects.
            </p>
          </Reveal>
        </Container>
      </section>

      {/* Mission */}
      <Section>
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <Reveal>
            <Eyebrow label="Our mission" />

            <h2 className="mt-3 text-3xl font-semibold text-slate-900 md:text-4xl dark:text-white">
              Make good technology accessible
            </h2>

            <p className="mt-5 leading-7 text-slate-600 dark:text-slate-400">
              Good software should not be limited to large companies. We help
              startups, small businesses and individuals turn ideas into
              reliable digital products, and we help learners gain the skills
              to build such products themselves.
            </p>

            <p className="mt-4 leading-7 text-slate-600 dark:text-slate-400">
              Every project, course and internship we run is focused on the
              same thing: practical results you can actually use.
            </p>
          </Reveal>

          <Reveal delay={120}>
            <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-slate-400">
                What you can expect
              </p>

              <ul className="mt-5 space-y-4">
                {expectations.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300"
                  >
                    <CheckCircle2
                      size={18}
                      className="mt-0.5 shrink-0 text-brand-600 dark:text-brand-400"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* What we do */}
      <Section tone="muted">
        <SectionHeading
          eyebrow="What we do"
          title="One team, building and teaching"
        />

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {whatWeDo.map((item, index) => {
            const Icon = item.icon;

            return (
              <Reveal key={item.title} delay={Math.min(index, 5) * 70}>
                <div
                  data-spotlight
                  className="spotlight h-full rounded-xl border border-slate-200 bg-white p-6 transition-all duration-200 hover:-translate-y-1 hover:border-brand-400 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-500/60"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-brand-600 dark:border-slate-700 dark:text-brand-400">
                    <Icon size={20} strokeWidth={1.8} />
                  </div>

                  <h3 className="mt-5 text-lg font-semibold text-slate-900 dark:text-white">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                    {item.text}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Section>

      {/* Values */}
      <Section>
        <SectionHeading eyebrow="Our values" title="How we work" />

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {values.map((item, index) => {
            const Icon = item.icon;

            return (
              <Reveal key={item.title} delay={index * 70}>
                <div className="flex h-full gap-4 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-950">
                    <Icon size={18} />
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {item.title}
                    </h3>

                    <p className="mt-1.5 text-sm leading-6 text-slate-600 dark:text-slate-400">
                      {item.text}
                    </p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Section>

      {/* Process */}
      <Section tone="muted">
        <SectionHeading eyebrow="Our process" title="From idea to launch" />

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {process.map((step, index) => (
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
              Let's build something together
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-400">
              Tell us what you want to build, improve or learn. We'll help you
              find a practical way forward.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <ButtonLink to="/contact">
              Start a project
              <ArrowRight size={16} />
            </ButtonLink>

            <ButtonLink to="/portfolio" variant="outline">
              View our work
            </ButtonLink>
          </div>
        </div>
      </Section>
    </main>
  );
};

export default About;