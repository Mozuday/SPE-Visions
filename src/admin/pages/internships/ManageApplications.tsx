import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Loader2,
  Mail,
  Phone,
  Reply,
  Search,
  Trash2,
  X,
} from "lucide-react";

import { supabase } from "../../../lib/supabase";
import { getResumeLink } from "../../../lib/cloudinary";
import type { Tables } from "../../../types/supabase";
import { formatDate, formatRelativeTime } from "../../../utils/formatters";
import { statusColorMap } from "../../../utils/helpers";

import AdminTable from "../../components/AdminTable";

type Application = Tables<"internship_applications"> & {
  internships: { title: string } | null;
};

type ApplicationStatus = Application["status"];

const statuses: ApplicationStatus[] = [
  "pending",
  "reviewed",
  "accepted",
  "rejected",
];

const inputClass =
  "rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white";

const capitalize = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

const StatusBadge = ({ status }: { status: ApplicationStatus }) => (
  <span
    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${statusColorMap[status]}`}
  >
    {status}
  </span>
);

const getTitle = (application: Application) =>
  application.internships?.title ?? "Deleted internship";

const ManageApplications = () => {
  const [applications, setApplications] = useState<Application[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState("");

  const [filter, setFilter] = useState<ApplicationStatus | "all">("all");
  const [search, setSearch] = useState("");

  const [selected, setSelected] = useState<Application | null>(null);

  // =========================================================
  // Load
  // =========================================================

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("internship_applications")
        .select("*, internships(title)")
        .order("created_at", { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setApplications((data ?? []) as unknown as Application[]);
    } catch (err) {
      console.error("Failed to load applications:", err);

      setError("Couldn't load applications. Please refresh and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadApplications();
  }, []);

  useEffect(() => {
    if (!success) return;

    const timer = setTimeout(() => setSuccess(""), 4000);

    return () => clearTimeout(timer);
  }, [success]);

  // =========================================================
  // Status
  // =========================================================

  const updateStatus = async (
    application: Application,
    status: ApplicationStatus
  ) => {
    if (application.status === status) return;

    setError(null);

    const apply = (next: ApplicationStatus) => {
      setApplications((current) =>
        current.map((item) =>
          item.id === application.id ? { ...item, status: next } : item
        )
      );

      setSelected((current) =>
        current && current.id === application.id
          ? { ...current, status: next }
          : current
      );
    };

    // Optimistic update, reverted if the server refuses
    apply(status);

    const { error: updateError } = await supabase
      .from("internship_applications")
      .update({ status })
      .eq("id", application.id);

    if (updateError) {
      console.error("Failed to update application status:", updateError);

      apply(application.status);
      setError("Couldn't update the status. Please try again.");
    }
  };

  // =========================================================
  // Resume
  // =========================================================

  /*
   * Resumes are private. This asks the Edge Function for a
   * download link that expires after a few minutes.
   */
  const openResume = async (publicId: string) => {
    try {
      window.open(await getResumeLink(publicId), "_blank", "noopener");
    } catch {
      setError("Couldn't open this resume. Please try again.");
    }
  };

  // =========================================================
  // Delete
  // =========================================================

  const handleDelete = async (application: Application) => {
    const confirmed = window.confirm(
      "Delete this application permanently? This can't be undone."
    );

    if (!confirmed) return;

    const { error: deleteError } = await supabase
      .from("internship_applications")
      .delete()
      .eq("id", application.id);

    if (deleteError) {
      console.error("Failed to delete application:", deleteError);
      setError("Couldn't delete this application. Please try again.");
      return;
    }

    setApplications((current) =>
      current.filter((item) => item.id !== application.id)
    );

    setSelected((current) => (current?.id === application.id ? null : current));
    setSuccess("Application deleted.");
  };

  // =========================================================
  // Derived
  // =========================================================

  const counts = useMemo(() => {
    const result: Record<ApplicationStatus, number> = {
      pending: 0,
      reviewed: 0,
      accepted: 0,
      rejected: 0,
    };

    for (const application of applications) {
      result[application.status] += 1;
    }

    return result;
  }, [applications]);

  const visibleApplications = useMemo(() => {
    const query = search.trim().toLowerCase();

    return applications.filter((application) => {
      if (filter !== "all" && application.status !== filter) return false;

      if (!query) return true;

      return [
        application.full_name,
        application.email,
        application.phone,
        getTitle(application),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [applications, filter, search]);

  // =========================================================
  // UI
  // =========================================================

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
          <Loader2 size={24} className="animate-spin" />
          <span>Loading applications...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Internship Applications
        </h1>

        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Review applications submitted through your internship page.
        </p>
      </div>

      {success && (
        <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-700 dark:border-green-900/50 dark:bg-green-950/30 dark:text-green-300">
          <CheckCircle size={20} />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statuses.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setFilter(filter === status ? "all" : status)}
            className={`rounded-2xl border bg-white p-5 text-left transition dark:bg-slate-900 ${
              filter === status
                ? "border-blue-500 ring-2 ring-blue-500/20"
                : "border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700"
            }`}
          >
            <p className="text-sm capitalize text-slate-500 dark:text-slate-400">
              {status}
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
              {counts[status]}
            </p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={17}
            aria-hidden="true"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, email, phone or internship"
            aria-label="Search applications"
            className={`${inputClass} w-full pl-11`}
          />
        </div>

        <select
          value={filter}
          onChange={(event) =>
            setFilter(event.target.value as ApplicationStatus | "all")
          }
          aria-label="Filter by status"
          className={`${inputClass} sm:w-48`}
        >
          <option value="all">All statuses</option>

          {statuses.map((status) => (
            <option key={status} value={status}>
              {capitalize(status)}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <AdminTable<Application>
        data={visibleApplications}
        emptyMessage={
          applications.length === 0
            ? "No applications yet. Submissions from your internship page will appear here."
            : "No applications match your filters."
        }
        columns={[
          {
            key: "full_name",
            label: "Applicant",
            render: (item) => (
              <div className="min-w-0">
                <p className="font-medium text-slate-900 dark:text-white">
                  {item.full_name}
                </p>

                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {item.email}
                </p>
              </div>
            ),
          },
          {
            key: "internship",
            label: "Internship",
            render: (item) => (
              <span
                className={
                  item.internships
                    ? "text-slate-700 dark:text-slate-300"
                    : "italic text-slate-400"
                }
              >
                {getTitle(item)}
              </span>
            ),
          },
          {
            key: "status",
            label: "Status",
            render: (item) => <StatusBadge status={item.status} />,
          },
          {
            key: "created_at",
            label: "Applied",
            render: (item) => (
              <span className="whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                {formatRelativeTime(item.created_at)}
              </span>
            ),
          },
        ]}
        onEdit={setSelected}
        onDelete={(item) => void handleDelete(item)}
      />

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-6 dark:border-slate-800">
              <div className="min-w-0">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {selected.full_name}
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Applied for {getTitle(selected)} ·{" "}
                  {formatDate(selected.created_at, "long")}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Close"
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={22} />
              </button>
            </div>

            <div className="space-y-6 p-6">
              {/* Contact */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Email
                  </p>

                  <a
                    href={`mailto:${selected.email}`}
                    className="mt-1 flex items-center gap-2 break-all font-medium text-blue-600 hover:underline dark:text-cyan-400"
                  >
                    <Mail size={15} className="shrink-0" />
                    {selected.email}
                  </a>
                </div>

                <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Phone
                  </p>

                  {selected.phone ? (
                    <a
                      href={`tel:${selected.phone.replace(/[^\d+]/g, "")}`}
                      className="mt-1 flex items-center gap-2 font-medium text-blue-600 hover:underline dark:text-cyan-400"
                    >
                      <Phone size={15} className="shrink-0" />
                      {selected.phone}
                    </a>
                  ) : (
                    <p className="mt-1 text-slate-400">Not provided</p>
                  )}
                </div>
              </div>

              {/* Details */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Details & note
                </p>

                <p className="whitespace-pre-wrap rounded-xl bg-slate-50 p-5 leading-7 text-slate-700 dark:bg-slate-950 dark:text-slate-300">
                  {selected.cover_note || "No details provided."}
                </p>
              </div>

              {/* Resume */}
              {selected.resume_url ? (
                <button
                  type="button"
                  onClick={() => void openResume(selected.resume_url as string)}
                  className="inline-flex items-center gap-2 font-semibold text-blue-600 hover:underline dark:text-cyan-400"
                >
                  <ExternalLink size={16} />
                  Open resume
                </button>
              ) : (
                <p className="text-sm text-slate-400">No resume uploaded.</p>
              )}

              {/* Status */}
              <div>
                <label
                  htmlFor="application-status"
                  className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
                >
                  Status
                </label>

                <select
                  id="application-status"
                  value={selected.status}
                  onChange={(event) =>
                    void updateStatus(
                      selected,
                      event.target.value as ApplicationStatus
                    )
                  }
                  className={`${inputClass} w-full sm:w-60`}
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {capitalize(status)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap justify-between gap-3 border-t border-slate-200 pt-6 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => void handleDelete(selected)}
                  className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 font-medium text-red-600 transition hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-950/30"
                >
                  <Trash2 size={17} />
                  Delete
                </button>

                <a
                  href={`mailto:${selected.email}?subject=${encodeURIComponent(
                    `Your internship application: ${getTitle(selected)}`
                  )}`}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 font-semibold text-white transition hover:bg-blue-700"
                >
                  <Reply size={17} />
                  Email Applicant
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageApplications;