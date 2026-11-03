import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  Loader2,
  Plus,
  X,
} from "lucide-react";

import { supabase } from "../../../lib/supabase";
import type { Tables } from "../../../types/supabase";
import { formatDate } from "../../../utils/formatters";

import AdminTable from "../../components/AdminTable";
import useStudents from "../../hooks/useStudents";

type Enrollment = Tables<"enrollments"> & {
  courses: { title: string } | null;
};

type CourseOption = Pick<Tables<"courses">, "id" | "title">;

const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white";

const labelClass =
  "mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300";

const getErrorCode = (err: unknown): string | undefined => {
  if (err && typeof err === "object" && "code" in err) {
    return String((err as { code: unknown }).code);
  }

  return undefined;
};

const ManageEnrollments = () => {
  const { students, byId, error: studentsError } = useStudents();

  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userId, setUserId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);

    const [enrollmentsRes, coursesRes] = await Promise.all([
      supabase
        .from("enrollments")
        .select("*, courses(title)")
        .order("created_at", { ascending: false }),
      supabase.from("courses").select("id, title").order("title"),
    ]);

    if (enrollmentsRes.error || coursesRes.error) {
      console.error(
        "Failed to load enrolments:",
        enrollmentsRes.error ?? coursesRes.error
      );
      setError("Couldn't load enrolments. Please refresh and try again.");
    } else {
      setEnrollments((enrollmentsRes.data ?? []) as unknown as Enrollment[]);
      setCourses(coursesRes.data ?? []);
    }

    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    if (!success) return;

    const timer = setTimeout(() => setSuccess(""), 4000);

    return () => clearTimeout(timer);
  }, [success]);

  const openModal = () => {
    setUserId("");
    setCourseId("");
    setFormError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    setIsModalOpen(false);
  };

  const handleGrant = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (!userId || !courseId) {
      setFormError("Choose a student and a course.");
      return;
    }

    setSaving(true);

    const { error: insertError } = await supabase.from("enrollments").insert({
      user_id: userId,
      course_id: courseId,
      source: "admin",
    });

    setSaving(false);

    if (insertError) {
      console.error("Failed to grant access:", insertError);

      setFormError(
        getErrorCode(insertError) === "23505"
          ? "This student already has access to that course."
          : "Couldn't grant access. Please try again."
      );
      return;
    }

    setIsModalOpen(false);
    setSuccess("Access granted.");

    await load();
  };

  const handleRevoke = async (enrollment: Enrollment) => {
    const student = byId.get(enrollment.user_id);

    const confirmed = window.confirm(
      `Remove ${student?.email ?? "this student"}'s access to "${
        enrollment.courses?.title ?? "this course"
      }"? Their lesson progress is kept.`
    );

    if (!confirmed) return;

    const { error: deleteError } = await supabase
      .from("enrollments")
      .delete()
      .eq("id", enrollment.id);

    if (deleteError) {
      console.error("Failed to revoke access:", deleteError);
      setError("Couldn't remove access. Please try again.");
      return;
    }

    setEnrollments((current) =>
      current.filter((item) => item.id !== enrollment.id)
    );
    setSuccess("Access removed.");
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
          <Loader2 size={24} className="animate-spin" />
          <span>Loading enrolments...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Enrolments
          </h1>

          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Who can watch which course. Grant access by hand until online
            payment is live.
          </p>
        </div>

        <button
          type="button"
          onClick={openModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          <Plus size={20} />
          Grant Access
        </button>
      </div>

      {success && (
        <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-700 dark:border-green-900/50 dark:bg-green-950/30 dark:text-green-300">
          <CheckCircle size={20} />
          <span>{success}</span>
        </div>
      )}

      {(error || studentsError) && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <span>{error ?? studentsError}</span>
        </div>
      )}

      <AdminTable<Enrollment>
        data={enrollments}
        emptyMessage="No enrolments yet."
        columns={[
          {
            key: "user_id",
            label: "Student",
            render: (item) => {
              const student = byId.get(item.user_id);

              return (
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {student?.full_name || "—"}
                  </p>

                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    {student?.email ?? item.user_id}
                  </p>
                </div>
              );
            },
          },
          {
            key: "course",
            label: "Course",
            render: (item) => item.courses?.title ?? "Deleted course",
          },
          {
            key: "source",
            label: "Source",
            render: (item) => (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                {item.source}
              </span>
            ),
          },
          {
            key: "created_at",
            label: "Enrolled",
            render: (item) => formatDate(item.created_at),
          },
        ]}
        onDelete={(item) => void handleRevoke(item)}
      />

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 p-6 dark:border-slate-800">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Grant Access
              </h2>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                aria-label="Close"
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleGrant} className="space-y-6 p-6">
              {formError && (
                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label htmlFor="grant-student" className={labelClass}>
                  Student
                </label>

                <select
                  id="grant-student"
                  value={userId}
                  onChange={(event) => setUserId(event.target.value)}
                  disabled={saving}
                  className={inputClass}
                >
                  <option value="">Select a student</option>

                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.full_name
                        ? `${student.full_name} (${student.email})`
                        : student.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="grant-course" className={labelClass}>
                  Course
                </label>

                <select
                  id="grant-course"
                  value={courseId}
                  onChange={(event) => setCourseId(event.target.value)}
                  disabled={saving}
                  className={inputClass}
                >
                  <option value="">Select a course</option>

                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>

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
                  {saving ? "Granting..." : "Grant Access"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageEnrollments;