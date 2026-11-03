const GridBackground = () => {
  return (
    <>
      {/* Grid */}
      <div
        className="
          absolute inset-0
          opacity-30
          dark:opacity-15

          bg-[linear-gradient(to_right,#cbd5e1_1px,transparent_1px),
          linear-gradient(to_bottom,#cbd5e1_1px,transparent_1px)]

          dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),
          linear-gradient(to_bottom,#1e293b_1px,transparent_1px)]

          bg-[size:60px_60px]
        "
      />

      {/* Fade */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white dark:to-slate-950" />

      {/* Side Fade */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-transparent to-white/90 dark:from-slate-950 dark:via-transparent dark:to-slate-950" />
    </>
  );
};

export default GridBackground;