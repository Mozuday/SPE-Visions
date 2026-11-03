const GlowBackground = () => {
  return (
    <>
      {/* Top Left */}
      <div
        className="
          absolute
          -left-40
          -top-40
          h-[500px]
          w-[500px]
          rounded-full
          bg-blue-500/15
          blur-[120px]
          dark:bg-cyan-500/20
          animate-pulse
        "
      />

      {/* Top Right */}
      <div
        className="
          absolute
          -right-56
          top-20
          h-[600px]
          w-[600px]
          rounded-full
          bg-cyan-400/10
          blur-[160px]
          dark:bg-blue-600/20
          animate-pulse
        "
        style={{
          animationDuration: "8s",
        }}
      />

      {/* Bottom Left */}
      <div
        className="
          absolute
          bottom-0
          left-1/3
          h-[400px]
          w-[400px]
          rounded-full
          bg-indigo-500/10
          blur-[140px]
          dark:bg-cyan-500/10
          animate-pulse
        "
        style={{
          animationDuration: "10s",
        }}
      />

      {/* Bottom Right */}
      <div
        className="
          absolute
          -bottom-44
          right-0
          h-[500px]
          w-[500px]
          rounded-full
          bg-sky-500/10
          blur-[150px]
          dark:bg-blue-500/20
          animate-pulse
        "
        style={{
          animationDuration: "12s",
        }}
      />
    </>
  );
};

export default GlowBackground;