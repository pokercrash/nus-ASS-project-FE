import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "@/features/auth/use-auth";

function BootstrappingScreen() {
  return (
    <div className="grid min-h-screen place-items-center bg-background">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
        <p className="mt-4 text-sm text-muted-foreground">Restoring session...</p>
      </div>
    </div>
  );
}

function homeByRole(role: string | undefined) {
  return role === "admin" ? "/admin/dashboard" : "/app/dashboard";
}

export function UserProtectedRoute() {
  const { isAuthenticated, isBootstrapping, user } = useAuth();

  if (isBootstrapping) {
    return <BootstrappingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Outlet />;
}

export function AdminProtectedRoute() {
  const { isAuthenticated, isBootstrapping, user } = useAuth();

  if (isBootstrapping) {
    return <BootstrappingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  if (user?.role !== "admin") {
    return <Navigate to="/app/dashboard" replace />;
  }

  return <Outlet />;
}

export function PublicUserRoute() {
  const { isAuthenticated, isBootstrapping, user } = useAuth();

  if (isBootstrapping) {
    return <BootstrappingScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to={homeByRole(user?.role)} replace />;
  }

  return <Outlet />;
}

export function PublicAdminRoute() {
  const { isAuthenticated, isBootstrapping, user } = useAuth();

  if (isBootstrapping) {
    return <BootstrappingScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to={homeByRole(user?.role)} replace />;
  }

  return <Outlet />;
}
