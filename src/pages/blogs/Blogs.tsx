import { useEffect, useState } from "react";
import { AlertCircle, ArrowRight, FileText, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

import { supabase } from "../../lib/supabase";
import type { Tables } from "../../types/supabase";

import Blueprint from "../../components/ui/Blueprint";
import Container from "../../components/ui/Container";
import EmptyState from "../../components/ui/EmptyState";
import Eyebrow from "../../components/ui/Eyebrow";
import Section from "../../components/ui/Section";
import Reveal from "../../components/effects/Reveal";

type Blog = Tables<"blogs">;

const formatDate = (value: string | null) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const Blogs = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadBlogs = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from("blogs")
          .select(
            "id, title, slug, excerpt, cover_image_url, published_at, created_at, is_published"
          )
          .eq("is_published", true)
          .order("published_at", { ascending: false, nullsFirst: false });

        if (fetchError) {
          throw fetchError;
        }

        if (mounted) {
          setBlogs((data ?? []) as Blog[]);
        }
      } catch (err) {
        console.error("Failed to load blogs:", err);

        if (mounted) {
          setError("Unable to load articles right now. Please try again later.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void loadBlogs();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main>
      {/* Hero */}
      <section className="bg-hero-glow relative overflow-hidden border-b border-slate-200 dark:border-slate-800">
        <Blueprint />

        <Container className="relative py-14 md:py-20">
          <Reveal>
            <Eyebrow label="Blog" />

            <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.1] text-slate-950 sm:text-5xl dark:text-white">
              Insights on{" "}
              <span className="text-brand-600 dark:text-brand-400">
                technology and growth.
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-400">
              Practical articles on web development, software and building
              digital products.
            </p>
          </Reveal>
        </Container>
      </section>

      {/* Articles */}
      <Section bordered={false}>
        {loading && (
          <div className="flex items-center justify-center gap-3 text-slate-500">
            <Loader2 size={22} className="animate-spin" />
            Loading articles...
          </div>
        )}

        {!loading && error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        {!loading && !error && blogs.length === 0 && (
          <EmptyState icon={FileText} message="Articles are coming soon." />
        )}

        {!loading && !error && blogs.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog, index) => (
              <Reveal key={blog.id} delay={Math.min(index, 5) * 70}>
                <article
                  data-spotlight
                  className="spotlight group relative flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-200 hover:-translate-y-1 hover:border-brand-400 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-500/60"
                >
                  <div className="h-44 overflow-hidden border-b border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-800">
                    {blog.cover_image_url ? (
                      <img
                        src={blog.cover_image_url}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-300 dark:text-slate-600">
                        <FileText size={30} />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-6">
                    {blog.published_at && (
                      <p className="font-mono text-xs text-slate-400">
                        {formatDate(blog.published_at)}
                      </p>
                    )}

                    <h2 className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
                      {blog.title}
                    </h2>

                    {blog.excerpt && (
                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                        {blog.excerpt}
                      </p>
                    )}

                    <Link
                      to={`/blogs/${blog.slug}`}
                      className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-brand-600 after:absolute after:inset-0 after:content-[''] dark:text-brand-400"
                    >
                      Read article
                      <ArrowRight size={15} />
                    </Link>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        )}
      </Section>
    </main>
  );
};

export default Blogs;