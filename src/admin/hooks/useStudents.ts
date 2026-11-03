import { useEffect, useMemo, useState } from "react";

import { supabase } from "../../lib/supabase";

export type Student = {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
};

/*
 * Loads every account through the admin-only database function,
 * plus a lookup by id for tables that only hold a user_id.
 */
const useStudents = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const { data, error: rpcError } = await supabase.rpc(
        "admin_list_students"
      );

      if (!mounted) return;

      if (rpcError) {
        console.error("Failed to load students:", rpcError);
        setError("Couldn't load students. Please refresh and try again.");
      } else {
        setStudents(data ?? []);
      }

      setLoading(false);
    };

    void load();

    return () => {
      mounted = false;
    };
  }, []);

  const byId = useMemo(
    () => new Map(students.map((student) => [student.id, student])),
    [students]
  );

  return { students, byId, loading, error };
};

export default useStudents;