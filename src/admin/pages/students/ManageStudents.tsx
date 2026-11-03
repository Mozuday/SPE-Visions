import { useMemo, useState } from "react";
import { AlertCircle, Loader2, Search } from "lucide-react";

import { formatDate } from "../../../utils/formatters";

import AdminTable from "../../components/AdminTable";
import useStudents from "../../hooks/useStudents";
import type { Student } from "../../hooks/useStudents";

const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 pl-11 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white";

const ManageStudents = () => {
  const { students, loading, error } = useStudents();
  const [search, setSearch] = useState("");

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return students;

    return students.filter((student) =>
      `${student.full_name ?? ""} ${student.email}`.toLowerCase().includes(query)
    );
  }, [students, search]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
          <Loader2 size={24} className="animate-spin" />
          <span>Loading students...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Students
        </h1>

        <p className="mt-2 text-slate-600 dark:text-slate-400">
          {students.length} registered account{students.length === 1 ? "" : "s"}.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="relative">
        <Search
          size={17}
          aria-hidden="true"
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name or email"
          aria-label="Search students"
          className={inputClass}
        />
      </div>

      <AdminTable<Student>
        data={visible}
        emptyMessage={
          students.length === 0
            ? "No accounts yet."
            : "No students match your search."
        }
        columns={[
          {
            key: "full_name",
            label: "Name",
            render: (item) => (
              <span className="font-medium text-slate-900 dark:text-white">
                {item.full_name || "—"}
              </span>
            ),
          },
          { key: "email", label: "Email" },
          {
            key: "role",
            label: "Role",
            render: (item) => (
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                  item.role === "admin"
                    ? "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                }`}
              >
                {item.role}
              </span>
            ),
          },
          {
            key: "created_at",
            label: "Joined",
            render: (item) => formatDate(item.created_at),
          },
        ]}
      />
    </div>
  );
};

export default ManageStudents;