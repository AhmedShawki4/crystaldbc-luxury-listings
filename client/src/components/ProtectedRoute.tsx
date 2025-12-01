import { Navigate, useLocation } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import type { ReactNode } from "react";
import type { Role } from "@/types";
import AccessRestricted from "@/components/AccessRestricted";

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
    return <AccessRestricted />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
