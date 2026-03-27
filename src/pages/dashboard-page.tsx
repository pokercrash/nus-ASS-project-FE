import { Link } from "react-router-dom";
import { ArrowRight, BellRing, CalendarCheck2, Clock3, MapPin, Sparkles } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/features/auth/use-auth";

const stats = [
  { label: "Upcoming", value: "3", hint: "Confirmed appointments this week" },
  { label: "Today", value: "1", hint: "Next one at 3:30 PM" },
  { label: "Reminders", value: "2", hint: "Notifications scheduled" },
  { label: "Saved Places", value: "5", hint: "Frequent booking locations" },
];

const upcoming = [
  {
    service: "General Consultation",
    provider: "Dr. Lim",
    location: "North Clinic",
    date: "Today, 3:30 PM",
    status: "Confirmed",
  },
  {
    service: "Physiotherapy Session",
    provider: "Amanda Lee",
    location: "West Rehab Centre",
    date: "Fri, 5:00 PM",
    status: "Confirmed",
  },
  {
    service: "Dental Cleaning",
    provider: "Dr. Tan",
    location: "Orchard Health",
    date: "Mon, 10:15 AM",
    status: "Pending",
  },
];

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <PageHeader
        badge="Welcome back"
        title={`Hi ${user?.username ?? "there"}, ready to book your next slot?`}
        description="Track appointments, discover open times, and manage reminders from one dashboard."
      />

      <Card className="animate-slide-up border-primary/20 bg-[linear-gradient(120deg,#ffffff_0%,#f4f9ff_100%)]">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-6">
          <div>
            <p className="text-sm text-muted-foreground">Need an appointment now?</p>
            <p className="mt-1 text-xl font-semibold text-foreground">Find the fastest available slot near you.</p>
          </div>
          <Button asChild className="card-lift">
            <Link to="/app/discover">
              Book now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((card, index) => (
          <Card
            key={card.label}
            className="animate-slide-up border-primary/10 bg-white/92 card-lift"
            style={{ animationDelay: `${90 + index * 70}ms` }}
          >
            <CardHeader className="pb-3">
              <CardDescription>{card.label}</CardDescription>
              <CardTitle className="text-2xl">{card.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{card.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        <Card className="animate-slide-up animate-delay-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarCheck2 className="h-5 w-5 text-primary" />
              Upcoming appointments
            </CardTitle>
            <CardDescription>Your next confirmed sessions at a glance.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcoming.map((item) => (
              <div key={`${item.service}-${item.date}`} className="rounded-lg border border-border bg-background/70 p-3 card-lift">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground">{item.service}</p>
                  <Badge variant={item.status === "Confirmed" ? "success" : "muted"}>{item.status}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{item.provider}</p>
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Clock3 className="h-3.5 w-3.5" />
                    {item.date}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {item.location}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="animate-slide-up animate-delay-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Quick actions
            </CardTitle>
            <CardDescription>Jump to common tasks.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild variant="outline" className="w-full justify-between card-lift">
              <Link to="/app/discover">Find a new appointment</Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-between card-lift">
              <Link to="/app/calendar">View weekly calendar</Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-between card-lift">
              <Link to="/app/reminders">
                Manage reminders
                <BellRing className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
