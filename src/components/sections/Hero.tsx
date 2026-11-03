import { ArrowRight, Database, Globe, Rocket } from "lucide-react";

import { ButtonLink } from "../ui/Button";
import Blueprint from "../ui/Blueprint";
import Container from "../ui/Container";
import Eyebrow from "../ui/Eyebrow";
import Reveal from "../effects/Reveal";

import TerminalDemo from "./TerminalDemo";

const capabilities = [
  "Web",
  "Apps",
  "Software",
  "Consulting",
  "Courses",
  "Internships",
];

/* Decorative chips that drift around the terminal (desktop only) */
const chips = [
  { label: "Frontend", icon: Globe, position: "-left-6 -top-4", delay: "0s" },
  { label: "Database", icon: Database, position: "-right-4 top-1/2", delay: "1.5s" },
  { label: "Deploy", icon: Rocket, position: "-bottom-4 left-10", delay: "3s" },
];

const Hero = () => (
  <section className="bg-hero-glow relative overflow-hidden border-b border-slate-200 dark:border-slate-800">
    <Blueprint />

    <Container className="relative py-16 md:py-24">
      <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Copy */}
        <div>
          <Reveal>
            <p className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white/70 px-3 py-1.5 font-mono text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              Digital engineering studio
            </p>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="mt-5 text-4xl font-semibold leading-[1.1] text-slate-950 sm:text-5xl lg:text-6xl dark:text-white">
              Engineering digital products{" "}
              <span className="animate-gradient bg-gradient-to-r from-brand-600 via-brand-400 to-brand-600 bg-[length:200%_auto] bg-clip-text text-transparent">
                that scale.
              </span>
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600 dark:text-slate-400">
              SPE Visions builds websites, applications and software systems
              for businesses that need more than a template, and trains
              developers through real projects.
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink to="/contact" className="group">
                Let's build
                <ArrowRight
                  size={16}
                  className="transition-transform duration-150 group-hover:translate-x-0.5"
                />
              </ButtonLink>

              <ButtonLink to="/services" variant="outline">
                View services
              </ButtonLink>
            </div>
          </Reveal>

          <Reveal delay={320}>
            <div className="mt-10">
              <Eyebrow label="What we do" />

              <ul className="mt-3 flex flex-wrap gap-2">
                {capabilities.map((item) => (
                  <li
                    key={item}
                    className="rounded-md border border-slate-200 bg-white/70 px-2.5 py-1 font-mono text-xs text-slate-600 transition-all duration-150 hover:-translate-y-0.5 hover:border-brand-400 hover:text-brand-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400 dark:hover:border-brand-500/60 dark:hover:text-brand-300"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>

        {/* Live terminal with floating chips */}
        <Reveal delay={200}>
          <div className="relative">
            <TerminalDemo />

            {chips.map((chip) => {
              const Icon = chip.icon;

              return (
                <div
                  key={chip.label}
                  aria-hidden="true"
                  style={{ animationDelay: chip.delay }}
                  className={`absolute ${chip.position} hidden animate-float items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-xs text-slate-700 shadow-md md:flex dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200`}
                >
                  <Icon size={14} className="text-brand-600 dark:text-brand-400" />
                  {chip.label}
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </Container>
  </section>
);

export default Hero;