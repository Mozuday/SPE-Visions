import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Eye,
  EyeOff,
  FolderKanban,
  ImageIcon,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import { supabase } from "../../../lib/supabase";
import type {
  Tables,
  InsertTables,
  UpdateTables,
} from "../../../types/supabase";

import ImageUpload from "../../../components/ui/ImageUpload";

type Project = Tables<"portfolio_projects">;

type ProjectForm = {
  title: string;
  description: string;
  cover_image_url: string;
  project_url: string;
  tags: string;
  order_index: string;
  is_published: boolean;
};

const emptyForm: ProjectForm = {
  title: "",
  description: "",
  cover_image_url: "",
  project_url: "",
  tags: "",
  order_index: "0",
  is_published: true,
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

const ManagePortfolio = () => {
  const [projects, setProjects] = useState<Project[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const [form, setForm] = useState<ProjectForm>(emptyForm);

  // =========================================================
  // Load
  // =========================================================

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("portfolio_projects")
        .select("*")
        .order("order_index", { ascending: true })
        .order("created_at", { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setProjects(data ?? []);
    } catch (err) {
      console.error("Failed to load projects:", err);

      setError("Couldn't load projects. Please refresh and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProjects();
  }, []);

  useEffect(() => {
    if (!success) return;

    const timer = setTimeout(() => setSuccess(""), 4000);

    return () => clearTimeout(timer);
  }, [success]);

  // =========================================================
  // Modal
  // =========================================================

  const updateForm = <K extends keyof ProjectForm>(
    field: K,
    value: ProjectForm[K]
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const openAddModal = () => {
    setEditingProject(null);
    setForm({ ...emptyForm, order_index: String(projects.length) });
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (project: Project) => {
    setEditingProject(project);

    setForm({
      title: project.title,
      description: project.description ?? "",
      cover_image_url: project.cover_image_url ?? "",
      project_url: project.project_url ?? "",
      tags: (project.tags ?? []).join(", "),
      order_index: String(project.order_index),
      is_published: project.is_published,
    });

    setError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    setIsModalOpen(false);
    setEditingProject(null);
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
    const slug = createSlug(title);
    const orderIndex = Number(form.order_index);

    if (!title || !slug) {
      setError("A valid project title is required.");
      return;
    }

    if (!form.description.trim()) {
      setError("Project description is required.");
      return;
    }

    if (!Number.isFinite(orderIndex) || orderIndex < 0) {
      setError("Order must be a valid number.");
      return;
    }

    const tags = Array.from(
      new Set(
        form.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      )
    );

    try {
      setSaving(true);

      if (editingProject) {
        const updateData: UpdateTables<"portfolio_projects"> = {
          title,
          slug: title === editingProject.title ? editingProject.slug : slug,
          description: form.description.trim(),
          cover_image_url: form.cover_image_url.trim() || null,
          project_url: form.project_url.trim() || null,
          tags,
          order_index: orderIndex,
          is_published: form.is_published,
        };

        const { error: updateError } = await supabase
          .from("portfolio_projects")
          .update(updateData)
          .eq("id", editingProject.id);

        if (updateError) throw updateError;

        setSuccess("Project updated successfully.");
      } else {
        const insertData: InsertTables<"portfolio_projects"> = {
          title,
          slug,
          description: form.description.trim(),
          cover_image_url: form.cover_image_url.trim() || null,
          project_url: form.project_url.trim() || null,
          tags,
          order_index: orderIndex,
          is_published: form.is_published,
        };

        const { error: insertError } = await supabase
          .from("portfolio_projects")
          .insert(insertData);

        if (insertError) throw insertError;

        setSuccess("Project created successfully.");
      }

      setIsModalOpen(false);
      setEditingProject(null);
      setForm(emptyForm);

      await loadProjects();
    } catch (err) {
      console.error("Failed to save project:", err);

      setError(
        getErrorCode(err) === "23505"
          ? "A project with a very similar title already exists. Try a slightly different title."
          : "Something went wrong saving this project. Please try again."
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
      "Are you sure you want to delete this project? This can't be undone."
    );

    if (!confirmed) return;

    const { error: deleteError } = await supabase
      .from("portfolio_projects")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Failed to delete project:", deleteError);
      setError("Couldn't delete this project. Please try again.");
      return;
    }

    setProjects((current) => current.filter((project) => project.id !== id));
    setSuccess("Project deleted successfully.");
  };

  // =========================================================
  // Publish / Unpublish
  // =========================================================

  const togglePublished = async (project: Project) => {
    const nextValue = !project.is_published;

    // Optimistic update, reverted if the server refuses
    setProjects((current) =>
      current.map((item) =>
        item.id === project.id ? { ...item, is_published: nextValue } : item
      )
    );

    const { error: toggleError } = await supabase
      .from("portfolio_projects")
      .update({ is_published: nextValue })
      .eq("id", project.id);

    if (toggleError) {
      console.error("Failed to toggle published state:", toggleError);

      setProjects((current) =>
        current.map((item) => (item.id === project.id ? project : item))
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
          <span>Loading projects...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Manage Portfolio
          </h1>

          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Add and manage the projects shown on your portfolio page.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          <Plus size={20} />
          Add Project
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

      {/* List */}
      {projects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
          <FolderKanban size={40} className="mx-auto text-slate-400" />

          <h2 className="mt-4 text-xl font-semibold text-slate-900 dark:text-white">
            No Projects Found
          </h2>

          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Add your first project to show it on the portfolio page.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="hidden h-20 w-32 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 sm:block dark:border-slate-800 dark:bg-slate-800">
                  {project.cover_image_url ? (
                    <img
                      src={project.cover_image_url}
                      alt={project.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-400">
                      <ImageIcon size={22} />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                      {project.title}
                    </h2>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        project.is_published
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      }`}
                    >
                      {project.is_published ? "Published" : "Draft"}
                    </span>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                      #{project.order_index + 1}
                    </span>
                  </div>

                  <p className="mt-3 max-w-3xl leading-7 text-slate-600 dark:text-slate-400">
                    {project.description}
                  </p>

                  {project.tags && project.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-violet-200 px-3 py-1 text-xs font-medium text-violet-700 dark:border-violet-900/50 dark:text-violet-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="mt-4 text-xs text-slate-400">
                    Slug: <span className="text-slate-500">{project.slug}</span>
                  </p>
                </div>

                <div className="flex shrink-0 flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => void togglePublished(project)}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 font-medium text-slate-700 transition hover:border-blue-500 hover:text-blue-600 dark:border-slate-700 dark:text-slate-300"
                  >
                    {project.is_published ? (
                      <>
                        <EyeOff size={17} />
                        Unpublish
                      </>
                    ) : (
                      <>
                        <Eye size={17} />
                        Publish
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => openEditModal(project)}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 font-medium text-slate-700 transition hover:border-blue-500 hover:text-blue-600 dark:border-slate-700 dark:text-slate-300"
                  >
                    <Pencil size={17} />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => void handleDelete(project.id)}
                    className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 font-medium text-red-600 transition hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-950/30"
                  >
                    <Trash2 size={17} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 p-6 dark:border-slate-800">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {editingProject ? "Edit Project" : "Add Project"}
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  This appears on your public portfolio page.
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
                <label htmlFor="project-title" className={labelClass}>
                  Project Title
                </label>

                <input
                  id="project-title"
                  type="text"
                  value={form.title}
                  onChange={(event) => updateForm("title", event.target.value)}
                  placeholder="Business Website"
                  required
                  disabled={saving}
                  className={inputClass}
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="project-description" className={labelClass}>
                  Description
                </label>

                <textarea
                  id="project-description"
                  value={form.description}
                  onChange={(event) =>
                    updateForm("description", event.target.value)
                  }
                  placeholder="What the project does and the problem it solves..."
                  rows={4}
                  required
                  disabled={saving}
                  className={`${inputClass} resize-none`}
                />
              </div>

              {/* Cover */}
              <ImageUpload
                label="Cover Image"
                value={form.cover_image_url}
                onChange={(url) => updateForm("cover_image_url", url)}
                folder="portfolio"
                disabled={saving}
              />

              {/* Link */}
              <div>
                <label htmlFor="project-url" className={labelClass}>
                  Project Link
                </label>

                <input
                  id="project-url"
                  type="url"
                  value={form.project_url}
                  onChange={(event) =>
                    updateForm("project_url", event.target.value)
                  }
                  placeholder="https://project.com"
                  disabled={saving}
                  className={inputClass}
                />

                <p className="mt-2 text-xs text-slate-500">
                  Optional. Shows a "View Project" link.
                </p>
              </div>

              {/* Tags + Order */}
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="project-tags" className={labelClass}>
                    Tags
                  </label>

                  <input
                    id="project-tags"
                    type="text"
                    value={form.tags}
                    onChange={(event) => updateForm("tags", event.target.value)}
                    placeholder="Company Website, React, Supabase"
                    disabled={saving}
                    className={inputClass}
                  />

                  <p className="mt-2 text-xs text-slate-500">
                    Comma separated. The first tag shows as the category badge.
                  </p>
                </div>

                <div>
                  <label htmlFor="project-order" className={labelClass}>
                    Display Order
                  </label>

                  <input
                    id="project-order"
                    type="number"
                    min="0"
                    value={form.order_index}
                    onChange={(event) =>
                      updateForm("order_index", event.target.value)
                    }
                    disabled={saving}
                    className={inputClass}
                  />

                  <p className="mt-2 text-xs text-slate-500">
                    Lower numbers appear first.
                  </p>
                </div>
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
                    Publish Project
                  </p>

                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Published projects are visible on the public website.
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
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <ExternalLink size={18} />
                  )}
                  {saving
                    ? "Saving..."
                    : editingProject
                      ? "Update Project"
                      : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagePortfolio;