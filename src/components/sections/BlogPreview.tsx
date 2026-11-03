import { useEffect, useState } from "react";
import { ArrowRight, FileText, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

import { supabase } from "../../lib/supabase";
import type { Tables } from "../../types/supabase";

import EmptyState from "../ui/EmptyState";
import Section from "../ui/Section";
import SectionHeading from "../ui/SectionHeading";
import Reveal from "../effects/Reveal";

type Blog = Pick<
  Tables<"blogs">,
  "id" | "title" | "slug" | "excerpt" | "cover_image_url" | "published_at"
>;

const formatDate = (value: string | null) => {
  if (!value) return "";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
};

const BlogPreview = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const { data, error } = await supabase
        .from("blogs")
        .select("id, title, slug, excerpt, cover_image_url, published_at")
        .eq("is_published", true)
        .order("published_at", { ascending: false, nullsFirst: false })
        .limit(3);

      if (!mounted) return;

      if (error) {
        console.error("Failed to load blog preview:", error);
      } else {
        setBlogs(data ?? []);
      }

      setLoading(false);
    };

    void load();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Section tone="muted">
      <SectionHeading
        eyebrow="Blog"
        title="Insights on technology and building products"
        description="Practical articles on web development, software and growing a digital product."
        action={
          <Link
            to="/blogs"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400"
          >
            All articles
            <ArrowRight size={15} />
          </Link>
        }
      />

      {loading ? (
        <div className="mt-12 flex justify-center text-slate-500">
          <Loader2 size={22} className="animate-spin" />
        </div>
      ) : blogs.length === 0 ? (
        <EmptyState icon={FileText} message="Articles are coming soon." />
      ) : (
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {blogs.map((blog, index) => (
            <Reveal key={blog.id} delay={index * 80}>
              <article
                data-spotlight
                className="spotlight group relative flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-200 hover:-translate-y-1 hover:border-brand-400 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-500/60"
              >
                <div className="h-40 overflow-hidden border-b border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-800">
                  {blog.cover_image_url ? (
                    <img
                      src={blog.cover_image_url}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-300 dark:text-slate-600">
                      <FileText size={28} />
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <p className="font-mono text-xs text-slate-400">
                    {formatDate(blog.published_at)}
                  </p>

                  <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
                    {blog.title}
                  </h3>

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
  );
};

export default BlogPreview;