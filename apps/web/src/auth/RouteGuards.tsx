import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

/** FR-009/SC-009: no admin session -> redirected to the admin login screen. */
export function RequireAdmin({ children }: { children: ReactNode }) {
  const { firebaseUser, isAdmin, loading } = useAuth();

  if (loading) {
    return null;
  }
  if (!firebaseUser || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { firebaseUser, loading } = useAuth();

  if (loading) {
    return null;
  }
  if (!firebaseUser) {
    return <Navigate to="/signin" replace />;
  }
  return <>{children}</>;
}
