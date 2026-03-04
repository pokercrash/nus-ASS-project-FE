import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, Clock3, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const highlights = [
  "Book in under 30 seconds",
  "Real-time slot availability",
  "Instant confirmation reminders",
  "Secure sign-in across sessions",
];

const serviceCards = [
  {
    title: "General Consultation",
    meta: "North Clinic",
    slot: "Today, 3:30 PM",
    icon: CalendarDays,
  },
  {
    title: "Dental Checkup",
    meta: "Orchard Health",
    slot: "Tomorrow, 10:15 AM",
    icon: Clock3,
  },
  {
    title: "Physiotherapy",
    meta: "West Rehab Centre",
    slot: "Fri, 5:00 PM",
    icon: MapPin,
  },
];

export function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(140deg,#eef6ff_0%,#f8fbff_42%,#ffffff_100%)]">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -left-24 top-10 h-80 w-80 rounded-full bg-blue-400/20 blur-3xl animate-pulse-soft" />
        <div className="absolute right-4 top-36 h-72 w-72 rounded-full bg-blue-300/25 blur-3xl animate-pulse-soft" />
      </div>

      <div className="container py-10 sm:py-16">
        <header className="mb-12 flex items-center justify-between rounded-xl border border-white/60 bg-white/75 px-4 py-3 shadow-sm backdrop-blur sm:px-6">
          <p className="text-sm font-semibold text-primary">Bookly Care</p>
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm">
              <Link to="/login">Sign in</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/register">Create account</Link>
            </Button>
          </div>
        </header>

        <section className="grid gap-8 lg:grid-cols-[1.35fr_1fr] lg:items-start">
          <div>
            <Badge variant="success" className="mb-4 animate-slide-up">
              Appointment booking made simple
            </Badge>
            <h1 className="animate-slide-up text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
              Find the right time slot and confirm your appointment in seconds.
            </h1>
            <p className="mt-5 max-w-2xl animate-slide-up animate-delay-1 text-base leading-7 text-muted-foreground sm:text-lg">
              Browse nearby services, compare available times, and manage your bookings in one clean calendar
              experience.
            </p>

            <div className="mt-8 flex flex-wrap gap-3 animate-slide-up animate-delay-2">
              <Button asChild size="lg" className="card-lift">
                <Link to="/login">
                  Start booking
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="card-lift">
                <Link to="/register">Create your account</Link>
              </Button>
            </div>

            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {highlights.map((item, index) => (
                <li
                  key={item}
                  className="animate-slide-up rounded-lg border border-border/70 bg-white/75 p-3 text-sm card-lift"
                  style={{ animationDelay: `${220 + index * 90}ms` }}
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <Card className="animate-slide-up border-primary/15 bg-white/88 shadow-soft animate-delay-1">
            <CardHeader>
              <CardTitle>Next available appointments</CardTitle>
              <CardDescription>Preview how quickly users can discover open slots.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {serviceCards.map((service) => (
                <div key={service.title} className="rounded-lg border border-border bg-background/60 p-3 card-lift">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground">{service.title}</p>
                    <service.icon className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-xs text-muted-foreground">{service.meta}</p>
                  <p className="mt-2 text-sm text-primary">{service.slot}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
