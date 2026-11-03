import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle, ExternalLink, Loader2 } from "lucide-react";

import { supabase } from "../../../lib/supabase";
import type { Tables } from "../../../types/supabase";
import { formatDate } from "../../../utils/formatters";

import AdminTable from "../../components/AdminTable";
import useStudents from "../../hooks/useStudents";

type Certificate = Tables<"certificates"> & {
  courses: { title: string } | null;
};

const ManageCertificates = () => {
  const { byId } = useStudents();

  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const { data, error: fetchError } = await supabase
        .from("certificates")
        .select("*, courses(title)")
        .order("issued_at", { ascending: false });

      if (!mounted) return;

      if (fetchError) {
        console.error("Failed to load certificates:", fetchError);
        setError("Couldn't load certificates. Please refresh and try again.");
      } else {
        setCertificates((data ?? []) as unknown as Certificate[]);
      }

      setLoading(false);
    };

    void load();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!success) return;

    const timer = setTimeout(() => setSuccess(""), 4000);

    return () => clearTimeout(timer);
  }, [success]);

  const handleRevoke = async (certificate: Certificate) => {
    const confirmed = window.confirm(
      `Revoke certificate ${certificate.certificate_number}? It will stop verifying. A student who finished every lesson can generate a new one.`
    );

    if (!confirmed) return;

    const { error: deleteError } = await supabase
      .from("certificates")
      .delete()
      .eq("id", certificate.id);

    if (deleteError) {
      console.error("Failed to revoke certificate:", deleteError);
      setError("Couldn't revoke this certificate. Please try again.");
      return;
    }

    setCertificates((current) =>
      current.filter((item) => item.id !== certificate.id)
    );
    setSuccess("Certificate revoked.");
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
          <Loader2 size={24} className="animate-spin" />
          <span>Loading certificates...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Certificates
        </h1>

        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Certificates issued automatically when a student finishes a course.
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

      <AdminTable<Certificate>
        data={certificates}
        emptyMessage="No certificates issued yet."
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
            key: "certificate_number",
            label: "Number",
            render: (item) => (
              <a
                href={`/certificate/${item.certificate_number}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-blue-600 hover:underline dark:text-cyan-400"
              >
                {item.certificate_number}
                <ExternalLink size={13} />
              </a>
            ),
          },
          {
            key: "issued_at",
            label: "Issued",
            render: (item) => formatDate(item.issued_at),
          },
        ]}
        onDelete={(item) => void handleRevoke(item)}
      />
    </div>
  );
};

export default ManageCertificates;