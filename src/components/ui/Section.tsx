import type { ReactNode } from "react";

import Container from "./Container";

type SectionProps = {
  children: ReactNode;
  id?: string;
  tone?: "plain" | "muted";
  bordered?: boolean;
  className?: string;
};

const Section = ({
  children,
  id,
  tone = "plain",
  bordered = true,
  className = "",
}: SectionProps) => (
  <section
    id={id}
    className={`relative py-20 md:py-28 ${
      tone === "muted" ? "bg-slate-50 dark:bg-slate-900/40" : ""
    } ${
      bordered ? "border-b border-slate-200 dark:border-slate-800" : ""
    } ${className}`}
  >
    <Container>{children}</Container>
  </section>
);

export default Section;