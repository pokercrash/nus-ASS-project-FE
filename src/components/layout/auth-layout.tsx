import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import { cn } from "@/lib/utils";

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footerText: string;
  footerLinkLabel: string;
  footerLinkTo: string;
};

export function AuthLayout({
  title,
  subtitle,
  children,
  footerText,
  footerLinkLabel,
  footerLinkTo,
}: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(140deg,#eef5ff_0%,#f7fbff_45%,#ffffff_100%)]">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -left-16 top-12 h-64 w-64 rounded-full bg-blue-300/20 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <div className="container flex min-h-screen items-center justify-center py-10">
        <div className="w-full max-w-md rounded-2xl border border-border/80 bg-white/90 p-8 shadow-soft backdrop-blur">
          <Link
            to="/"
            className={cn(
              "mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground",
              "hover:border-primary/40 hover:text-primary"
            )}
          >
            Bookly Care
          </Link>

          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>

          <div className="mt-6">{children}</div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {footerText}{" "}
            <Link to={footerLinkTo} className="font-medium text-primary hover:underline">
              {footerLinkLabel}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
