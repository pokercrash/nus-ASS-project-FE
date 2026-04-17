import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  DatabaseZap,
  Play,
  RadioTower,
  RefreshCcw,
  RotateCcw,
  Zap,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { env } from "@/lib/env";
import { cn } from "@/lib/utils";

const LABELS_KEY = "authServiceLoadBalancerDemo.labels";
const HISTORY_LIMIT = 20;
const BURST_SIZE = 20;
const AUTO_CALL_INTERVAL_MS = 700;
const API_PATH = "/api/v1/debug/instance";
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

type LabelsByIdentity = Record<string, string>;

type InstanceResponse = {
  service?: string;
  instance_id?: string;
  display_id?: string;
  hostname?: string;
  task_id?: string;
  task_family?: string;
  task_revision?: string;
  availability_zone?: string;
  launch_type?: string;
  source?: string;
  time_utc?: string;
};

type CallHistoryItem = {
  callNumber: number;
  identity: string;
  label: string;
  displayId: string;
  hostname?: string;
  source?: string;
  availabilityZone?: string;
  launchType?: string;
  timeUTC?: string;
  receivedAt: string;
};

function loadLabels(): LabelsByIdentity {
  try {
    const rawLabels = window.localStorage.getItem(LABELS_KEY);
    const parsed = rawLabels ? JSON.parse(rawLabels) : {};

    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as LabelsByIdentity)
      : {};
  } catch {
    return {};
  }
}

function saveLabels(labels: LabelsByIdentity) {
  window.localStorage.setItem(LABELS_KEY, JSON.stringify(labels));
}

function getIdentity(payload: InstanceResponse) {
  return payload.instance_id || payload.hostname || "unknown";
}

function getDisplayId(payload: InstanceResponse, identity: string) {
  return payload.display_id || payload.task_id || payload.hostname || identity;
}

function formatApiTime(value?: string) {
  if (!value) return "No backend timestamp";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-SG", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  }).format(date);
}

function formatLocalTime(value: string) {
  const date = new Date(value);

  return new Intl.DateTimeFormat("en-SG", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

async function fetchCurrentInstance(callNumber: number): Promise<InstanceResponse> {
  const url = `${env.authBaseUrl}${API_PATH}?t=${Date.now()}-${callNumber}`;
  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json") ? await response.json() : await response.text();

  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && "error" in payload
        ? String((payload as { error?: unknown }).error ?? "Request failed")
        : response.statusText || "Request failed";

    throw new Error(`HTTP ${response.status}: ${message}`);
  }

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("Backend returned an unexpected response.");
  }

  return payload as InstanceResponse;
}

export function LoadBalancerDemoPage() {
  const [labels, setLabels] = useState<LabelsByIdentity>(() => loadLabels());
  const [history, setHistory] = useState<CallHistoryItem[]>([]);
  const [current, setCurrent] = useState<CallHistoryItem | null>(null);
  const [callCount, setCallCount] = useState(0);
  const [pendingCalls, setPendingCalls] = useState(0);
  const [autoCalling, setAutoCalling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const labelsRef = useRef(labels);
  const callNumberRef = useRef(0);

  const taskCount = Object.keys(labels).length;
  const isBusy = pendingCalls > 0;

  const apiUrl = useMemo(() => `${env.authBaseUrl}${API_PATH}`, []);

  const targetSummaries = useMemo(() => {
    const latestByIdentity = new Map<string, CallHistoryItem>();

    history.forEach((item) => {
      if (!latestByIdentity.has(item.identity)) {
        latestByIdentity.set(item.identity, item);
      }
    });

    return Object.entries(labels)
      .map(([identity, label]) => ({
        identity,
        label,
        details: latestByIdentity.get(identity),
      }))
      .sort((first, second) => first.label.localeCompare(second.label, undefined, { numeric: true }));
  }, [history, labels]);

  const labelForIdentity = useCallback((identity: string) => {
    const existingLabel = labelsRef.current[identity];
    if (existingLabel) return existingLabel;

    const index = Object.keys(labelsRef.current).length;
    const nextLabel = ALPHABET[index] ?? `#${index + 1}`;
    const nextLabels = {
      ...labelsRef.current,
      [identity]: nextLabel,
    };

    labelsRef.current = nextLabels;
    saveLabels(nextLabels);
    setLabels(nextLabels);

    return nextLabel;
  }, []);

  const callInstance = useCallback(async () => {
    const callNumber = callNumberRef.current + 1;
    callNumberRef.current = callNumber;

    setCallCount(callNumber);
    setPendingCalls((count) => count + 1);

    try {
      const payload = await fetchCurrentInstance(callNumber);
      const identity = getIdentity(payload);
      const label = labelForIdentity(identity);
      const item: CallHistoryItem = {
        callNumber,
        identity,
        label,
        displayId: getDisplayId(payload, identity),
        hostname: payload.hostname,
        source: payload.source,
        availabilityZone: payload.availability_zone,
        launchType: payload.launch_type,
        timeUTC: payload.time_utc,
        receivedAt: new Date().toISOString(),
      };

      setCurrent(item);
      setHistory((items) => [item, ...items].slice(0, HISTORY_LIMIT));
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Request failed.");
    } finally {
      setPendingCalls((count) => Math.max(0, count - 1));
    }
  }, [labelForIdentity]);

  const burstCalls = useCallback(async () => {
    setError(null);
    await Promise.allSettled(Array.from({ length: BURST_SIZE }, () => callInstance()));
  }, [callInstance]);

  const resetDemo = useCallback(() => {
    const emptyLabels: LabelsByIdentity = {};

    window.localStorage.removeItem(LABELS_KEY);
    labelsRef.current = emptyLabels;
    callNumberRef.current = 0;
    setLabels(emptyLabels);
    setHistory([]);
    setCurrent(null);
    setCallCount(0);
    setError(null);
    setAutoCalling(false);
  }, []);

  useEffect(() => {
    labelsRef.current = labels;
  }, [labels]);

  useEffect(() => {
    if (!autoCalling) return undefined;

    const timer = window.setInterval(() => {
      void callInstance();
    }, AUTO_CALL_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [autoCalling, callInstance]);

  return (
    <div className="min-h-screen bg-[linear-gradient(145deg,#f8fbff_0%,#ffffff_42%,#f0fdf7_100%)] text-foreground">
      <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 rounded-lg border border-emerald-100 bg-white/92 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-3">
            <Button asChild variant="ghost" size="sm" className="w-fit px-2 text-muted-foreground">
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Bookly Care
              </Link>
            </Button>
            <div className="space-y-2">
              <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">Auth service load balancer</Badge>
              <h1 className="text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
                Watch ECS targets receive traffic.
              </h1>
              <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
                Start with one healthy task, call the public load balancer, then scale the service and wait for the next
                backend target to appear.
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-cyan-100 bg-cyan-50/75 p-3 text-xs text-cyan-900">
            <p className="font-semibold">Endpoint</p>
            <p className="mt-1 break-all font-mono">{apiUrl}</p>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-lg border border-border bg-white/94 p-4 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current target</p>
                <div className="mt-4 flex items-center gap-4">
                  <div
                    className={cn(
                      "grid h-28 w-28 place-items-center rounded-lg border text-6xl font-semibold shadow-sm sm:h-36 sm:w-36 sm:text-7xl",
                      current
                        ? "border-emerald-200 bg-emerald-600 text-white"
                        : "border-border bg-muted text-muted-foreground"
                    )}
                  >
                    {current?.label ?? "-"}
                  </div>
                  <div className="min-w-0 space-y-2">
                    <p className="break-all text-lg font-semibold text-foreground">
                      {current?.displayId ?? "Waiting for the first response"}
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span className="rounded-md bg-emerald-50 px-2 py-1 text-emerald-700">
                        {current?.source ?? "No source yet"}
                      </span>
                      <span className="rounded-md bg-amber-50 px-2 py-1 text-amber-700">
                        {current?.availabilityZone ?? "AZ pending"}
                      </span>
                      <span className="rounded-md bg-cyan-50 px-2 py-1 text-cyan-700">
                        {current?.launchType ?? "Launch type pending"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{formatApiTime(current?.timeUTC)}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:w-72">
                <div className="rounded-lg border border-border bg-background p-3">
                  <p className="text-xs text-muted-foreground">Tasks</p>
                  <p className="mt-1 text-2xl font-semibold">{taskCount}</p>
                </div>
                <div className="rounded-lg border border-border bg-background p-3">
                  <p className="text-xs text-muted-foreground">Calls</p>
                  <p className="mt-1 text-2xl font-semibold">{callCount}</p>
                </div>
                <div className="rounded-lg border border-border bg-background p-3">
                  <p className="text-xs text-muted-foreground">Pending</p>
                  <p className="mt-1 text-2xl font-semibold">{pendingCalls}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={() => void callInstance()} disabled={isBusy && pendingCalls >= BURST_SIZE}>
                <Play className="mr-2 h-4 w-4" />
                Call once
              </Button>
              <Button
                variant={autoCalling ? "secondary" : "outline"}
                onClick={() => setAutoCalling((enabled) => !enabled)}
              >
                {autoCalling ? <RefreshCcw className="mr-2 h-4 w-4 animate-spin" /> : <Activity className="mr-2 h-4 w-4" />}
                {autoCalling ? "Stop auto calls" : "Start auto calls"}
              </Button>
              <Button variant="outline" onClick={() => void burstCalls()}>
                <Zap className="mr-2 h-4 w-4" />
                Burst 20
              </Button>
              <Button variant="ghost" onClick={resetDemo}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </div>

            {error ? (
              <div className="mt-5 flex gap-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <p className="font-semibold">Request failed</p>
                  <p className="mt-1 break-words">{error}</p>
                </div>
              </div>
            ) : null}
          </div>

          <div className="rounded-lg border border-border bg-white/94 p-4 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Seen tasks</p>
                <h2 className="mt-1 text-xl font-semibold text-foreground">Stable browser labels</h2>
              </div>
              <RadioTower className="h-5 w-5 text-emerald-600" />
            </div>

            <div className="space-y-3">
              {targetSummaries.length > 0 ? (
                targetSummaries.map((target) => (
                  <div key={target.identity} className="rounded-lg border border-border bg-background/75 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">Target {target.label}</p>
                        <p className="mt-1 break-all font-mono text-xs text-muted-foreground">
                          {target.details?.displayId ?? target.identity}
                        </p>
                      </div>
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-emerald-100 text-lg font-semibold text-emerald-700">
                        {target.label}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span className="rounded-md bg-white px-2 py-1">{target.details?.source ?? "source pending"}</span>
                      <span className="rounded-md bg-white px-2 py-1">
                        {target.details?.availabilityZone ?? "AZ pending"}
                      </span>
                      <span className="rounded-md bg-white px-2 py-1">
                        {target.details?.launchType ?? "launch type pending"}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-border bg-background/60 p-6 text-sm text-muted-foreground">
                  Click <span className="font-semibold text-foreground">Call once</span> while one ECS task is healthy.
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-border bg-white/94 p-4 shadow-sm sm:p-6">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Recent calls</p>
              <h2 className="mt-1 text-xl font-semibold text-foreground">Last {HISTORY_LIMIT} responses</h2>
            </div>
            <DatabaseZap className="hidden h-5 w-5 text-cyan-600 sm:block" />
          </div>

          <div className="overflow-hidden rounded-lg border border-border">
            <div className="grid grid-cols-[4.5rem_5rem_minmax(0,1fr)] gap-3 bg-muted px-3 py-2 text-xs font-semibold text-muted-foreground sm:grid-cols-[5rem_5rem_minmax(0,1fr)_9rem_9rem]">
              <span>Call</span>
              <span>Target</span>
              <span>Display id</span>
              <span className="hidden sm:block">Source</span>
              <span className="hidden sm:block">Received</span>
            </div>

            {history.length > 0 ? (
              history.map((item) => (
                <div
                  key={item.callNumber}
                  className="grid grid-cols-[4.5rem_5rem_minmax(0,1fr)] gap-3 border-t border-border px-3 py-3 text-sm sm:grid-cols-[5rem_5rem_minmax(0,1fr)_9rem_9rem]"
                >
                  <span className="text-muted-foreground">#{item.callNumber}</span>
                  <span className="font-semibold text-emerald-700">{item.label}</span>
                  <span className="min-w-0 break-all font-mono text-xs text-foreground">{item.displayId}</span>
                  <span className="hidden truncate text-muted-foreground sm:block">{item.source ?? "unknown"}</span>
                  <span className="hidden text-muted-foreground sm:block">{formatLocalTime(item.receivedAt)}</span>
                </div>
              ))
            ) : (
              <div className="border-t border-border px-3 py-8 text-center text-sm text-muted-foreground">
                No calls yet.
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
