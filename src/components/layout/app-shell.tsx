import { useMemo, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import {
  BellRing,
  CalendarDays,
  Compass,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  UserCircle2,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth/auth-context";

const navItems = [
  { to: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/app/discover", label: "Find Slots", icon: Compass },
  { to: "/app/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/app/appointments", label: "My Appointments", icon: ListChecks },
  { to: "/app/reminders", label: "Reminders", icon: BellRing },
  { to: "/app/account", label: "Account", icon: UserCircle2 },
];

function formatDateForHeader(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function AppShell() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const activeLabel = useMemo(
    () => navItems.find((item) => location.pathname.startsWith(item.to))?.label ?? "Dashboard",
    [location.pathname]
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(31,114,255,0.22),transparent_35%),radial-gradient(circle_at_90%_20%,rgba(148,197,255,0.24),transparent_40%),linear-gradient(180deg,#fafdff_0%,#f5f8ff_55%,#eef4ff_100%)]" />
      <div className="mx-auto flex max-w-[1400px] gap-4 px-3 py-3 sm:px-6 sm:py-6">
        <aside
          className={cn(
            "fixed inset-y-3 left-3 z-50 w-72 rounded-2xl border border-border/80 bg-white/92 p-4 shadow-soft backdrop-blur transition-transform duration-300 lg:static lg:block lg:w-72 lg:translate-x-0",
            open ? "translate-x-0" : "-translate-x-[120%] lg:translate-x-0"
          )}
        >
          <div className="mb-6 flex items-center justify-between">
            <Link to="/app/dashboard" className="group flex items-center gap-2">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground animate-float">
                AB
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Appointment</p>
                <p className="text-sm font-semibold text-foreground">Bookly Care</p>
              </div>
            </Link>
            <button
              type="button"
              className="rounded-md p-1 text-muted-foreground hover:bg-primary/10 lg:hidden"
              onClick={() => setOpen(false)}
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-soft"
                      : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-8 rounded-lg border border-border bg-background/80 p-3 text-xs text-muted-foreground">
            Signed in as <span className="font-semibold text-foreground">{user?.username ?? "guest"}</span>
          </div>
        </aside>

        <main className="w-full lg:min-h-[calc(100vh-3rem)]">
          <header className="mb-4 flex items-center justify-between rounded-2xl border border-border/70 bg-white/86 px-4 py-3 shadow-sm backdrop-blur sm:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="rounded-md border border-border p-2 text-muted-foreground hover:bg-primary/10 hover:text-primary lg:hidden"
                onClick={() => setOpen(true)}
                aria-label="Open sidebar"
              >
                <Menu className="h-4 w-4" />
              </button>
              <div>
                <p className="text-sm font-semibold text-foreground">{activeLabel}</p>
                <p className="text-xs text-muted-foreground">{formatDateForHeader(new Date())}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => void logout()}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </header>

          <section className="animate-fade-in rounded-2xl border border-border/60 bg-white/90 p-4 shadow-sm backdrop-blur sm:p-6">
            <Outlet />
          </section>
        </main>
      </div>
    </div>
  );
}
