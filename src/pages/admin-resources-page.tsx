import { useCallback, useEffect, useState, type FormEvent } from "react";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/features/auth/use-auth";
import {
  createResource,
  listResources,
  type CreateResourceInput,
  type ResourceSummary,
} from "@/features/resources/resource-api";
import { ServiceApiError } from "@/lib/service-error";

const initialForm: CreateResourceInput = {
  name: "",
  type: "consultation",
  locationSite: "",
  defaultCapacity: 1,
  slotDurationMin: 30,
};

function friendlyError(error: ServiceApiError | null): string | null {
  if (!error) return null;
  if (error.status === 403) return "You are logged in but not allowed to manage resources.";
  if (error.status === 404) return "Resource endpoint not found. Check service route config.";
  if (error.status === 401) return "Session expired. Please sign in as admin again.";
  return error.message;
}

export function AdminResourcesPage() {
  const { authorizedRequest } = useAuth();

  const [resources, setResources] = useState<ResourceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<ServiceApiError | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState<CreateResourceInput>(initialForm);

  const loadResources = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listResources(authorizedRequest);
      setResources(data);
    } catch (err) {
      if (err instanceof ServiceApiError) {
        setError(err);
      } else {
        setError(new ServiceApiError(500, "Unexpected resource service error.", err));
      }
    } finally {
      setLoading(false);
    }
  }, [authorizedRequest]);

  useEffect(() => {
    void loadResources();
  }, [loadResources]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setSuccess(null);
    setError(null);

    try {
      await createResource(authorizedRequest, form);
      setSuccess("Resource created successfully.");
      setForm(initialForm);
      await loadResources();
    } catch (err) {
      if (err instanceof ServiceApiError) {
        setError(err);
      } else {
        setError(new ServiceApiError(500, "Unexpected resource service error.", err));
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        badge="Admin only"
        title="Resource Management"
        description="Create and maintain resources that users can book."
      />

      {friendlyError(error) ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {friendlyError(error)}
        </div>
      ) : null}

      {success ? (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          {success}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Create resource</CardTitle>
            <CardDescription>Admin-only create flow for resource service.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="space-y-2">
                <Label htmlFor="resource-name">Name</Label>
                <Input
                  id="resource-name"
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  placeholder="Clinic Room A"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="resource-type">Type</Label>
                <Input
                  id="resource-type"
                  value={form.type}
                  onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))}
                  placeholder="consultation"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="resource-site">Location Site</Label>
                <Input
                  id="resource-site"
                  value={form.locationSite}
                  onChange={(event) => setForm((prev) => ({ ...prev, locationSite: event.target.value }))}
                  placeholder="North Clinic"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="resource-capacity">Default Capacity</Label>
                  <Input
                    id="resource-capacity"
                    type="number"
                    min={1}
                    value={form.defaultCapacity}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, defaultCapacity: Number(event.target.value || 1) }))
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="resource-duration">Slot Duration (min)</Label>
                  <Input
                    id="resource-duration"
                    type="number"
                    min={5}
                    value={form.slotDurationMin}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, slotDurationMin: Number(event.target.value || 30) }))
                    }
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? "Creating..." : "Create resource"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Existing resources</CardTitle>
            <CardDescription>{loading ? "Loading..." : `${resources.length} resource(s)`}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading resources...</p>
            ) : resources.length === 0 ? (
              <p className="text-sm text-muted-foreground">No resources returned by service.</p>
            ) : (
              resources.slice(0, 8).map((resource) => (
                <div key={resource.id} className="rounded-md border border-border bg-background/70 px-3 py-2">
                  <p className="text-sm font-medium text-foreground">{resource.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {resource.location} • {resource.type} • cap {resource.defaultCapacity}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
