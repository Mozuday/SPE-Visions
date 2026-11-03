type EyebrowProps = {
  label: string;
  index?: string;
  className?: string;
};

const Eyebrow = ({ label, index, className = "" }: EyebrowProps) => (
  <p
    className={`font-mono text-xs font-medium uppercase tracking-[0.16em] text-brand-600 dark:text-brand-400 ${className}`}
  >
    {index && <span className="mr-2 text-slate-400">{index} /</span>}
    {label}
  </p>
);

export default Eyebrow;