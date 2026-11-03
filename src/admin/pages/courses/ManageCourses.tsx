import { useEffect, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  Eye,
  EyeOff,
  ImageIcon,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Video,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";

import { supabase } from "../../../lib/supabase";
import type { Tables } from "../../../types/supabase";

import ImageUpload from "../../../components/ui/ImageUpload";

type Course = Tables<"courses">;
type Level = "Beginner" | "Intermediate" | "Advanced" | "Beginner to Advanced";

const levels: Level[] = [
  "Beginner",
  "Intermediate",
  "Advanced",
  "Beginner to Advanced",
];

const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white";

const labelClass =
  "mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300";

const slugify = (text: string) =>
  text
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

const ManageCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [level, setLevel] = useState<Level | "">("");
  const [price, setPrice] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [published, setPublished] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  // =========================================================
  // Load
  // =========================================================

  const loadCourses = async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("courses")
      .select("*")
      .order("created_at", { ascending: false });

    if (fetchError) {
      console.error("Failed to load courses:", fetchError);
      setError("Couldn't load courses. Please refresh and try again.");
    } else {
      setCourses(data ?? []);
    }

    setLoading(false);
  };

  useEffect(() => {
    void loadCourses();
  }, []);

  // =========================================================
  // Modal
  // =========================================================

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDuration("");
    setLevel("");
    setPrice("");
    setThumbnailUrl("");
    setPublished(true);
    setEditingCourse(null);
    setFormError(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (course: Course) => {
    setEditingCourse(course);
    setTitle(course.title);
    setDescription(course.description ?? "");
    setDuration(course.duration);
    setLevel(course.level ?? "");
    setPrice(course.price != null ? String(course.price) : "");
    setThumbnailUrl(course.thumbnail_url ?? "");
    setPublished(course.is_published);
    setFormError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    setIsModalOpen(false);
    resetForm();
  };

  // =========================================================
  // Create / Update
  // =========================================================

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (!title.trim() || !description.trim() || !duration.trim() || !level) {
      setFormError("Title, description, duration and level are required.");
      return;
    }

    const parsedPrice = price.trim() ? Number(price) : null;

    if (parsedPrice !== null && (!Number.isFinite(parsedPrice) || parsedPrice < 0)) {
      setFormError("Price must be a valid number.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        duration: duration.trim(),
        level,
        price: parsedPrice,
        thumbnail_url: thumbnailUrl.trim() || null,
        is_published: published,
      };

      if (editingCourse) {
        /*
         * Keep the slug unless the title changed, so public
         * links don't break on every edit.
         */
        const slug =
          title.trim() === editingCourse.title
            ? editingCourse.slug
            : slugify(title);

        const { error: updateError } = await supabase
          .from("courses")
          .update({ ...payload, slug })
          .eq("id", editingCourse.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from("courses")
          .insert({ ...payload, slug: slugify(title) });

        if (insertError) throw insertError;
      }

      setIsModalOpen(false);
      resetForm();

      await loadCourses();
    } catch (err: unknown) {
      console.error("Failed to save course:", err);

      setFormError(
        getErrorCode(err) === "23505"
          ? "A course with a very similar title already exists. Try a slightly different title."
          : "Something went wrong saving this course. Please try again."
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
      "Are you sure you want to delete this course? This can't be undone."
    );

    if (!confirmed) return;

    const { error: deleteError } = await supabase
      .from("courses")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Failed to delete course:", deleteError);
      setError(
        "Couldn't delete this course. It may have orders or enrolments attached."
      );
      return;
    }

    setCourses((current) => current.filter((course) => course.id !== id));
  };

  // =========================================================
  // Publish / Unpublish
  // =========================================================

  const togglePublished = async (course: Course) => {
    const nextValue = !course.is_published;

    // Optimistic update, reverted if the server refuses
    setCourses((current) =>
      current.map((item) =>
        item.id === course.id ? { ...item, is_published: nextValue } : item
      )
    );

    const { error: toggleError } = await supabase
      .from("courses")
      .update({ is_published: nextValue })
      .eq("id", course.id);

    if (toggleError) {
      console.error("Failed to toggle published state:", toggleError);

      setCourses((current) =>
        current.map((item) => (item.id === course.id ? course : item))
      );

      setError("Couldn't update publish status. Please try again.");
    }
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Manage Courses
          </h1>

          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Create, edit and manage courses displayed on your website.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          <Plus size={20} />
          Add Course
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Course List */}
      <div className="grid gap-6">
        {loading ? (
          <div className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-12 text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            <Loader2 size={22} className="animate-spin" />
            Loading courses...
          </div>
        ) : courses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
            <BookOpen size={40} className="mx-auto text-slate-400" />

            <h2 className="mt-4 text-xl font-semibold text-slate-900 dark:text-white">
              No Courses Found
            </h2>

            <p className="mt-2 text-slate-500 dark:text-slate-400">
              Create your first course to get started.
            </p>
          </div>
        ) : (
          courses.map((course) => (
            <div
              key={course.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                {/* Thumbnail */}
                <div className="hidden h-20 w-32 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 sm:block dark:border-slate-800 dark:bg-slate-800">
                  {course.thumbnail_url ? (
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-400">
                      <ImageIcon size={22} />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                      {course.title}
                    </h2>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        course.is_published
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      }`}
                    >
                      {course.is_published ? "Published" : "Draft"}
                    </span>
                  </div>

                  <p className="mt-3 max-w-3xl leading-7 text-slate-600 dark:text-slate-400">
                    {course.description}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <span className="rounded-lg bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
                      {course.duration}
                    </span>

                    {course.level && (
                      <span className="rounded-lg bg-violet-50 px-3 py-2 text-sm font-medium text-violet-700 dark:bg-violet-950/50 dark:text-violet-300">
                        {course.level}
                      </span>
                    )}

                    <span className="rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-green-700 dark:bg-green-950/50 dark:text-green-300">
                      {course.price != null ? `₹${course.price}` : "Free"}
                    </span>
                  </div>

                  <p className="mt-4 text-xs text-slate-400">
                    Slug: <span className="text-slate-500">{course.slug}</span>
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3">
                  <Link
                    to={`/admin/courses/${course.id}/videos`}
                    className="inline-flex items-center gap-2 rounded-xl border border-amber-200 px-4 py-2 font-medium text-amber-700 transition hover:bg-amber-50 dark:border-amber-900/50 dark:text-amber-400 dark:hover:bg-amber-950/30"
                  >
                    <Video size={17} />
                    Manage Videos
                  </Link>

                  <button
                    type="button"
                    onClick={() => void togglePublished(course)}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 font-medium text-slate-700 transition hover:border-blue-500 hover:text-blue-600 dark:border-slate-700 dark:text-slate-300"
                  >
                    {course.is_published ? (
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
                    onClick={() => openEditModal(course)}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 font-medium text-slate-700 transition hover:border-blue-500 hover:text-blue-600 dark:border-slate-700 dark:text-slate-300"
                  >
                    <Pencil size={17} />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => void handleDelete(course.id)}
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 p-6 dark:border-slate-800">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {editingCourse ? "Edit Course" : "Add Course"}
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {editingCourse
                    ? "Update course information."
                    : "Create a new course."}
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
              {formError && (
                <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Title */}
              <div>
                <label htmlFor="course-title" className={labelClass}>
                  Course Title
                </label>

                <input
                  id="course-title"
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Full Stack Web Development"
                  required
                  disabled={saving}
                  className={inputClass}
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="course-description" className={labelClass}>
                  Description
                </label>

                <textarea
                  id="course-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Describe the course..."
                  rows={4}
                  required
                  disabled={saving}
                  className={`${inputClass} resize-none`}
                />
              </div>

              {/* Duration + Level */}
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="course-duration" className={labelClass}>
                    Duration
                  </label>

                  <input
                    id="course-duration"
                    type="text"
                    value={duration}
                    onChange={(event) => setDuration(event.target.value)}
                    placeholder="12 Weeks"
                    required
                    disabled={saving}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="course-level" className={labelClass}>
                    Level
                  </label>

                  <select
                    id="course-level"
                    value={level}
                    onChange={(event) => setLevel(event.target.value as Level)}
                    required
                    disabled={saving}
                    className={inputClass}
                  >
                    <option value="">Select Level</option>

                    {levels.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price */}
              <div>
                <label htmlFor="course-price" className={labelClass}>
                  Price (₹)
                </label>

                <input
                  id="course-price"
                  type="number"
                  min="0"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  placeholder="4999 (leave blank for Free)"
                  disabled={saving}
                  className={inputClass}
                />
              </div>

              {/* Thumbnail */}
              <ImageUpload
                label="Thumbnail"
                value={thumbnailUrl}
                onChange={setThumbnailUrl}
                folder="courses"
                disabled={saving}
              />

              {/* Published */}
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(event) => setPublished(event.target.checked)}
                  disabled={saving}
                  className="h-5 w-5 accent-blue-600"
                />

                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    Publish Course
                  </p>

                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Published courses will be visible on the public website.
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
                  {saving && <Loader2 size={18} className="animate-spin" />}
                  {saving
                    ? "Saving..."
                    : editingCourse
                      ? "Update Course"
                      : "Create Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCourses;