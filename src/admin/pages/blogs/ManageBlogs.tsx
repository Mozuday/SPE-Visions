import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  FileText,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import { supabase } from "../../../lib/supabase";
import useAuth from "../../../hooks/useAuth";
import type {
  Tables,
  InsertTables,
  UpdateTables,
} from "../../../types/supabase";

import ImageUpload from "../../../components/ui/ImageUpload";

type Blog = Tables<"blogs"> & {
  profiles: { full_name: string | null } | null;
};

type BlogForm = {
  title: string;
  excerpt: string;
  content: string;
  cover_image_url: string;
  is_published: boolean;
};

const emptyForm: BlogForm = {
  title: "",
  excerpt: "",
  content: "",
  cover_image_url: "",
  is_published: false,
};

const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white";

const labelClass =
  "mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300";

const createSlug = (title: string) =>
  title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const getErrorCode = (err: unknown): string | undefined => {
  if (err && typeof err === "object" && "code" in err) {
    return String((err as { code: unknown }).code);
  }

  return undefined;
};

const formatDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const ManageBlogs = () => {
  const { user } = useAuth();

  const [blogs, setBlogs] = useState<Blog[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);

  const [form, setForm] = useState<BlogForm>(emptyForm);

  // =========================================================
  // Load
  // =========================================================

  const loadBlogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("blogs")
        .select("*, profiles(full_name)")
        .order("created_at", { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setBlogs((data ?? []) as unknown as Blog[]);
    } catch (err) {
      console.error("Failed to load blogs:", err);

      setError("Couldn't load blogs. Please refresh and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBlogs();
  }, []);

  useEffect(() => {
    if (!success) return;

    const timer = setTimeout(() => setSuccess(""), 4000);

    return () => clearTimeout(timer);
  }, [success]);

  // =========================================================
  // Modal
  // =========================================================

  const updateForm = <K extends keyof BlogForm>(
    field: K,
    value: BlogForm[K]
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const openAddModal = () => {
    setEditingBlog(null);
    setForm(emptyForm);
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (blog: Blog) => {
    setEditingBlog(blog);

    setForm({
      title: blog.title,
      excerpt: blog.excerpt ?? "",
      content: blog.content ?? "",
      cover_image_url: blog.cover_image_url ?? "",
      is_published: blog.is_published,
    });

    setError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    setIsModalOpen(false);
    setEditingBlog(null);
    setForm(emptyForm);
    setError(null);
  };

  // =========================================================
  // Create / Update
  // =========================================================

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError(null);

    const title = form.title.trim();
    const content = form.content.trim();

    if (!title) {
      setError("Blog title is required.");
      return;
    }

    if (!content) {
      setError("Blog content is required.");
      return;
    }

    const slug = createSlug(title);

    if (!slug) {
      setError("Unable to generate a valid slug from this title.");
      return;
    }

    try {
      setSaving(true);

      const now = new Date().toISOString();

      if (editingBlog) {
        /*
         * Keep the slug unless the title changed, and only stamp
         * published_at the first time a post goes live.
         */
        const updateData: UpdateTables<"blogs"> = {
          title,
          slug: title === editingBlog.title ? editingBlog.slug : slug,
          excerpt: form.excerpt.trim() || null,
          content,
          cover_image_url: form.cover_image_url.trim() || null,
          is_published: form.is_published,
          published_at:
            form.is_published && !editingBlog.published_at
              ? now
              : editingBlog.published_at,
        };

        const { error: updateError } = await supabase
          .from("blogs")
          .update(updateData)
          .eq("id", editingBlog.id);

        if (updateError) throw updateError;

        setSuccess("Blog updated successfully.");
      } else {
        const insertData: InsertTables<"blogs"> = {
          title,
          slug,
          excerpt: form.excerpt.trim() || null,
          content,
          cover_image_url: form.cover_image_url.trim() || null,
          author_id: user?.id ?? null,
          is_published: form.is_published,
          published_at: form.is_published ? now : null,
        };

        const { error: insertError } = await supabase
          .from("blogs")
          .insert(insertData);

        if (insertError) throw insertError;

        setSuccess("Blog created successfully.");
      }

      setIsModalOpen(false);
      setEditingBlog(null);
      setForm(emptyForm);

      await loadBlogs();
    } catch (err) {
      console.error("Failed to save blog:", err);

      setError(
        getErrorCode(err) === "23505"
          ? "A blog with a very similar title already exists. Try a slightly different title."
          : "Something went wrong saving this blog. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // Delete
  // =========================================================

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this blog? This can't be undone."
    );

    if (!confirmed) return;

    const { error: deleteError } = await supabase
      .from("blogs")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Failed to delete blog:", deleteError);
      setError("Couldn't delete this blog. Please try again.");
      return;
    }

    setBlogs((current) => current.filter((blog) => blog.id !== id));
    setSuccess("Blog deleted successfully.");
  };

  // =========================================================
  // Publish / Unpublish
  // =========================================================

  const togglePublished = async (blog: Blog) => {
    const nextValue = !blog.is_published;

    const publishedAt =
      nextValue && !blog.published_at
        ? new Date().toISOString()
        : blog.published_at;

    // Optimistic update, reverted if the server refuses
    setBlogs((current) =>
      current.map((item) =>
        item.id === blog.id
          ? { ...item, is_published: nextValue, published_at: publishedAt }
          : item
      )
    );

    const { error: toggleError } = await supabase
      .from("blogs")
      .update({ is_published: nextValue, published_at: publishedAt })
      .eq("id", blog.id);

    if (toggleError) {
      console.error("Failed to toggle published state:", toggleError);

      setBlogs((current) =>
        current.map((item) => (item.id === blog.id ? blog : item))
      );

      setError("Couldn't update publish status. Please try again.");
    }
  };

  // =========================================================
  // UI
  // =========================================================

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
          <Loader2 size={24} className="animate-spin" />
          <span>Loading blogs...</span>
        </div>
      </div>
    );
  }

  const publishedCount = blogs.filter((blog) => blog.is_published).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Manage Blogs
          </h1>

          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Create, edit and manage your company blog posts.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          <Plus size={20} />
          Create Blog
        </button>
      </div>

      {success && (
        <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-700 dark:border-green-900/50 dark:bg-green-950/30 dark:text-green-300">
          <CheckCircle size={20} />
          <span>{success}</span>
        </div>
      )}

      {error && !isModalOpen && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Total Blogs
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
            {blogs.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Published
          </p>

          <p className="mt-2 text-3xl font-bold text-green-600">
            {publishedCount}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">Drafts</p>

          <p className="mt-2 text-3xl font-bold text-orange-500">
            {blogs.length - publishedCount}
          </p>
        </div>
      </div>

      {/* Blog List */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        {blogs.length === 0 ? (
          <div className="p-12 text-center">
            <FileText size={40} className="mx-auto text-slate-400" />

            <p className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
              No blogs found
            </p>

            <p className="mt-2 text-slate-500 dark:text-slate-400">
              Create your first blog post to get started.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600 dark:text-slate-300">
                    Blog
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600 dark:text-slate-300">
                    Author
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600 dark:text-slate-300">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-600 dark:text-slate-300">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {blogs.map((blog) => (
                  <tr
                    key={blog.id}
                    className="transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <td className="px-6 py-5">
                      <div className="max-w-md">
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {blog.title}
                        </p>

                        {blog.excerpt && (
                          <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                            {blog.excerpt}
                          </p>
                        )}

                        <p className="mt-2 text-xs text-slate-400">
                          {formatDate(blog.created_at)} · /{blog.slug}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-5 text-sm text-slate-600 dark:text-slate-300">
                      {blog.profiles?.full_name || "SPE Visions"}
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          blog.is_published
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                            : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
                        }`}
                      >
                        {blog.is_published ? "Published" : "Draft"}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => void togglePublished(blog)}
                          title={
                            blog.is_published ? "Unpublish Blog" : "Publish Blog"
                          }
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800"
                        >
                          {blog.is_published ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => openEditModal(blog)}
                          title="Edit Blog"
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20"
                        >
                          <Pencil size={18} />
                        </button>

                        <button
                          type="button"
                          onClick={() => void handleDelete(blog.id)}
                          title="Delete Blog"
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 p-6 dark:border-slate-800">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {editingBlog ? "Edit Blog" : "Create Blog"}
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Add content that will appear on your website.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed dark:hover:bg-slate-800"
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 p-6">
              {error && (
                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Title */}
              <div>
                <label htmlFor="blog-title" className={labelClass}>
                  Blog Title
                </label>

                <input
                  id="blog-title"
                  type="text"
                  value={form.title}
                  onChange={(event) => updateForm("title", event.target.value)}
                  placeholder="Why Every Business Needs a Professional Website"
                  required
                  disabled={saving}
                  className={inputClass}
                />
              </div>

              {/* Cover */}
              <ImageUpload
                label="Cover Image"
                value={form.cover_image_url}
                onChange={(url) => updateForm("cover_image_url", url)}
                folder="blogs"
                disabled={saving}
              />

              {/* Excerpt */}
              <div>
                <label htmlFor="blog-excerpt" className={labelClass}>
                  Short Description
                </label>

                <textarea
                  id="blog-excerpt"
                  value={form.excerpt}
                  onChange={(event) =>
                    updateForm("excerpt", event.target.value)
                  }
                  placeholder="A one or two sentence summary shown on the blog list..."
                  rows={3}
                  disabled={saving}
                  className={`${inputClass} resize-none`}
                />
              </div>

              {/* Content */}
              <div>
                <label htmlFor="blog-content" className={labelClass}>
                  Blog Content
                </label>

                <textarea
                  id="blog-content"
                  value={form.content}
                  onChange={(event) =>
                    updateForm("content", event.target.value)
                  }
                  placeholder="Write your complete blog content..."
                  rows={12}
                  required
                  disabled={saving}
                  className={`${inputClass} resize-y font-mono text-sm`}
                />

                <p className="mt-2 text-xs text-slate-500">
                  Markdown is supported: # Heading, **bold**, - lists,
                  [links](https://...).
                </p>
              </div>

              {/* Publish */}
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                <input
                  type="checkbox"
                  checked={form.is_published}
                  onChange={(event) =>
                    updateForm("is_published", event.target.checked)
                  }
                  disabled={saving}
                  className="h-5 w-5 accent-blue-600"
                />

                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    Publish Blog
                  </p>

                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Published blogs will be visible on the public website.
                  </p>
                </div>
              </label>

              {/* Actions */}
              <div className="flex justify-end gap-3 border-t border-slate-200 pt-6 dark:border-slate-800">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-60 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && <Loader2 size={18} className="animate-spin" />}
                  {saving
                    ? "Saving..."
                    : editingBlog
                      ? "Update Blog"
                      : "Create Blog"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBlogs;