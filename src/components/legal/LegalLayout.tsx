import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import Blueprint from "../ui/Blueprint";
import Container from "../ui/Container";
import Eyebrow from "../ui/Eyebrow";
import Reveal from "../effects/Reveal";

export type LegalSection = {
  title: string;
  paragraphs?: string[];
  items?: string[];
};

type LegalLayoutProps = {
  title: string;
  updated: string;
  sections: LegalSection[];
  footer?: ReactNode;
};

const linkClass =
  "text-brand-600 hover:underline dark:text-brand-400";

const LegalLayout = ({ title, updated, sections, footer }: LegalLayoutProps) => (
  <main>
    <section className="bg-hero-glow relative overflow-hidden border-b border-slate-200 dark:border-slate-800">
      <Blueprint />

      <Container narrow className="relative py-12 md:py-16">
        <Reveal>
          <Eyebrow label="Legal" />

          <h1 className="mt-3 text-4xl font-semibold text-slate-950 dark:text-white">
            {title}
          </h1>

          <p className="mt-3 font-mono text-xs text-slate-500 dark:text-slate-400">
            Last updated: {updated}
          </p>
        </Reveal>
      </Container>
    </section>

    <Container narrow className="py-14">
      <div className="space-y-10">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              {section.title}
            </h2>

            {section.paragraphs?.map((paragraph) => (
              <p
                key={paragraph}
                className="mt-4 leading-8 text-slate-700 dark:text-slate-300"
              >
                {paragraph}
              </p>
            ))}

            {section.items && (
              <ul className="mt-4 list-disc space-y-2 pl-6 leading-7 text-slate-700 dark:text-slate-300">
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      <div className="mt-14 flex flex-wrap gap-x-6 gap-y-2 border-t border-slate-200 pt-8 text-sm font-semibold dark:border-slate-800">
        {footer}

        <Link to="/contact" className={linkClass}>
          Contact us
        </Link>
      </div>
    </Container>
  </main>
);

export default LegalLayout;