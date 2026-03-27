import { env } from "@/lib/env";

import type { AuthContextValue } from "@/features/auth/auth-store";

export type ResourceSummary = {
  id: string;
  name: string;
  type: string;
  location: string;
  defaultCapacity: number;
  status: string;
  slotDurationMin: number;
};

export type CreateResourceInput = {
  name: string;
  type: string;
  locationSite: string;
  defaultCapacity: number;
  slotDurationMin: number;
};

function normalizeResource(raw: unknown, index: number): ResourceSummary {
  const item = (raw ?? {}) as Record<string, unknown>;
  const location = (item.location ?? {}) as Record<string, unknown>;

  return {
    id: String(item.id ?? item._id ?? `resource-${index}`),
    name: String(item.name ?? "Unnamed Resource"),
    type: String(item.type ?? "General"),
    location: String(
      location.site ??
        location.name ??
        item.locationName ??
        item.location ??
        "Unknown Location"
    ),
    defaultCapacity: Number(item.defaultCapacity ?? item.capacity ?? 1),
    status: String(item.status ?? "active"),
    slotDurationMin: Number(item.slotDurationMin ?? item.slotDuration ?? 30),
  };
}

function normalizeResourceList(payload: unknown): ResourceSummary[] {
  if (Array.isArray(payload)) {
    return payload.map(normalizeResource);
  }

  if (payload && typeof payload === "object") {
    const objectPayload = payload as Record<string, unknown>;
    const candidates = [objectPayload.resources, objectPayload.items, objectPayload.data];
    for (const candidate of candidates) {
      if (Array.isArray(candidate)) {
        return candidate.map(normalizeResource);
      }
    }
  }

  return [];
}

export async function listResources(
  authorizedRequest: AuthContextValue["authorizedRequest"]
): Promise<ResourceSummary[]> {
  const payload = await authorizedRequest<unknown>(`${env.resourceBaseUrl}/api/v1/resources`, {
    method: "GET",
  });
  return normalizeResourceList(payload);
}

export async function createResource(
  authorizedRequest: AuthContextValue["authorizedRequest"],
  input: CreateResourceInput
): Promise<ResourceSummary> {
  const payload = await authorizedRequest<unknown>(`${env.resourceBaseUrl}/api/v1/resources`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: input.name,
      type: input.type,
      defaultCapacity: input.defaultCapacity,
      slotDurationMin: input.slotDurationMin,
      status: "active",
      location: {
        site: input.locationSite,
      },
    }),
  });

  return normalizeResource(payload, 0);
}
