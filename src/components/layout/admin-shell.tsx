import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, LogOut, Menu, ShieldCheck, Wrench, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth/use-auth";

const navItems = [
  { to: "/admin/dashboard", label: "Admin Dashboard", icon: LayoutDashboard },
  { to: "/admin/resources", label: "Resource Management", icon: Wrench },
];

export function AdminShell() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(0,94,184,0.18),transparent_35%),linear-gradient(180deg,#f7fbff_0%,#eef6ff_100%)]" />
      <div className="mx-auto flex max-w-[1400px] gap-4 px-3 py-3 sm:px-6 sm:py-6">
        <aside
          className={cn(
            "fixed inset-y-3 left-3 z-50 w-72 rounded-2xl border border-border/80 bg-white/92 p-4 shadow-soft backdrop-blur transition-transform duration-300 lg:static lg:block lg:w-72 lg:translate-x-0",
            open ? "translate-x-0" : "-translate-x-[120%] lg:translate-x-0"
          )}
        >
          <div className="mb-6 flex items-center justify-between">
            <Link to="/admin/dashboard" className="flex items-center gap-2">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Admin</p>
                <p className="text-sm font-semibold text-foreground">Bookly Console</p>
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
            Logged in as <span className="font-semibold text-foreground">{user?.username ?? "admin"}</span>
          </div>
        </aside>

        <main className="w-full lg:min-h-[calc(100vh-3rem)]">
          <header className="mb-4 flex items-center justify-between rounded-2xl border border-border/70 bg-white/86 px-4 py-3 shadow-sm backdrop-blur sm:px-6">
            <button
              type="button"
              className="rounded-md border border-border p-2 text-muted-foreground hover:bg-primary/10 hover:text-primary lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu className="h-4 w-4" />
            </button>
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
