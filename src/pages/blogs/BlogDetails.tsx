import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import { ArrowLeft, BookOpen, Loader2 } from "lucide-react";

import { supabase } from "../../lib/supabase";
import type { Tables } from "../../types/supabase";

import Container from "../../components/ui/Container";

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

/*
 * The page title is the only <h1>, so Markdown "#" becomes <h2>.
 */
const markdownComponents: Components = {
  h1: ({ children }) => (
    <h2 className="mt-12 text-3xl font-semibold text-slate-900 dark:text-white">
      {children}
    </h2>
  ),
  h2: ({ children }) => (
    <h2 className="mt-12 text-2xl font-semibold text-slate-900 dark:text-white">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-8 text-xl font-semibold text-slate-900 dark:text-white">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="mt-5 leading-8 text-slate-700 dark:text-slate-300">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="mt-5 list-disc space-y-2 pl-6 text-slate-700 dark:text-slate-300">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mt-5 list-decimal space-y-2 pl-6 text-slate-700 dark:text-slate-300">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="leading-7">{children}</li>,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-brand-600 underline underline-offset-4 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
    >
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="mt-6 border-l-2 border-brand-500 pl-5 italic text-slate-600 dark:text-slate-400">
      {children}
    </blockquote>
  ),
  code: ({ children }) => (
    <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-sm text-slate-800 dark:bg-slate-800 dark:text-slate-200">
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="mt-6 overflow-x-auto rounded-xl border border-slate-800 bg-slate-900 p-5 font-mono text-sm text-slate-100 [&_code]:bg-transparent [&_code]:p-0 [&_code]:text-slate-100">
      {children}
    </pre>
  ),
  img: ({ src, alt }) => (
    <img
      src={src}
      alt={alt ?? ""}
      loading="lazy"
      className="mt-6 w-full rounded-xl border border-slate-200 dark:border-slate-800"
    />
  ),
  hr: () => <hr className="my-10 border-slate-200 dark:border-slate-800" />,
};

const BlogDetails = () => {
  const { slug } = useParams<{ slug: string }>();

  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadBlog = async () => {
      if (!slug) return;

      setLoading(true);
      setNotFound(false);

      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();

      if (!mounted) return;

      if (error || !data) {
        if (error) {
          console.error("Failed to load blog:", error);
        }

        setNotFound(true);
      } else {
        setBlog(data);
      }

      setLoading(false);
    };

    void loadBlog();

    return () => {
      mounted = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
          <Loader2 size={24} className="animate-spin" />
          Loading article...
        </div>
      </main>
    );
  }

  if (notFound || !blog) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center px-6">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg border border-slate-200 text-slate-400 dark:border-slate-700">
            <BookOpen size={22} />
          </div>

          <h1 className="mt-5 text-2xl font-semibold text-slate-900 dark:text-white">
            Article not found
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
            This article doesn't exist or may have been removed.
          </p>

          <Link
            to="/blogs"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400"
          >
            <ArrowLeft size={16} />
            Back to blog
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main>
      <Container narrow className="py-10 md:py-14">
        <Link
          to="/blogs"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          <ArrowLeft size={15} />
          All articles
        </Link>

        <header className="mt-8">
          {blog.published_at && (
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-brand-600 dark:text-brand-400">
              {formatDate(blog.published_at)}
            </p>
          )}

          <h1 className="mt-3 text-4xl font-semibold leading-[1.15] text-slate-950 md:text-5xl dark:text-white">
            {blog.title}
          </h1>

          {blog.excerpt && (
            <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-400">
              {blog.excerpt}
            </p>
          )}
        </header>

        {blog.cover_image_url && (
          <img
            src={blog.cover_image_url}
            alt={blog.title}
            className="mt-10 w-full rounded-xl border border-slate-200 object-cover dark:border-slate-800"
          />
        )}

        <article className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-800">
          <ReactMarkdown components={markdownComponents}>
            {blog.content ?? ""}
          </ReactMarkdown>
        </article>
      </Container>
    </main>
  );
};

export default BlogDetails;