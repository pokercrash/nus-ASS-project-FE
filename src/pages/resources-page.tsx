import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarClock, MapPin, ShieldAlert, Sparkles, Star } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { listResources, type ResourceSummary } from "@/features/resources/resource-api";
import { useAuth } from "@/features/auth/use-auth";
import { ServiceApiError } from "@/lib/service-error";

type ServiceItem = {
  id: string;
  name: string;
  category: "Consultation" | "Dental" | "Therapy";
  location: string;
  rating: string;
  slots: string[];
};

const fallbackServices: ServiceItem[] = [
  {
    id: "fallback-1",
    name: "General Consultation",
    category: "Consultation",
    location: "North Clinic",
    rating: "4.9",
    slots: ["10:30 AM", "12:00 PM", "3:30 PM"],
  },
  {
    id: "fallback-2",
    name: "Dental Checkup",
    category: "Dental",
    location: "Orchard Health",
    rating: "4.8",
    slots: ["11:15 AM", "2:00 PM", "4:45 PM"],
  },
  {
    id: "fallback-3",
    name: "Physiotherapy",
    category: "Therapy",
    location: "West Rehab Centre",
    rating: "4.9",
    slots: ["9:00 AM", "1:30 PM", "5:00 PM"],
  },
];

const slotTemplates = [
  ["09:30 AM", "11:30 AM", "2:15 PM"],
  ["10:00 AM", "1:00 PM", "4:30 PM"],
  ["8:45 AM", "12:30 PM", "6:00 PM"],
  ["9:15 AM", "3:00 PM", "5:30 PM"],
];

function mapCategory(type: string): ServiceItem["category"] {
  const normalized = type.toLowerCase();
  if (normalized.includes("dental")) return "Dental";
  if (normalized.includes("therapy") || normalized.includes("physio")) return "Therapy";
  return "Consultation";
}

function mapResourcesToServices(resources: ResourceSummary[]): ServiceItem[] {
  return resources.map((resource, index) => ({
    id: resource.id,
    name: resource.name,
    category: mapCategory(resource.type),
    location: resource.location,
    rating: (4.6 + (index % 4) * 0.1).toFixed(1),
    slots: slotTemplates[index % slotTemplates.length],
  }));
}

function getErrorDisplay(error: ServiceApiError | null): string | null {
  if (!error) return null;

  if (error.status === 401) {
    return "Your session has expired. Please sign in again.";
  }

  if (error.status === 403 || error.code === "AUTH_FORBIDDEN") {
    return "You do not have permission to view resources.";
  }

  if (error.status === 404) {
    return "Resource service endpoint not found. Check resource service route/config.";
  }

  if (error.status >= 500) {
    return "Resource service is unavailable right now. Please retry shortly.";
  }

  return error.message;
}

export function ResourcesPage() {
  const { authorizedRequest } = useAuth();

  const [category, setCategory] = useState<"All" | "Consultation" | "Dental" | "Therapy">("All");
  const [selected, setSelected] = useState<{ service: ServiceItem; slot: string } | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [resources, setResources] = useState<ResourceSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<ServiceApiError | null>(null);

  const loadResources = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const data = await listResources(authorizedRequest);
      setResources(data);
    } catch (error) {
      if (error instanceof ServiceApiError) {
        setLoadError(error);
      } else {
        setLoadError(new ServiceApiError(500, "Unexpected resource service error.", error));
      }
    } finally {
      setIsLoading(false);
    }
  }, [authorizedRequest]);

  useEffect(() => {
    void loadResources();
  }, [loadResources]);

  const serviceData = useMemo(
    () => (resources.length > 0 ? mapResourcesToServices(resources) : fallbackServices),
    [resources]
  );

  const categories = useMemo(() => {
    const dynamic = Array.from(new Set(serviceData.map((item) => item.category)));
    return ["All", ...dynamic] as const;
  }, [serviceData]);

  const filteredServices = useMemo(
    () => serviceData.filter((item) => category === "All" || item.category === category),
    [category, serviceData]
  );

  const confirmBooking = () => {
    if (!selected) return;

    const newAppointment = {
      id: `a-${Date.now()}`,
      service: selected.service.category,
      provider: "To be assigned",
      location: selected.service.location.concat(", " + selected.service.name),
      date: `Today, ${selected.slot}`,
      status: "Upcoming" as const,
    };

    try {
      const saved = sessionStorage.getItem("confirmedAppointments");
      const appointments = saved ? JSON.parse(saved) : [];
      appointments.push(newAppointment);
      sessionStorage.setItem("confirmedAppointments", JSON.stringify(appointments));
      console.log("Appointment confirmed and saved:", newAppointment);
    } catch (error) {
      console.error("Failed to save appointment:", error);
    }

    setConfirmed(true);
  };

  const errorMessage = getErrorDisplay(loadError);

  return (
    <div className="space-y-6">
      <PageHeader
        badge="Find slots"
        title="Discover and book appointments"
        description="Choose a service, pick a time, and confirm instantly."
      />

      {errorMessage ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <span className="inline-flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" />
            {errorMessage}
          </span>
          <Button size="sm" variant="outline" onClick={() => void loadResources()}>
            Retry
          </Button>
        </div>
      ) : null}

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
          {isLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <Card key={`loading-${index}`} className="border-primary/10 bg-white/92">
                <CardHeader>
                  <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
                </CardHeader>
                <CardContent>
                  <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
                  <div className="mt-3 flex gap-2">
                    <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
                    <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredServices.length === 0 ? (
            <Card className="border-border/80 bg-white/90 sm:col-span-2">
              <CardContent className="p-6 text-sm text-muted-foreground">
                No services found for this category.
              </CardContent>
            </Card>
          ) : (
            filteredServices.map((service, index) => (
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
            ))
          )}
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
