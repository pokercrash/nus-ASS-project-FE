import { useMemo, useState } from "react";
import { CalendarClock, MapPin, Sparkles, Star } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type ServiceItem = {
  id: string;
  name: string;
  category: "Consultation" | "Dental" | "Therapy";
  location: string;
  rating: string;
  slots: string[];
};

const services: ServiceItem[] = [
  {
    id: "svc-1",
    name: "General Consultation",
    category: "Consultation",
    location: "North Clinic",
    rating: "4.9",
    slots: ["10:30 AM", "12:00 PM", "3:30 PM"],
  },
  {
    id: "svc-2",
    name: "Dental Checkup",
    category: "Dental",
    location: "Orchard Health",
    rating: "4.8",
    slots: ["11:15 AM", "2:00 PM", "4:45 PM"],
  },
  {
    id: "svc-3",
    name: "Physiotherapy",
    category: "Therapy",
    location: "West Rehab Centre",
    rating: "4.9",
    slots: ["9:00 AM", "1:30 PM", "5:00 PM"],
  },
  {
    id: "svc-4",
    name: "Follow-up Consultation",
    category: "Consultation",
    location: "Harbour Medical",
    rating: "4.7",
    slots: ["10:00 AM", "3:00 PM", "6:15 PM"],
  },
];

const categories = ["All", "Consultation", "Dental", "Therapy"] as const;

export function ResourcesPage() {
  const [category, setCategory] = useState<(typeof categories)[number]>("All");
  const [selected, setSelected] = useState<{ service: ServiceItem; slot: string } | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const filteredServices = useMemo(
    () => services.filter((item) => category === "All" || item.category === category),
    [category]
  );

  const confirmBooking = () => {
    if (!selected) return;
    setConfirmed(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        badge="Find slots"
        title="Discover and book appointments"
        description="Choose a service, pick a time, and confirm instantly."
      />

      <div className="flex flex-wrap gap-2">
        {categories.map((item) => (
          <Button
            key={item}
            variant={category === item ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setCategory(item);
              setConfirmed(false);
            }}
            className="card-lift"
          >
            {item}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="grid gap-4 sm:grid-cols-2">
          {filteredServices.map((service, index) => (
            <Card
              key={service.id}
              className="animate-slide-up border-primary/10 bg-white/92 card-lift"
              style={{ animationDelay: `${120 + index * 80}ms` }}
            >
              <CardHeader>
                <CardTitle className="text-base">{service.name}</CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {service.location}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-3 flex items-center gap-2">
                  <Badge variant="muted">{service.category}</Badge>
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="h-3.5 w-3.5 text-primary" />
                    {service.rating}
                  </span>
                </div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Next slots</p>
                <div className="flex flex-wrap gap-2">
                  {service.slots.map((slot) => {
                    const isActive = selected?.service.id === service.id && selected.slot === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        className={`rounded-full border px-3 py-1 text-xs transition-all ${
                          isActive
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background text-foreground hover:border-primary/40 hover:text-primary"
                        }`}
                        onClick={() => {
                          setSelected({ service, slot });
                          setConfirmed(false);
                        }}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="animate-slide-up border-primary/15 bg-[linear-gradient(140deg,#ffffff_0%,#f3f9ff_100%)] animate-delay-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-primary" />
              Booking summary
            </CardTitle>
            <CardDescription>Review before confirming.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selected ? (
              <>
                <div className="rounded-lg border border-border bg-background/70 p-3">
                  <p className="text-sm font-semibold text-foreground">{selected.service.name}</p>
                  <p className="text-xs text-muted-foreground">{selected.service.location}</p>
                  <p className="mt-2 text-sm text-primary">Today, {selected.slot}</p>
                </div>
                <Button onClick={confirmBooking} className="w-full card-lift">
                  Confirm appointment
                </Button>
                {confirmed ? (
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700 animate-fade-in">
                    Appointment confirmed. You can review it in My Appointments.
                  </div>
                ) : null}
              </>
            ) : (
              <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                Select a slot on the left to prepare a booking.
              </div>
            )}

            <div className="rounded-lg border border-border bg-background/70 p-3 text-xs text-muted-foreground">
              <p className="mb-1 inline-flex items-center gap-1 font-medium text-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Smart suggestion
              </p>
              Late afternoon slots usually have shorter wait times.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
