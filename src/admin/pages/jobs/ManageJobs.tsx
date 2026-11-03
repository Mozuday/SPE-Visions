import { useEffect, useState } from "react";
import {
  AlertCircle,
  Briefcase,
  CalendarDays,
  ExternalLink,
  Eye,
  EyeOff,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import { supabase } from "../../../lib/supabase";
import type { Tables } from "../../../types/supabase";

type Job = Tables<"jobs">;

type JobForm = {
  title: string;
  company: string;
  location: string;
  employment_type: string;
  work_mode: string;
  experience: string;
  salary: string;
  skills: string;
  description: string;
  application_link: string;
  deadline: string;
  is_published: boolean;
};

const emptyForm: JobForm = {
  title: "",
  company: "",
  location: "",
  employment_type: "",
  work_mode: "",
  experience: "",
  salary: "",
  skills: "",
  description: "",
  application_link: "",
  deadline: "",
  is_published: true,
};

const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white";

const labelClass =
  "mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300";

/*
 * Company is part of the slug because titles like
 * "Frontend Developer" repeat across companies.
 */
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

const isExpired = (value: string | null) => {
  if (!value) return false;

  const end = new Date(`${value}T23:59:59`);

  return !Number.isNaN(end.getTime()) && end.getTime() < Date.now();
};

const ManageJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  const [form, setForm] = useState<JobForm>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);

  const loadJobs = async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("jobs")
      .select("*")
      .order("created_at", { ascending: false });

    if (fetchError) {
      console.error("Failed to load jobs:", fetchError);
      setError("Couldn't load jobs. Please refresh and try again.");
    } else {
      setJobs(data ?? []);
    }

    setLoading(false);
  };

  useEffect(() => {
    void loadJobs();
  }, []);

  const updateForm = <K extends keyof JobForm>(
    field: K,
    value: JobForm[K]
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const openAddModal = () => {
    setEditingJob(null);
    setForm(emptyForm);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (job: Job) => {
    setEditingJob(job);

    setForm({
      title: job.title,
      company: job.company ?? "",
      location: job.location ?? "",
      employment_type: job.employment_type ?? "",
      work_mode: job.work_mode ?? "",
      experience: job.experience ?? "",
      salary: job.salary ?? "",
      skills: job.skills.join(", "),
      description: job.description ?? "",
      application_link: job.application_link ?? "",
      deadline: job.deadline ?? "",
      is_published: job.is_published,
    });

    setFormError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    setIsModalOpen(false);
    setEditingJob(null);
    setForm(emptyForm);
    setFormError(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const title = form.title.trim();
    const company = form.company.trim();

    const skillList = Array.from(
      new Set(
        form.skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean)
      )
    );

    if (!title || !company) {
      setFormError("Job title and company are required.");
      return;
    }

    if (!form.location.trim() || !form.employment_type || !form.work_mode) {
      setFormError("Location, job type and work mode are required.");
      return;
    }

    if (!form.experience.trim()) {
      setFormError("Experience is required.");
      return;
    }

    if (skillList.length === 0) {
      setFormError("Add at least one required skill.");
      return;
    }

    if (!form.description.trim()) {
      setFormError("Job description is required.");
      return;
    }

    if (!form.application_link.trim()) {
      setFormError("Application URL is required.");
      return;
    }

    if (!form.deadline) {
      setFormError("Application deadline is required.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        title,
        company,
        location: form.location.trim(),
        employment_type: form.employment_type as Job["employment_type"],
        work_mode: form.work_mode as Job["work_mode"],
        experience: form.experience.trim(),
        salary: form.salary.trim() || null,
        skills: skillList,
        description: form.description.trim(),
        application_link: form.application_link.trim(),
        deadline: form.deadline,
        is_published: form.is_published,
      };

      if (editingJob) {
        const slug =
          title === editingJob.title && company === editingJob.company
            ? editingJob.slug
            : slugify(`${title}-${company}`);

        const { error: updateError } = await supabase
          .from("jobs")
          .update({ ...payload, slug })
          .eq("id", editingJob.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase.from("jobs").insert({
          ...payload,
          slug: slugify(`${title}-${company}`),
        });

        if (insertError) throw insertError;
      }

      setIsModalOpen(false);
      setEditingJob(null);
      setForm(emptyForm);

      await loadJobs();
    } catch (err: unknown) {
      console.error("Failed to save job:", err);

      if (getErrorCode(err) === "23505") {
        setFormError(
          "A job with this exact title and company already exists. Try adjusting one slightly."
        );
      } else {
        setFormError("Something went wrong saving this job. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this job? This can't be undone."
    );

    if (!confirmed) return;

    const { error: deleteError } = await supabase
      .from("jobs")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Failed to delete job:", deleteError);
      setError(
        "Couldn't delete this job. If it has applications attached, review those first."
      );
      return;
    }

    setJobs((current) => current.filter((job) => job.id !== id));
  };

  const togglePublished = async (job: Job) => {
    const nextValue = !job.is_published;

    setJobs((current) =>
      current.map((item) =>
        item.id === job.id ? { ...item, is_published: nextValue } : item
      )
    );

    const { error: toggleError } = await supabase
      .from("jobs")
      .update({ is_published: nextValue })
      .eq("id", job.id);

    if (toggleError) {
      console.error("Failed to toggle published state:", toggleError);

      setJobs((current) =>
        current.map((item) => (item.id === job.id ? job : item))
      );

      setError("Couldn't update publish status. Please try again.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Manage Jobs
          </h1>

          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Publish and manage daily job opportunities for visitors.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          <Plus size={20} />
          Add Job
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Jobs */}
      <div className="grid gap-6">
        {loading ? (
          <div className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-12 text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            <Loader2 size={22} className="animate-spin" />
            Loading jobs...
          </div>
        ) : jobs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
            <Briefcase size={42} className="mx-auto text-slate-400" />

            <h2 className="mt-4 text-xl font-semibold text-slate-900 dark:text-white">
              No Jobs Found
            </h2>

            <p className="mt-2 text-slate-500 dark:text-slate-400">
              Add your first job update.
            </p>
          </div>
        ) : (
          jobs.map((job) => {
            const expired = isExpired(job.deadline);

            return (
              <div
                key={job.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex flex-col gap-6 xl:flex-row xl:justify-between">
                  {/* Job Information */}
                  <div className="flex gap-5">
                    <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 sm:flex">
                      <Briefcase size={28} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            job.is_published
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                          }`}
                        >
                          {job.is_published ? "Published" : "Draft"}
                        </span>

                        {job.employment_type && (
                          <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
                            {job.employment_type}
                          </span>
                        )}

                        {expired && (
                          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 dark:bg-red-900/30 dark:text-red-300">
                            Expired
                          </span>
                        )}
                      </div>

                      <h2 className="mt-3 text-xl font-bold text-slate-900 dark:text-white">
                        {job.title}
                      </h2>

                      <p className="mt-1 font-medium text-rose-600 dark:text-rose-400">
                        {job.company}
                      </p>

                      <p className="mt-3 max-w-3xl leading-7 text-slate-600 dark:text-slate-400">
                        {job.description}
                      </p>

                      <div className="mt-5 flex flex-wrap gap-3">
                        {job.location && (
                          <span className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            <MapPin size={16} />
                            {job.location}
                          </span>
                        )}

                        {job.work_mode && (
                          <span className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            {job.work_mode}
                          </span>
                        )}

                        {job.experience && (
                          <span className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            {job.experience}
                          </span>
                        )}

                        {job.salary && (
                          <span className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            {job.salary}
                          </span>
                        )}

                        {job.deadline && (
                          <span className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            <CalendarDays size={16} />
                            {formatDeadline(job.deadline)}
                          </span>
                        )}
                      </div>

                      <div className="mt-5 flex flex-wrap gap-2">
                        {job.skills.map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:text-slate-400"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => void togglePublished(job)}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 font-medium text-slate-700 transition hover:border-blue-500 hover:text-blue-600 dark:border-slate-700 dark:text-slate-300"
                    >
                      {job.is_published ? (
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
                      onClick={() => openEditModal(job)}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 font-medium text-slate-700 transition hover:border-blue-500 hover:text-blue-600 dark:border-slate-700 dark:text-slate-300"
                    >
                      <Pencil size={17} />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => void handleDelete(job.id)}
                      className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 font-medium text-red-600 transition hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-950/30"
                    >
                      <Trash2 size={17} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 p-6 dark:border-slate-800">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {editingJob ? "Edit Job" : "Add Job"}
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Add complete information about the job opportunity.
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
                <label htmlFor="job-title" className={labelClass}>
                  Job Title
                </label>

                <input
                  id="job-title"
                  type="text"
                  value={form.title}
                  onChange={(event) => updateForm("title", event.target.value)}
                  placeholder="Frontend Developer"
                  required
                  disabled={saving}
                  className={inputClass}
                />
              </div>

              {/* Company + Location */}
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="job-company" className={labelClass}>
                    Company
                  </label>

                  <input
                    id="job-company"
                    type="text"
                    value={form.company}
                    onChange={(event) =>
                      updateForm("company", event.target.value)
                    }
                    placeholder="Company Name"
                    required
                    disabled={saving}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="job-location" className={labelClass}>
                    Location
                  </label>

                  <input
                    id="job-location"
                    type="text"
                    value={form.location}
                    onChange={(event) =>
                      updateForm("location", event.target.value)
                    }
                    placeholder="Bengaluru, India"
                    required
                    disabled={saving}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Type + Mode */}
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="job-type" className={labelClass}>
                    Job Type
                  </label>

                  <select
                    id="job-type"
                    value={form.employment_type}
                    onChange={(event) =>
                      updateForm("employment_type", event.target.value)
                    }
                    required
                    disabled={saving}
                    className={inputClass}
                  >
                    <option value="">Select Job Type</option>
                    <option value="Full Time">Full Time</option>
                    <option value="Part Time">Part Time</option>
                    <option value="Internship">Internship</option>
                    <option value="Contract">Contract</option>
                    <option value="Freelance">Freelance</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="job-mode" className={labelClass}>
                    Work Mode
                  </label>

                  <select
                    id="job-mode"
                    value={form.work_mode}
                    onChange={(event) =>
                      updateForm("work_mode", event.target.value)
                    }
                    required
                    disabled={saving}
                    className={inputClass}
                  >
                    <option value="">Select Work Mode</option>
                    <option value="Remote">Remote</option>
                    <option value="On-site">On-site</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              {/* Experience + Salary */}
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="job-experience" className={labelClass}>
                    Experience
                  </label>

                  <input
                    id="job-experience"
                    type="text"
                    value={form.experience}
                    onChange={(event) =>
                      updateForm("experience", event.target.value)
                    }
                    placeholder="0-2 Years"
                    required
                    disabled={saving}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="job-salary" className={labelClass}>
                    Salary
                  </label>

                  <input
                    id="job-salary"
                    type="text"
                    value={form.salary}
                    onChange={(event) =>
                      updateForm("salary", event.target.value)
                    }
                    placeholder="₹4 LPA - ₹8 LPA"
                    disabled={saving}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Skills */}
              <div>
                <label htmlFor="job-skills" className={labelClass}>
                  Required Skills
                </label>

                <input
                  id="job-skills"
                  type="text"
                  value={form.skills}
                  onChange={(event) => updateForm("skills", event.target.value)}
                  placeholder="React, TypeScript, Git"
                  required
                  disabled={saving}
                  className={inputClass}
                />

                <p className="mt-2 text-xs text-slate-500">
                  Separate skills with commas.
                </p>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="job-description" className={labelClass}>
                  Job Description
                </label>

                <textarea
                  id="job-description"
                  value={form.description}
                  onChange={(event) =>
                    updateForm("description", event.target.value)
                  }
                  placeholder="Describe the job responsibilities and requirements..."
                  rows={5}
                  required
                  disabled={saving}
                  className={`${inputClass} resize-none`}
                />
              </div>

              {/* Link + Deadline */}
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="job-link" className={labelClass}>
                    Application URL
                  </label>

                  <input
                    id="job-link"
                    type="url"
                    value={form.application_link}
                    onChange={(event) =>
                      updateForm("application_link", event.target.value)
                    }
                    placeholder="https://company.com/careers"
                    required
                    disabled={saving}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="job-deadline" className={labelClass}>
                    Application Deadline
                  </label>

                  <input
                    id="job-deadline"
                    type="date"
                    value={form.deadline}
                    onChange={(event) =>
                      updateForm("deadline", event.target.value)
                    }
                    required
                    disabled={saving}
                    className={inputClass}
                  />
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
                    Publish Job
                  </p>

                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Published jobs will be visible on the public website.
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
                    : editingJob
                      ? "Update Job"
                      : "Publish Job"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageJobs;