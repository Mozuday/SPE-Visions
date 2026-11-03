type StatProps = {
  value: string | number;
  label: string;
};

const Stat = ({ value, label }: StatProps) => (
  <div className="border-l border-slate-200 pl-4 dark:border-slate-800">
    <p className="tabular font-mono text-2xl font-semibold text-slate-900 dark:text-white">
      {value}
    </p>

    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{label}</p>
  </div>
);

export default Stat;