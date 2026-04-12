import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock3, MapPin, ShieldAlert } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/features/auth/use-auth";
import { listResources, type ResourceSummary } from "@/features/resources/resource-api";
import { ServiceApiError } from "@/lib/service-error";

type DayOption = {
  key: string;
  label: string;
  dateLabel: string;
  dayIndex: number;
};

type CapacitySlot = {
  id: string;
  time: string;
  resourceName: string;
  resourceCode: string;
  location: string;
  capacity: number;
  duration: number;
};

function getLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildWeekOptions(): DayOption[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, dayIndex) => {
    const date = new Date(today);
    date.setDate(today.getDate() + dayIndex);

    return {
      key: getLocalDateKey(date),
      label: new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(date),
      dateLabel: new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(date),
      dayIndex,
    };
  });
}

function formatTime(totalMinutes: number): string {
  const date = new Date(2026, 0, 1, 0, totalMinutes);
  return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(date);
}

function buildCapacitySlots(resources: ResourceSummary[], dayIndex: number): CapacitySlot[] {
  return resources
    .filter((resource) => resource.status === "active")
    .flatMap((resource, resourceIndex) => {
      const duration = Math.max(5, resource.slotDurationMin || 30);
      const capacity = Math.max(1, resource.defaultCapacity || 1);
      const firstStart = 9 * 60 + ((resourceIndex + dayIndex) % 4) * 30;
      const slotCount = Math.max(1, Math.min(4, Math.floor(180 / duration)));

      return Array.from({ length: slotCount }, (_, slotIndex) => {
        const start = firstStart + slotIndex * duration;
        return {
          id: `${resource.resourceCode}-${dayIndex}-${slotIndex}`,
          time: formatTime(start),
          resourceName: resource.name,
          resourceCode: resource.resourceCode,
          location: resource.location,
          capacity,
          duration,
        };
      });
    });
}

function getErrorDisplay(error: ServiceApiError | null): string | null {
  if (!error) return null;
  if (error.status === 401) return "Your session has expired. Please sign in again.";
  if (error.status === 403 || error.code === "AUTH_FORBIDDEN") {
    return "You do not have permission to view capacity.";
  }
  if (error.status === 404) return "Capacity endpoint not found. Check resource service route config.";
  if (error.status >= 500) return "Capacity data is unavailable right now. Please retry shortly.";
  return error.message;
}

const weekOptions = buildWeekOptions();

export function CapacityPage() {
  const { authorizedRequest } = useAuth();

  const [day, setDay] = useState<DayOption>(weekOptions[0]);
  const [resources, setResources] = useState<ResourceSummary[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<CapacitySlot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<ServiceApiError | null>(null);

  const loadCapacity = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const data = await listResources(authorizedRequest, { status: "active" });
      setResources(data);
    } catch (error) {
      if (error instanceof ServiceApiError) {
        setLoadError(error);
      } else {
        setLoadError(new ServiceApiError(500, "Unexpected capacity service error.", error));
      }
    } finally {
      setIsLoading(false);
    }
  }, [authorizedRequest]);

  useEffect(() => {
    void loadCapacity();
  }, [loadCapacity]);

  const daySlots = useMemo(() => buildCapacitySlots(resources, day.dayIndex), [day.dayIndex, resources]);
  const activeResourceCount = useMemo(
    () => resources.filter((resource) => resource.status === "active").length,
    [resources]
  );
  const totalCapacity = useMemo(
    () => daySlots.reduce((sum, slot) => sum + slot.capacity, 0),
    [daySlots]
  );
  const errorMessage = getErrorDisplay(loadError);

  return (
    <div className="space-y-6">
      <PageHeader
        badge="Weekly view"
        title="Room capacity"
        description="Check available room capacity before choosing a time."
      />

      {errorMessage ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <span className="inline-flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" />
            {errorMessage}
          </span>
          <Button size="sm" variant="outline" onClick={() => void loadCapacity()}>
            Retry
          </Button>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="animate-slide-up border-primary/10">
          <CardContent className="p-4">
            <p className="text-xs font-medium uppercase text-muted-foreground">Active rooms</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{isLoading ? "..." : activeResourceCount}</p>
          </CardContent>
        </Card>
        <Card className="animate-slide-up border-primary/10 animate-delay-1">
          <CardContent className="p-4">
            <p className="text-xs font-medium uppercase text-muted-foreground">Slots shown</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{isLoading ? "..." : daySlots.length}</p>
          </CardContent>
        </Card>
        <Card className="animate-slide-up border-primary/10 animate-delay-2">
          <CardContent className="p-4">
            <p className="text-xs font-medium uppercase text-muted-foreground">Total capacity</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{isLoading ? "..." : totalCapacity}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="animate-slide-up border-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CalendarDays className="h-5 w-5 text-primary" />
            Select day
          </CardTitle>
          <CardDescription>Choose a day to view active room capacity.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
            {weekOptions.map((item, index) => (
              <button
                key={item.key}
                type="button"
                className={`animate-slide-up rounded-lg border px-3 py-2 text-sm transition-all ${
                  day.key === item.key
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:border-primary/35 hover:text-primary"
                }`}
                style={{ animationDelay: `${90 + index * 50}ms` }}
                onClick={() => {
                  setDay(item);
                  setSelectedSlot(null);
                }}
              >
                <span className="block font-medium">{item.label}</span>
                <span className="block text-xs opacity-80">{item.dateLabel}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        <Card className="animate-slide-up animate-delay-1">
          <CardHeader>
            <CardTitle>{day.label} capacity</CardTitle>
            <CardDescription>
              {isLoading ? "Loading capacity..." : `${daySlots.length} slot(s) from active rooms`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div key={`loading-slot-${index}`} className="rounded-lg border border-border bg-background/70 p-3">
                  <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                  <div className="mt-3 h-3 w-1/2 animate-pulse rounded bg-muted" />
                </div>
              ))
            ) : daySlots.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                No active room capacity yet. Add a room in the admin portal.
              </div>
            ) : (
              daySlots.map((slot) => (
                <div
                  key={slot.id}
                  className="rounded-lg border border-border bg-background/70 p-3 card-lift"
                >
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{slot.resourceName}</p>
                      <p className="text-xs text-muted-foreground">{slot.resourceCode}</p>
                    </div>
                    <Badge variant="default">Capacity {slot.capacity}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Clock3 className="h-3.5 w-3.5" />
                      {slot.time} for {slot.duration} min
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {slot.location}
                    </span>
                  </div>
                  <Button size="sm" className="mt-3 card-lift" onClick={() => setSelectedSlot(slot)}>
                    Select slot
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="animate-slide-up animate-delay-2">
          <CardHeader>
            <CardTitle>Capacity summary</CardTitle>
            <CardDescription>{selectedSlot ? "Selected slot" : "Choose a slot to continue"}</CardDescription>
          </CardHeader>
          <CardContent>
            {selectedSlot ? (
              <div className="space-y-3">
                <div className="rounded-lg border border-border bg-background/70 p-3">
                  <p className="text-sm font-semibold text-foreground">{selectedSlot.resourceName}</p>
                  <p className="text-xs text-muted-foreground">{selectedSlot.location}</p>
                  <p className="mt-2 text-sm text-primary">
                    {day.label}, {day.dateLabel} at {selectedSlot.time}
                  </p>
                </div>
                <Badge variant="success">Capacity {selectedSlot.capacity}</Badge>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                Select a slot to review room capacity.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
