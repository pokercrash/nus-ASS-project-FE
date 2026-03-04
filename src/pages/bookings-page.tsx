import { useMemo, useState } from "react";
import { CalendarClock, MapPin, UserRound } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type AppointmentStatus = "Upcoming" | "Completed" | "Cancelled";

type Appointment = {
  id: string;
  service: string;
  provider: string;
  location: string;
  date: string;
  status: AppointmentStatus;
};

const appointments: Appointment[] = [
  {
    id: "a1",
    service: "General Consultation",
    provider: "Dr. Lim",
    location: "North Clinic",
    date: "Today, 3:30 PM",
    status: "Upcoming",
  },
  {
    id: "a2",
    service: "Physiotherapy Session",
    provider: "Amanda Lee",
    location: "West Rehab Centre",
    date: "Fri, 5:00 PM",
    status: "Upcoming",
  },
  {
    id: "a3",
    service: "Dental Cleaning",
    provider: "Dr. Tan",
    location: "Orchard Health",
    date: "Last Tue, 10:15 AM",
    status: "Completed",
  },
  {
    id: "a4",
    service: "Nutrition Follow-up",
    provider: "Mia Wong",
    location: "Harbour Medical",
    date: "Last Mon, 2:00 PM",
    status: "Cancelled",
  },
];

const filters: AppointmentStatus[] = ["Upcoming", "Completed", "Cancelled"];

function statusVariant(status: AppointmentStatus): "success" | "muted" | "default" {
  if (status === "Upcoming") return "success";
  if (status === "Completed") return "muted";
  return "default";
}

export function BookingsPage() {
  const [filter, setFilter] = useState<AppointmentStatus>("Upcoming");

  const filtered = useMemo(
    () => appointments.filter((item) => item.status === filter),
    [filter]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        badge="My appointments"
        title="Manage your bookings"
        description="Reschedule, cancel, or review completed visits in one place."
      />

      <div className="flex flex-wrap gap-2">
        {filters.map((item) => (
          <Button
            key={item}
            variant={item === filter ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(item)}
            className="card-lift"
          >
            {item}
          </Button>
        ))}
      </div>

      <Card className="animate-slide-up border-primary/10">
        <CardHeader>
          <CardTitle>{filter} appointments</CardTitle>
          <CardDescription>{filtered.length} result(s)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {filtered.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
              No appointments in this category.
            </div>
          ) : (
            filtered.map((item, index) => (
              <div
                key={item.id}
                className="animate-slide-up rounded-lg border border-border bg-background/70 p-3 card-lift"
                style={{ animationDelay: `${80 + index * 60}ms` }}
              >
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground">{item.service}</p>
                  <Badge variant={statusVariant(item.status)}>{item.status}</Badge>
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <CalendarClock className="h-3.5 w-3.5" />
                    {item.date}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <UserRound className="h-3.5 w-3.5" />
                    {item.provider}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {item.location}
                  </span>
                </div>
                {item.status === "Upcoming" ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" className="card-lift">
                      Reschedule
                    </Button>
                    <Button size="sm" variant="outline" className="card-lift">
                      Cancel
                    </Button>
                  </div>
                ) : null}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
