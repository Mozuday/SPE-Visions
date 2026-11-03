import { Loader2 } from "lucide-react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import useAuth from "../../hooks/useAuth";

const RequireAuth = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-slate-500">
        <Loader2 size={24} className="animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  return <Outlet />;
};

export default RequireAuth;