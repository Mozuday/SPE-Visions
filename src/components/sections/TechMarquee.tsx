import Container from "../ui/Container";

/*
 * Edit this list to the tools you really use.
 */
const technologies = [
  "React",
  "TypeScript",
  "Node.js",
  "PostgreSQL",
  "Supabase",
  "Tailwind CSS",
  "React Native",
  "Vite",
  "Cloudinary",
  "Razorpay",
];

const TechMarquee = () => (
  <section className="border-b border-slate-200 py-6 dark:border-slate-800">
    <Container className="flex flex-col items-start gap-4 md:flex-row md:items-center">
      <p className="shrink-0 font-mono text-xs uppercase tracking-[0.16em] text-slate-400">
        Our toolkit
      </p>

      <div
        className="group relative flex-1 overflow-hidden"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, #000 10%, #000 90%, transparent)",
        }}
      >
        {/* The list is doubled so the loop is seamless */}
        <ul className="flex w-max animate-marquee gap-3 group-hover:[animation-play-state:paused]">
          {[...technologies, ...technologies].map((tech, index) => (
            <li
              key={`${tech}-${index}`}
              aria-hidden={index >= technologies.length}
              className="rounded-md border border-slate-200 px-3 py-1.5 font-mono text-xs text-slate-600 dark:border-slate-800 dark:text-slate-400"
            >
              {tech}
            </li>
          ))}
        </ul>
      </div>
    </Container>
  </section>
);

export default TechMarquee;