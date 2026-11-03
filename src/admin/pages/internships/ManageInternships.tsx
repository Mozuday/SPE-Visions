import { useEffect, useState } from "react";
import {
  BriefcaseBusiness,
  CheckCircle,
  Eye,
  EyeOff,
  Pencil,
  Plus,
  Trash2,
  Users,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";

import { supabase } from "../../../lib/supabase";
import type {
  Tables,
  InsertTables,
  UpdateTables,
} from "../../../types/supabase";

type Internship = Tables<"internships">;

type InternshipForm = {
  title: string;
  category: string;
  description: string;
  duration: string;
  stipend: string;
  eligibility: string;
  skills: string;
  seats: string;
  deadline: string;
  is_published: boolean;
};

const emptyForm: InternshipForm = {
  title: "",
  category: "",
  description: "",
  duration: "",
  stipend: "",
  eligibility: "",
  skills: "",
  seats: "",
  deadline: "",
  is_published: true,
};

/*
 * NOTE: These category names are also used by the public
 * Internships page to pick an icon. If you rename one here,
 * update the categoryIcons map in pages/internships/Internships.tsx.
 */
const categories = [
  "Web Design",
  "Frontend Development",
  "Backend Development",
  "App Development",
  "Full Stack Development",
  "Software Development",
  "Other",
];

const createSlug = (title: string) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

/*
 * Supabase / Postgres errors carry a `code` — narrow safely
 * without resorting to `any`.
 */
const getErrorCode = (err: unknown): string | undefined => {
  if (err && typeof err === "object" && "code" in err) {
    return String((err as { code: unknown }).code);
  }

  return undefined;
};

const formatDeadline = (value: string | null) => {
  if (!value) return "";

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const ManageInternships = () => {
  const [internships, setInternships] = useState<Internship[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInternship, setEditingInternship] =
    useState<Internship | null>(null);

  const [form, setForm] = useState<InternshipForm>(emptyForm);

  /*
   * ---------------------------------------------------------
   * FETCH INTERNSHIPS
   * ---------------------------------------------------------
   */

  const fetchInternships = async () => {
    try {
      setLoading(true);
      setError("");

      const { data, error: fetchError } = await supabase
        .from("internships")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setInternships(data ?? []);
    } catch (err) {
      console.error("Failed to fetch internships:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load internships."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchInternships();
  }, []);

  /*
   * Auto-dismiss success messages so they don't pile up.
   */
  useEffect(() => {
    if (!success) return;

    const timer = setTimeout(() => setSuccess(""), 4000);

    return () => clearTimeout(timer);
  }, [success]);

  /*
   * ---------------------------------------------------------
   * HELPERS
   * ---------------------------------------------------------
   */

  const updateForm = <K extends keyof InternshipForm>(
    field: K,
    value: InternshipForm[K]
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingInternship(null);
    setError("");
  };

  /*
   * ---------------------------------------------------------
   * MODAL
   * ---------------------------------------------------------
   */

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (internship: Internship) => {
    setEditingInternship(internship);

    setForm({
      title: internship.title,
      category: internship.category ?? "",
      description: internship.description ?? "",
      duration: internship.duration ?? "",
      stipend: internship.stipend ?? "",
      eligibility: internship.eligibility ?? "",
      skills: internship.skills?.join(", ") ?? "",
      seats: internship.seats?.toString() ?? "",
      deadline: internship.deadline ?? "",
      is_published: internship.is_published,
    });

    setError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    setIsModalOpen(false);
    resetForm();
  };

  /*
   * ---------------------------------------------------------
   * CREATE / UPDATE
   * ---------------------------------------------------------
   */

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.title.trim()) {
      setError("Internship title is required.");
      return;
    }

    if (!form.category.trim()) {
      setError("Please select a category.");
      return;
    }

    if (!form.description.trim()) {
      setError("Description is required.");
      return;
    }

    if (!form.duration.trim()) {
      setError("Duration is required.");
      return;
    }

    if (!form.eligibility.trim()) {
      setError("Eligibility is required.");
      return;
    }

    if (!form.skills.trim()) {
      setError("At least one skill is required.");
      return;
    }

    const seats = Number(form.seats);

    if (!Number.isInteger(seats) || seats < 1) {
      setError("Seats must be a valid number greater than 0.");
      return;
    }

    if (!form.deadline) {
      setError("Application deadline is required.");
      return;
    }

    const title = form.title.trim();
    const slug = createSlug(title);

    if (!slug) {
      setError("Unable to generate a valid slug from this title.");
      return;
    }

    try {
      setSaving(true);

      /*
       * Split on commas, trim, drop empties and duplicates.
       */
      const skills = Array.from(
        new Set(
          form.skills
            .split(",")
            .map((skill) => skill.trim())
            .filter(Boolean)
        )
      );

      /*
       * CREATE
       */

      if (!editingInternship) {
        const internshipData: InsertTables<"internships"> = {
          title,
          slug,
          description: form.description.trim(),
          duration: form.duration.trim(),
          stipend: form.stipend.trim() || null,
          category: form.category.trim(),
          eligibility: form.eligibility.trim(),
          skills,
          seats,
          deadline: form.deadline,
          is_published: form.is_published,
        };

        const { data, error: insertError } = await supabase
          .from("internships")
          .insert(internshipData)
          .select()
          .single();

        if (insertError) {
          throw insertError;
        }

        if (data) {
          setInternships((current) => [data, ...current]);
        }

        setSuccess("Internship created successfully.");
      }

      /*
       * UPDATE
       *
       * Keep the existing slug unless the title actually changed,
       * so public URLs and saved links don't break on every edit.
       */

      else {
        const internshipData: UpdateTables<"internships"> = {
          title,
          slug:
            title === editingInternship.title
              ? editingInternship.slug
              : slug,
          description: form.description.trim(),
          duration: form.duration.trim(),
          stipend: form.stipend.trim() || null,
          category: form.category.trim(),
          eligibility: form.eligibility.trim(),
          skills,
          seats,
          deadline: form.deadline,
          is_published: form.is_published,
        };

        const { data, error: updateError } = await supabase
          .from("internships")
          .update(internshipData)
          .eq("id", editingInternship.id)
          .select()
          .single();

        if (updateError) {
          throw updateError;
        }

        if (data) {
          setInternships((current) =>
            current.map((internship) =>
              internship.id === editingInternship.id
                ? data
                : internship
            )
          );
        }

        setSuccess("Internship updated successfully.");
      }

      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      console.error("Failed to save internship:", err);

      if (getErrorCode(err) === "23505") {
        setError(
          "An internship with a very similar title already exists. Try a slightly different title."
        );
      } else {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to save internship."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * DELETE
   * ---------------------------------------------------------
   */

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this internship? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      const { error: deleteError } = await supabase
        .from("internships")
        .delete()
        .eq("id", id);

      if (deleteError) {
        throw deleteError;
      }

      setInternships((current) =>
        current.filter((internship) => internship.id !== id)
      );

      setSuccess("Internship deleted successfully.");
    } catch (err) {
      console.error("Failed to delete internship:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete internship."
      );
    }
  };

  /*
   * ---------------------------------------------------------
   * PUBLISH / UNPUBLISH
   * ---------------------------------------------------------
   */

  const togglePublished = async (internship: Internship) => {
    try {
      setError("");
      setSuccess("");

      const newPublishedState = !internship.is_published;

      const update: UpdateTables<"internships"> = {
        is_published: newPublishedState,
      };

      const { data, error: updateError } = await supabase
        .from("internships")
        .update(update)
        .eq("id", internship.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      if (data) {
        setInternships((current) =>
          current.map((item) =>
            item.id === internship.id ? data : item
          )
        );
      }

      setSuccess(
        newPublishedState
          ? "Internship published."
          : "Internship unpublished."
      );
    } catch (err) {
      console.error("Failed to change publication status:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update publication status."
      );
    }
  };

  /*
   * ---------------------------------------------------------
   * LOADING
   * ---------------------------------------------------------
   */

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
          <Loader2 size={24} className="animate-spin" />

          <span>Loading internships...</span>
        </div>
      </div>
    );
  }

  /*
   * ---------------------------------------------------------
   * UI
   * ---------------------------------------------------------
   */

  return (
    <div className="space-y-8">
      {/* HEADER */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Manage Internships
          </h1>

          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Create, edit, publish and manage internship opportunities.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          <Plus size={20} />
          Add Internship
        </button>
      </div>

      {/* SUCCESS */}

      {success && (
        <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-700 dark:border-green-900/50 dark:bg-green-950/30 dark:text-green-300">
          <CheckCircle size={20} />
          <span>{success}</span>
        </div>
      )}

      {/* ERROR */}

      {error && !isModalOpen && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          <AlertCircle size={20} className="mt-0.5 shrink-0" />

          <div className="flex-1">
            <p className="font-medium">Something went wrong</p>

            <p className="mt-1 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* INTERNSHIP LIST */}

      <div className="grid gap-6">
        {internships.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
            <BriefcaseBusiness
              size={42}
              className="mx-auto text-slate-400"
            />

            <h2 className="mt-4 text-xl font-semibold text-slate-900 dark:text-white">
              No Internships Found
            </h2>

            <p className="mt-2 text-slate-500 dark:text-slate-400">
              Create your first internship opportunity.
            </p>

            <button
              type="button"
              onClick={openAddModal}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
            >
              <Plus size={18} />
              Create Internship
            </button>
          </div>
        ) : (
          internships.map((internship) => (
            <div
              key={internship.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                {/* INFORMATION */}

                <div className="flex gap-5">
                  <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 sm:flex">
                    <BriefcaseBusiness size={28} />
                  </div>

                  <div className="min-w-0">
                    {/* BADGES */}

                    <div className="flex flex-wrap items-center gap-3">
                      {internship.category && (
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                          {internship.category}
                        </span>
                      )}

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          internship.is_published
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                        }`}
                      >
                        {internship.is_published ? "Published" : "Draft"}
                      </span>
                    </div>

                    {/* TITLE */}

                    <h2 className="mt-3 text-xl font-bold text-slate-900 dark:text-white">
                      {internship.title}
                    </h2>

                    {/* DESCRIPTION */}

                    <p className="mt-3 max-w-3xl leading-7 text-slate-600 dark:text-slate-400">
                      {internship.description}
                    </p>

                    {/* DETAILS */}

                    <div className="mt-5 flex flex-wrap gap-3">
                      {internship.duration && (
                        <span className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          Duration: {internship.duration}
                        </span>
                      )}

                      {internship.seats !== null && (
                        <span className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          <Users size={16} />
                          {internship.seats} Seats
                        </span>
                      )}

                      {internship.deadline && (
                        <span className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          Deadline: {formatDeadline(internship.deadline)}
                        </span>
                      )}

                      {internship.stipend && (
                        <span className="rounded-lg bg-green-100 px-3 py-2 text-sm font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
                          Stipend: {internship.stipend}
                        </span>
                      )}
                    </div>

                    {/* SKILLS */}

                    {internship.skills && internship.skills.length > 0 && (
                      <div className="mt-5 flex flex-wrap gap-2">
                        {internship.skills.map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:text-slate-400"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* SLUG */}

                    <div className="mt-4">
                      <span className="text-xs font-medium text-slate-400">
                        Slug:
                      </span>

                      <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">
                        {internship.slug}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ACTIONS */}

                <div className="flex shrink-0 flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => void togglePublished(internship)}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 font-medium text-slate-700 transition hover:border-blue-500 hover:text-blue-600 dark:border-slate-700 dark:text-slate-300"
                  >
                    {internship.is_published ? (
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
                    onClick={() => openEditModal(internship)}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 font-medium text-slate-700 transition hover:border-blue-500 hover:text-blue-600 dark:border-slate-700 dark:text-slate-300"
                  >
                    <Pencil size={17} />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => void handleDelete(internship.id)}
                    className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 font-medium text-red-600 transition hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-950/30"
                  >
                    <Trash2 size={17} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL */}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
            {/* MODAL HEADER */}

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {editingInternship ? "Edit Internship" : "Add Internship"}
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Manage the internship shown on your public website.
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

            {/* FORM */}

            <form onSubmit={handleSubmit} className="space-y-6 p-6">
              {/* FORM ERROR */}

              {error && (
                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />

                  <span>{error}</span>
                </div>
              )}

              {/* TITLE */}

              <div>
                <label
                  htmlFor="internship-title"
                  className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
                >
                  Internship Title
                </label>

                <input
                  id="internship-title"
                  type="text"
                  value={form.title}
                  onChange={(event) =>
                    updateForm("title", event.target.value)
                  }
                  placeholder="Frontend Development Internship"
                  required
                  disabled={saving}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>

              {/* CATEGORY + DURATION */}

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="internship-category"
                    className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Category
                  </label>

                  <select
                    id="internship-category"
                    value={form.category}
                    onChange={(event) =>
                      updateForm("category", event.target.value)
                    }
                    required
                    disabled={saving}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  >
                    <option value="">Select Category</option>

                    {categories.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="internship-duration"
                    className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Duration
                  </label>

                  <input
                    id="internship-duration"
                    type="text"
                    value={form.duration}
                    onChange={(event) =>
                      updateForm("duration", event.target.value)
                    }
                    placeholder="8 Weeks"
                    required
                    disabled={saving}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              {/* STIPEND */}

              <div>
                <label
                  htmlFor="internship-stipend"
                  className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
                >
                  Stipend
                </label>

                <input
                  id="internship-stipend"
                  type="text"
                  value={form.stipend}
                  onChange={(event) =>
                    updateForm("stipend", event.target.value)
                  }
                  placeholder="Unpaid / ₹5,000 per month"
                  disabled={saving}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>

              {/* DESCRIPTION */}

              <div>
                <label
                  htmlFor="internship-description"
                  className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
                >
                  Description
                </label>

                <textarea
                  id="internship-description"
                  value={form.description}
                  onChange={(event) =>
                    updateForm("description", event.target.value)
                  }
                  placeholder="Describe the internship program..."
                  rows={4}
                  required
                  disabled={saving}
                  className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>

              {/* ELIGIBILITY */}

              <div>
                <label
                  htmlFor="internship-eligibility"
                  className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
                >
                  Eligibility
                </label>

                <textarea
                  id="internship-eligibility"
                  value={form.eligibility}
                  onChange={(event) =>
                    updateForm("eligibility", event.target.value)
                  }
                  placeholder="Who can apply for this internship?"
                  rows={3}
                  required
                  disabled={saving}
                  className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>

              {/* SKILLS */}

              <div>
                <label
                  htmlFor="internship-skills"
                  className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
                >
                  Skills
                </label>

                <input
                  id="internship-skills"
                  type="text"
                  value={form.skills}
                  onChange={(event) =>
                    updateForm("skills", event.target.value)
                  }
                  placeholder="React, JavaScript, Tailwind CSS"
                  required
                  disabled={saving}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />

                <p className="mt-2 text-xs text-slate-500">
                  Separate skills with commas.
                </p>
              </div>

              {/* SEATS + DEADLINE */}

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="internship-seats"
                    className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Available Seats
                  </label>

                  <input
                    id="internship-seats"
                    type="number"
                    min="1"
                    value={form.seats}
                    onChange={(event) =>
                      updateForm("seats", event.target.value)
                    }
                    placeholder="5"
                    required
                    disabled={saving}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>

                <div>
                  <label
                    htmlFor="internship-deadline"
                    className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Application Deadline
                  </label>

                  <input
                    id="internship-deadline"
                    type="date"
                    value={form.deadline}
                    onChange={(event) =>
                      updateForm("deadline", event.target.value)
                    }
                    required
                    disabled={saving}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              {/* PUBLISH */}

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

                <div className="flex items-center gap-3">
                  <CheckCircle size={20} className="text-green-500" />

                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      Publish Internship
                    </p>

                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Published internships will appear on the public website.
                    </p>
                  </div>
                </div>
              </label>

              {/* ACTIONS */}

              <div className="flex justify-end gap-3 border-t border-slate-200 pt-6 dark:border-slate-800">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && <Loader2 size={18} className="animate-spin" />}

                  {saving
                    ? "Saving..."
                    : editingInternship
                      ? "Update Internship"
                      : "Create Internship"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageInternships;