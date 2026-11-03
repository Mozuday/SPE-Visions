import { Code2, Compass, Rocket, Search } from "lucide-react";

import Section from "../ui/Section";
import SectionHeading from "../ui/SectionHeading";
import Reveal from "../effects/Reveal";

const steps = [
  {
    icon: Search,
    title: "Discover",
    text: "We learn your goals, users and constraints before proposing anything.",
  },
  {
    icon: Compass,
    title: "Design",
    text: "We plan the architecture and the experience, and agree the scope with you.",
  },
  {
    icon: Code2,
    title: "Build",
    text: "We develop in short cycles, so you see working progress along the way.",
  },
  {
    icon: Rocket,
    title: "Launch & support",
    text: "We test, deploy and stay available to maintain and improve the product.",
  },
];

const Process = () => (
  <Section>
    <SectionHeading
      index="02"
      eyebrow="How we work"
      title="From idea to launch in four steps"
      description="A simple, transparent process focused on understanding your requirements and delivering useful technology."
    />

    <div className="relative mt-14 grid gap-8 md:grid-cols-4">
      {/* Connector line behind the step numbers (desktop) */}
      <div
        aria-hidden="true"
        className="absolute left-0 right-0 top-5 hidden h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent md:block dark:via-slate-700"
      />

      {steps.map((step, index) => {
        const Icon = step.icon;

        return (
          <Reveal key={step.title} delay={index * 120}>
            <div className="relative">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-brand-600 dark:border-slate-700 dark:bg-slate-900 dark:text-brand-400">
                <Icon size={18} />
              </div>

              <p className="mt-5 font-mono text-xs text-slate-400">
                0{index + 1}
              </p>

              <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
                {step.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                {step.text}
              </p>
            </div>
          </Reveal>
        );
      })}
    </div>
  </Section>
);

export default Process;