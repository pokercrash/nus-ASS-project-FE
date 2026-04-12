import { env } from "@/lib/env";
import { ServiceApiError } from "@/lib/service-error";

import type { AuthContextValue } from "@/features/auth/auth-store";

const RESOURCE_PREFIX = `${env.resourceBaseUrl}/api/v1`;
const RESOURCE_STATUSES = ["active", "inactive", "maintenance"] as const;
const DEFAULT_ROOM_TYPE = "clinic";
const DEFAULT_ROOM_LOCATION = {
  site: "NUS",
  building: "University Health Centre",
  floor: "",
  timezone: "Asia/Singapore",
} as const;

type AuthorizedRequest = AuthContextValue["authorizedRequest"];
type ResourceRecord = Record<string, unknown>;

export type ResourceStatus = (typeof RESOURCE_STATUSES)[number];

export type ResourceLocation = {
  site?: string;
  building?: string;
  floor?: string;
  room?: string;
  timezone?: string;
};

export type Resource = {
  resourceCode: string;
  name: string;
  type: string;
  status: ResourceStatus;
  location: {
    site: string;
    building: string;
    floor: string;
    room: string;
    timezone: string;
  };
  slotDurationMin: number;
  defaultCapacity: number;
  tags: string[];
  metadata: Record<string, unknown>;
};

export type ResourceSummary = {
  id: string;
  resourceCode: string;
  name: string;
  type: string;
  location: string;
  defaultCapacity: number;
  status: ResourceStatus;
  slotDurationMin: number;
};

export type CreateResourceInput = {
  room: string;
};

export type CreateResourcePayload = {
  resourceCode: string;
  name: string;
  type: string;
  status?: ResourceStatus;
  location?: ResourceLocation;
  slotDurationMin?: number;
  defaultCapacity?: number;
  tags?: string[];
  metadata?: Record<string, unknown>;
};

export type ResourceAuthContext = {
  message?: string;
  user?: {
    username?: string;
    role?: string;
  };
};

function isRecord(value: unknown): value is ResourceRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function toTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function toNumber(value: unknown, fallback: number): number {
  const numberValue = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function buildRoomResourceCode(room: string): string {
  const slug = room
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  const normalizedSlug = slug.replace(/^ROOM_+/, "");

  return normalizedSlug ? `ROOM_${normalizedSlug}` : "";
}

function buildRoomResourceName(room: string): string {
  const trimmed = room.trim();
  if (!trimmed) return "";
  return trimmed.toLowerCase().includes("room") ? trimmed : `Room ${trimmed}`;
}

function normalizeStatus(value: unknown): ResourceStatus {
  return RESOURCE_STATUSES.includes(value as ResourceStatus) ? (value as ResourceStatus) : "active";
}

function formatResourceLocation(value: unknown): string {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  if (!isRecord(value)) {
    return "Unknown Location";
  }

  const parts = [value.site, value.building, value.floor, value.room]
    .map(toTrimmedString)
    .filter(Boolean);

  return parts.length > 0 ? parts.join(", ") : "Unknown Location";
}

function normalizeResource(raw: unknown, index: number): ResourceSummary {
  const item = isRecord(raw) ? raw : {};
  const resourceCode = String(item.resourceCode ?? item.id ?? item._id ?? `resource-${index}`);

  return {
    id: resourceCode,
    resourceCode,
    name: String(item.name ?? "Unnamed Resource"),
    type: String(item.type ?? "General"),
    location: formatResourceLocation(item.location ?? item.locationName),
    defaultCapacity: toNumber(item.defaultCapacity ?? item.capacity, 1),
    status: normalizeStatus(item.status),
    slotDurationMin: toNumber(item.slotDurationMin ?? item.slotDuration, 30),
  };
}

function normalizeResourceList(payload: unknown): ResourceSummary[] {
  if (Array.isArray(payload)) {
    return payload.map(normalizeResource);
  }

  if (isRecord(payload)) {
    const objectPayload = payload;
    const candidates = [objectPayload.resources, objectPayload.items, objectPayload.data];
    for (const candidate of candidates) {
      if (Array.isArray(candidate)) {
        return candidate.map(normalizeResource);
      }
      if (isRecord(candidate) && Array.isArray(candidate.items)) {
        return candidate.items.map(normalizeResource);
      }
    }
  }

  return [];
}

function extractResourceItem(payload: unknown): unknown {
  if (!isRecord(payload)) {
    return null;
  }

  if (isRecord(payload.item)) {
    return payload.item;
  }

  if (isRecord(payload.data)) {
    return payload.data;
  }

  if (isRecord(payload.resource)) {
    return payload.resource;
  }

  if ("resourceCode" in payload || "name" in payload || "type" in payload) {
    return payload;
  }

  return null;
}

export function buildCreateResourcePayload(form: CreateResourceInput): CreateResourcePayload {
  const room = form.room.trim();

  return {
    resourceCode: buildRoomResourceCode(room),
    name: buildRoomResourceName(room),
    type: DEFAULT_ROOM_TYPE,
    status: "active",
    location: {
      site: DEFAULT_ROOM_LOCATION.site,
      building: DEFAULT_ROOM_LOCATION.building,
      floor: DEFAULT_ROOM_LOCATION.floor,
      room: form.room.trim(),
      timezone: DEFAULT_ROOM_LOCATION.timezone,
    },
    slotDurationMin: 30,
    defaultCapacity: 1,
    tags: ["room", DEFAULT_ROOM_TYPE],
    metadata: {
      source: "admin-room-form",
    },
  };
}

export function validateCreateResourcePayload(payload: CreateResourcePayload): string | null {
  if (!payload.name.trim()) return "Room detail is required.";
  if (!payload.resourceCode.trim()) return "Room detail must include letters or numbers.";
  if (!payload.type.trim()) return "Type is required.";
  if (payload.status && !RESOURCE_STATUSES.includes(payload.status)) return "Status is invalid.";
  if (payload.slotDurationMin !== undefined && Number.isNaN(payload.slotDurationMin)) {
    return "Slot duration must be a number.";
  }
  if (payload.defaultCapacity !== undefined && Number.isNaN(payload.defaultCapacity)) {
    return "Default capacity must be a number.";
  }
  if (payload.slotDurationMin !== undefined && payload.slotDurationMin < 5) {
    return "Slot duration must be at least 5 minutes.";
  }
  if (payload.defaultCapacity !== undefined && payload.defaultCapacity < 1) {
    return "Default capacity must be at least 1.";
  }
  return null;
}

export async function getResourceAuthContext(
  authorizedRequest: AuthorizedRequest
): Promise<ResourceAuthContext> {
  return authorizedRequest<ResourceAuthContext>(`${RESOURCE_PREFIX}/auth/context`, {
    method: "GET",
  });
}

export async function ensureResourceAdminAccess(
  authorizedRequest: AuthorizedRequest
): Promise<ResourceAuthContext> {
  const context = await getResourceAuthContext(authorizedRequest);

  if (context.user?.role !== "admin") {
    throw new ServiceApiError(403, "Admin access is required to manage resources.", context);
  }

  return context;
}

export async function listResources(
  authorizedRequest: AuthorizedRequest,
  params?: {
    status?: ResourceStatus;
    type?: string;
  }
): Promise<ResourceSummary[]> {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.type) query.set("type", params.type);

  const suffix = query.toString() ? `?${query.toString()}` : "";
  const payload = await authorizedRequest<unknown>(`${RESOURCE_PREFIX}/resources${suffix}`, {
    method: "GET",
  });
  return normalizeResourceList(payload);
}

export async function createResource(
  authorizedRequest: AuthorizedRequest,
  payload: CreateResourcePayload
): Promise<ResourceSummary> {
  const response = await authorizedRequest<unknown>(`${RESOURCE_PREFIX}/resources`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const item = extractResourceItem(response);
  if (!item) {
    throw new ServiceApiError(502, "Create resource succeeded but response item was missing.", response);
  }

  return normalizeResource(item, 0);
}

export async function updateResourceStatus(
  authorizedRequest: AuthorizedRequest,
  resourceCode: string,
  status: ResourceStatus
): Promise<ResourceSummary> {
  const response = await authorizedRequest<unknown>(
    `${RESOURCE_PREFIX}/resources/${encodeURIComponent(resourceCode)}/status`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }
  );

  const item = extractResourceItem(response);
  if (!item) {
    throw new ServiceApiError(502, "Update resource status succeeded but response item was missing.", response);
  }

  return normalizeResource(item, 0);
}
