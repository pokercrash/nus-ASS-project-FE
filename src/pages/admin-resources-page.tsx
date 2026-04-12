import { useCallback, useEffect, useState, type FormEvent } from "react";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/features/auth/use-auth";
import {
  buildCreateResourcePayload,
  createResource,
  ensureResourceAdminAccess,
  listResources,
  updateResourceStatus,
  validateCreateResourcePayload,
  type CreateResourceInput,
  type ResourceStatus,
  type ResourceSummary,
} from "@/features/resources/resource-api";
import { ServiceApiError } from "@/lib/service-error";

const initialForm: CreateResourceInput = {
  room: "",
  defaultCapacity: "1",
};

function friendlyError(error: ServiceApiError | null): string | null {
  if (!error) return null;
  if (error.code === "RESOURCE_CONFLICT" || error.status === 409) {
    return "A room with this generated code already exists.";
  }
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
  const [statusDrafts, setStatusDrafts] = useState<Record<string, ResourceStatus>>({});
  const [updatingResourceCode, setUpdatingResourceCode] = useState<string | null>(null);

  const previewPayload = buildCreateResourcePayload(form);

  const loadResources = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await ensureResourceAdminAccess(authorizedRequest);
      const data = await listResources(authorizedRequest);
      setResources(data);
      setStatusDrafts(Object.fromEntries(data.map((resource) => [resource.resourceCode, resource.status])));
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
    setSuccess(null);
    setError(null);

    const payload = buildCreateResourcePayload(form);
    const validationError = validateCreateResourcePayload(payload);
    if (validationError) {
      setError(new ServiceApiError(400, validationError, { error: validationError }));
      return;
    }

    setSaving(true);

    try {
      await ensureResourceAdminAccess(authorizedRequest);
      await createResource(authorizedRequest, payload);
      setSuccess(`${payload.name} is ready for booking.`);
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

  const onUpdateStatus = async (resource: ResourceSummary) => {
    const nextStatus = statusDrafts[resource.resourceCode] ?? resource.status;
    if (nextStatus === resource.status) {
      setSuccess(`${resource.name} is already ${nextStatus}.`);
      return;
    }

    setSuccess(null);
    setError(null);
    setUpdatingResourceCode(resource.resourceCode);

    try {
      await ensureResourceAdminAccess(authorizedRequest);
      await updateResourceStatus(authorizedRequest, resource.resourceCode, nextStatus);
      setSuccess(`${resource.name} updated to ${nextStatus}.`);
      await loadResources();
    } catch (err) {
      if (err instanceof ServiceApiError) {
        setError(err);
      } else {
        setError(new ServiceApiError(500, "Unexpected resource service error.", err));
      }
    } finally {
      setUpdatingResourceCode(null);
    }
  };

  const errorMessage = friendlyError(error);
  const generatedCode = previewPayload.resourceCode || "Generated after room detail";

  return (
    <div className="space-y-6">
      <PageHeader
        badge="Admin only"
        title="Resource Management"
        description="Add rooms that users can book."
      />

      {errorMessage ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      {success ? (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          {success}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Create bookable room</CardTitle>
            <CardDescription>Rooms are saved as active clinic resources with 30-minute slots.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="space-y-2">
                <Label htmlFor="resource-room">Room detail</Label>
                <Input
                  id="resource-room"
                  value={form.room}
                  onChange={(event) => setForm((prev) => ({ ...prev, room: event.target.value }))}
                  placeholder="A101 or Consultation Room 2"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="resource-capacity">Capacity</Label>
                <Input
                  id="resource-capacity"
                  type="number"
                  min={1}
                  value={form.defaultCapacity}
                  onChange={(event) => setForm((prev) => ({ ...prev, defaultCapacity: event.target.value }))}
                  required
                />
              </div>

              <div className="rounded-md border border-border bg-background/70 px-3 py-3 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Defaults</p>
                <p className="mt-1">
                  NUS, University Health Centre - active clinic room - capacity{" "}
                  {previewPayload.defaultCapacity}
                </p>
                <p className="mt-1">Resource code: {generatedCode}</p>
              </div>

              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? "Creating..." : "Create room"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Existing rooms</CardTitle>
            <CardDescription>{loading ? "Loading..." : `${resources.length} resource(s)`}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading rooms...</p>
            ) : resources.length === 0 ? (
              <p className="text-sm text-muted-foreground">No rooms returned by service.</p>
            ) : (
              resources.slice(0, 8).map((resource) => (
                <div key={resource.id} className="rounded-md border border-border bg-background/70 px-3 py-2">
                  <p className="text-sm font-medium text-foreground">{resource.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {resource.resourceCode} - {resource.location} - {resource.status} - cap{" "}
                    {resource.defaultCapacity}
                  </p>
                  <div className="mt-3 flex flex-wrap items-end gap-2">
                    <div className="min-w-36 space-y-1">
                      <Label htmlFor={`resource-status-${resource.resourceCode}`}>Status</Label>
                      <select
                        id={`resource-status-${resource.resourceCode}`}
                        value={statusDrafts[resource.resourceCode] ?? resource.status}
                        onChange={(event) =>
                          setStatusDrafts((prev) => ({
                            ...prev,
                            [resource.resourceCode]: event.target.value as ResourceStatus,
                          }))
                        }
                        className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="maintenance">Maintenance</option>
                      </select>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={updatingResourceCode === resource.resourceCode}
                      onClick={() => void onUpdateStatus(resource)}
                    >
                      {updatingResourceCode === resource.resourceCode ? "Updating..." : "Update"}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
