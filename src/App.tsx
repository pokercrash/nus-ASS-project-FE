import { AdminShell } from "@/components/layout/admin-shell";
import { AdminDashboardPage } from "@/pages/admin-dashboard-page";
import { AdminLoginPage } from "@/pages/admin-login-page";
import { AdminResourcesPage } from "@/pages/admin-resources-page";
import { Navigate, Route, Routes } from "react-router-dom";

import { AppShell } from "@/components/layout/app-shell";
import { AccountPage } from "@/pages/deployment-page";
import { CapacityPage } from "@/pages/capacity-page";
import { DashboardPage } from "@/pages/dashboard-page";
import { LandingPage } from "@/pages/landing-page";
import { LoadBalancerDemoPage } from "@/pages/load-balancer-demo-page";
import { LoginPage } from "@/pages/login-page";
import { NotFoundPage } from "@/pages/not-found-page";
import { NotificationsPage } from "@/pages/notifications-page";
import { RegisterPage } from "@/pages/register-page";
import { ResourcesPage } from "@/pages/resources-page";
import { BookingsPage } from "@/pages/bookings-page";
import {
  AdminProtectedRoute,
  PublicAdminRoute,
  PublicUserRoute,
  UserProtectedRoute,
} from "@/router/route-guards";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/lb-demo" element={<LoadBalancerDemoPage />} />
      <Route path="/load-balancer-demo" element={<LoadBalancerDemoPage />} />

      <Route element={<PublicUserRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<PublicAdminRoute />}>
        <Route path="/admin/login" element={<AdminLoginPage />} />
      </Route>

      <Route element={<UserProtectedRoute />}>
        <Route path="/app" element={<AppShell />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="discover" element={<ResourcesPage />} />
          <Route path="calendar" element={<CapacityPage />} />
          <Route path="appointments" element={<BookingsPage />} />
          <Route path="reminders" element={<NotificationsPage />} />
          <Route path="account" element={<AccountPage />} />
        </Route>
      </Route>

      <Route element={<AdminProtectedRoute />}>
        <Route path="/admin" element={<AdminShell />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="resources" element={<AdminResourcesPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
