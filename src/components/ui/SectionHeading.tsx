import type { ReactNode } from "react";

import Eyebrow from "./Eyebrow";

type SectionHeadingProps = {
  index?: string;
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
};

const SectionHeading = ({
  index,
  eyebrow,
  title,
  description,
  action,
}: SectionHeadingProps) => (
  <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
    <div className="max-w-2xl">
      <Eyebrow index={index} label={eyebrow} />

      <h2 className="mt-3 text-3xl font-semibold text-slate-900 md:text-4xl dark:text-white">
        {title}
      </h2>

      {description && (
        <p className="mt-4 leading-7 text-slate-600 dark:text-slate-400">
          {description}
        </p>
      )}
    </div>

    {action}
  </div>
);

export default SectionHeading;