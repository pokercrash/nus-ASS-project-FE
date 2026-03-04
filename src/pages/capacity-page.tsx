import { useMemo, useState } from "react";
import { CalendarDays, Clock3, MapPin } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Slot = {
  time: string;
  service: string;
  location: string;
  available: number;
};

const week = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const slotMap: Record<string, Slot[]> = {
  Mon: [
    { time: "09:00 AM", service: "General Consultation", location: "North Clinic", available: 3 },
    { time: "01:30 PM", service: "Dental Checkup", location: "Orchard Health", available: 2 },
    { time: "05:00 PM", service: "Physiotherapy", location: "West Rehab Centre", available: 1 },
  ],
  Tue: [
    { time: "10:00 AM", service: "Follow-up Consultation", location: "Harbour Medical", available: 4 },
    { time: "02:15 PM", service: "General Consultation", location: "North Clinic", available: 3 },
  ],
  Wed: [
    { time: "11:00 AM", service: "Dental Checkup", location: "Orchard Health", available: 2 },
    { time: "04:30 PM", service: "Physiotherapy", location: "West Rehab Centre", available: 2 },
  ],
  Thu: [{ time: "03:00 PM", service: "General Consultation", location: "North Clinic", available: 5 }],
  Fri: [
    { time: "09:30 AM", service: "Therapy Review", location: "West Rehab Centre", available: 2 },
    { time: "05:30 PM", service: "General Consultation", location: "Harbour Medical", available: 1 },
  ],
  Sat: [{ time: "11:30 AM", service: "Dental Checkup", location: "Orchard Health", available: 4 }],
  Sun: [],
};

export function CapacityPage() {
  const [day, setDay] = useState<(typeof week)[number]>("Wed");

  const daySlots = useMemo(() => slotMap[day] ?? [], [day]);

  return (
    <div className="space-y-6">
      <PageHeader
        badge="Weekly view"
        title="Booking calendar"
        description="Explore available slots by day and book at your preferred time."
      />

      <Card className="animate-slide-up border-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CalendarDays className="h-5 w-5 text-primary" />
            Select day
          </CardTitle>
          <CardDescription>Tap any day to view open appointments.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
            {week.map((item, index) => (
              <button
                key={item}
                type="button"
                className={`animate-slide-up rounded-lg border px-3 py-2 text-sm transition-all ${
                  day === item
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:border-primary/35 hover:text-primary"
                }`}
                style={{ animationDelay: `${90 + index * 50}ms` }}
                onClick={() => setDay(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="animate-slide-up animate-delay-1">
        <CardHeader>
          <CardTitle>{day} appointments</CardTitle>
          <CardDescription>{daySlots.length === 0 ? "No slots available" : "Choose from open times below"}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {daySlots.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
              No slots on {day}. Try another day in the week.
            </div>
          ) : (
            daySlots.map((slot) => (
              <div
                key={`${slot.service}-${slot.time}`}
                className="rounded-lg border border-border bg-background/70 p-3 card-lift"
              >
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground">{slot.service}</p>
                  <Badge variant="default">{slot.available} spots left</Badge>
                </div>
                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Clock3 className="h-3.5 w-3.5" />
                    {slot.time}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {slot.location}
                  </span>
                </div>
                <Button size="sm" className="mt-3 card-lift">
                  Reserve this slot
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
