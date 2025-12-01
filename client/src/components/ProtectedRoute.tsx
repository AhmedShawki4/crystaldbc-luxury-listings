import { Navigate, useLocation } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import type { ReactNode } from "react";
import type { Role } from "@/types";

interface ProtectedRouteProps {
  children: ReactNode;
  roles?: Role[];
}

const ProtectedRoute = ({ children, roles }: ProtectedRouteProps) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  if (roles && user && !roles.includes(user.role)) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <h2 className="text-2xl font-display font-semibold">Access Restricted</h2>
        <p className="text-muted-foreground max-w-lg">
          You do not have permission to view this page. Please contact an administrator if you believe this is an error.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
