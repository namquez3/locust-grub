"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { formatFreshness } from "@/lib/aggregation";
import type {
  LineLengthLabel,
  PresenceLabel,
  TruckStatus,
} from "@/lib/types";
import {
  buildGoogleMapsUrl,
  isWithinPennCampus,
} from "@/lib/truck-utils";

type TruckBoardProps = {
  initialTrucks: TruckStatus[];
};

type ToastState = {
  type: "success" | "error";
  message: string;
} | null;

type CampusFilter = "all" | "campus" | "city";
type SortMode = "freshness" | "reports" | "name";

const CAMPUS_FILTERS = [
  { value: "all", label: "Everywhere", helper: "All tracked trucks" },
  { value: "campus", label: "Campus core", helper: "Within Locust Walk" },
  { value: "city", label: "Citywide", helper: "Beyond campus radius" },
] as const;

const SORT_OPTIONS = [
  { value: "freshness", label: "Freshest first" },
  { value: "reports", label: "Most reports" },
  { value: "name", label: "Alphabetical" },
] as const;

const PRESENCE_RANK = { present: 0, unknown: 1, absent: 2 } as const;

const CARD_ACCENT = {
  present: {
    border: "border-emerald-200/80",
    glow: "from-emerald-200/50 via-white/0 to-transparent",
    progress: "bg-emerald-500",
  },
  absent: {
    border: "border-rose-200/80",
    glow: "from-rose-200/40 via-white/0 to-transparent",
    progress: "bg-rose-400",
  },
  unknown: {
    border: "border-slate-200/80",
    glow: "from-slate-200/40 via-white/0 to-transparent",
    progress: "bg-slate-400",
  },
} as const;

export function TruckBoard({ initialTrucks }: TruckBoardProps) {
  const PICKER_SENTINEL = "__PICKER__";
  const [trucks, setTrucks] = useState<TruckStatus[]>(initialTrucks);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const [selectedTruckId, setSelectedTruckId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);
  const [pendingTruckId, setPendingTruckId] = useState<string | null>(null);
  const [campusFilter, setCampusFilter] = useState<CampusFilter>("all");
  const [sortMode, setSortMode] = useState<SortMode>("freshness");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedEmail = window.localStorage.getItem("locustgrubVerifiedEmail");
    if (savedEmail) {
      setVerifiedEmail(savedEmail);
    }
  }, []);

  useEffect(() => {
    if (!verifiedEmail || typeof window === "undefined") return;
    window.localStorage.setItem("locustgrubVerifiedEmail", verifiedEmail);
  }, [verifiedEmail]);

  useEffect(() => {
    if (verifiedEmail && pendingTruckId) {
      if (pendingTruckId === PICKER_SENTINEL) {
        setPickerOpen(true);
      } else {
        setSelectedTruckId(pendingTruckId);
      }
      setPendingTruckId(null);
    }
  }, [verifiedEmail, pendingTruckId, PICKER_SENTINEL]);

  const selectedTruck = useMemo(
    () => trucks.find((t) => t.id === selectedTruckId) ?? null,
    [selectedTruckId, trucks],
  );

  const visibleTrucks = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();

    let filtered = trucks.filter((truck) => {
      if (!normalized) return true;
      const haystack = [
        truck.name,
        truck.cuisine,
        truck.shortDescription,
        truck.locationHint,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalized);
    });

    if (campusFilter !== "all") {
      filtered = filtered.filter((truck) => {
        const onCampus = isWithinPennCampus(truck.lat, truck.lng);
        return campusFilter === "campus" ? onCampus : !onCampus;
      });
    }

    const sorted = [...filtered].sort((a, b) => {
      if (sortMode === "freshness") {
        const presenceDiff = PRESENCE_RANK[a.status] - PRESENCE_RANK[b.status];
        if (presenceDiff !== 0) return presenceDiff;
        const freshA =
          typeof a.freshnessMinutes === "number"
            ? a.freshnessMinutes
            : Number.POSITIVE_INFINITY;
        const freshB =
          typeof b.freshnessMinutes === "number"
            ? b.freshnessMinutes
            : Number.POSITIVE_INFINITY;
        return freshA - freshB;
      }

      if (sortMode === "reports") {
        return b.submissionsInWindow - a.submissionsInWindow;
      }

      return a.name.localeCompare(b.name);
    });

    return sorted;
  }, [campusFilter, sortMode, searchQuery, trucks]);

  const handleTruckSelection = useCallback(
    (truckId: string) => {
      if (!verifiedEmail) {
        setPendingTruckId(truckId);
        setEmailModalOpen(true);
        return;
      }
      setSelectedTruckId(truckId);
    },
    [verifiedEmail],
  );

  const handleAddReviewShortcut = useCallback(() => {
    if (!verifiedEmail) {
      setPendingTruckId(PICKER_SENTINEL);
      setEmailModalOpen(true);
      return;
    }
    setPickerOpen(true);
  }, [verifiedEmail]);

  const handleSignOutEmail = useCallback(() => {
    setVerifiedEmail(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("locustgrubVerifiedEmail");
    }
  }, []);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch("/api/trucks", { cache: "no-store" });
      if (!response.ok) throw new Error("Failed to refresh truck data");
      const data = await response.json();
      setTrucks(data.trucks);
    } catch (error) {
      console.error(error);
      setToast({ type: "error", message: "Unable to refresh trucks" });
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      void refresh();
    }, 30_000);
    return () => clearInterval(interval);
  }, [refresh]);

  const handleSubmissionComplete = useCallback(
    async (message?: string) => {
      await refresh();
      setToast({
        type: "success",
        message: message ?? "Thanks for keeping LocustGrub fresh!",
      });
      setSelectedTruckId(null);
      setTimeout(() => setToast(null), 4000);
    },
    [refresh],
  );

  return (
    <div className="space-y-6" id="truck-board">
      <section className="rounded-[32px] border border-slate-200/80 bg-white/95 p-5 text-slate-900 shadow-xl shadow-slate-900/5 backdrop-blur sm:p-6">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              Live truck snapshot
            </p>
            <h2 className="text-2xl font-semibold text-slate-900">
              ({visibleTrucks.length}/{trucks.length}) trucks match your filters
            </h2>
            <p className="text-sm text-slate-500">
              Search cuisines, truck names, or corners. Auto-refreshes every 30 seconds.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-slate-500">
            <span className="rounded-full border border-slate-200/80 px-3 py-1">
              Filter: {CAMPUS_FILTERS.find((filter) => filter.value === campusFilter)?.label}
            </span>
            <span className="rounded-full border border-slate-200/80 px-3 py-1">
              Sort: {SORT_OPTIONS.find((option) => option.value === sortMode)?.label}
            </span>
          </div>
        </div>
        <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_200px]">
            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.5 3.5a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm6 9 3 3"
                  />
                </svg>
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search trucks, cuisines, or cross streets"
                className="w-full rounded-2xl border border-slate-200 bg-white px-9 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
              />
            </div>
            <select
              value={sortMode}
              onChange={(event) =>
                setSortMode(event.target.value as SortMode)
              }
              className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 shadow-inner"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={() => refresh()}
              className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
            >
              {isRefreshing ? "Refreshing…" : "Refresh"}
            </button>
            <button
              type="button"
              onClick={handleAddReviewShortcut}
              className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-600/30 transition hover:bg-emerald-500"
            >
              <span className="text-lg" aria-hidden="true">
                ＋
              </span>
              Add review
            </button>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {CAMPUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setCampusFilter(filter.value)}
              className={`group rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                campusFilter === filter.value
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 text-slate-600 hover:border-slate-400 hover:text-slate-900"
              }`}
            >
              <span>{filter.label}</span>
              <span className="ml-2 hidden text-xs text-slate-400 sm:inline">
                {filter.helper}
              </span>
            </button>
          ))}
        </div>
      </section>

      {toast && (
        <div
          className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm shadow ${
            toast.type === "success"
              ? "border-emerald-200/80 bg-emerald-50"
              : "border-rose-200/80 bg-rose-50"
          }`}
        >
          <span aria-hidden="true" className="text-lg">
            {toast.type === "success" ? "✅" : "⚠️"}
          </span>
          <p className="font-medium text-slate-800">{toast.message}</p>
        </div>
      )}

      <div className="relative overflow-hidden rounded-3xl border border-slate-200/70 bg-gradient-to-br from-white via-white to-slate-50 p-5 text-slate-900 shadow-lg">
        <div className="absolute inset-y-0 right-0 w-1/3 bg-emerald-100/40 blur-3xl" aria-hidden="true" />
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Penn email verification
            </p>
            <p className="text-base font-semibold text-slate-900">
              {verifiedEmail ? `Verified as ${verifiedEmail}` : "You're almost there"}
            </p>
            <p className="text-sm text-slate-500">
              {verifiedEmail
                ? "Reset if you need to switch accounts."
                : "Verify once to unlock check-ins and raffles."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {verifiedEmail && (
              <button
                type="button"
                onClick={handleSignOutEmail}
                className="rounded-full border border-slate-200 px-4 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-900"
              >
                Reset
              </button>
            )}
            <button
              type="button"
              onClick={() => setEmailModalOpen(true)}
              className="rounded-full border border-slate-900 px-4 py-1.5 text-xs font-semibold text-slate-900 transition hover:bg-slate-900 hover:text-white"
            >
              {verifiedEmail ? "Re-verify" : "Verify email"}
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {visibleTrucks.map((truck) => {
          const accent = CARD_ACCENT[truck.status];
          const confidencePercent = Math.round(truck.statusConfidence * 100);
          const lineLabel = formatLineLabel(truck.lineLength);
          const lineHelper =
            truck.lineConfidence > 0
              ? `${Math.round(truck.lineConfidence * 100)}% agree`
              : "Awaiting votes";
          const freshnessLabel = formatFreshness(truck.freshnessMinutes);
          const lastVerifiedLabel = truck.lastVerifiedAt
            ? new Date(truck.lastVerifiedAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "Not yet";
          const onCampus = isWithinPennCampus(truck.lat, truck.lng);

          return (
            <article
              key={truck.id}
              className={`relative overflow-hidden rounded-3xl border bg-white/95 p-5 shadow-xl shadow-slate-900/5 transition hover:-translate-y-0.5 hover:shadow-2xl ${accent.border}`}
            >
              <div
                className={`pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b ${accent.glow}`}
                aria-hidden="true"
              />
              <div className="relative flex flex-col gap-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      {truck.cuisine}
                    </p>
                    <h3 className="text-xl font-semibold text-slate-900">{truck.name}</h3>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
                      {truck.rating && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 font-semibold text-amber-700">
                          ★ {truck.rating.toFixed(1)}
                          {truck.reviewCount && (
                            <span className="text-xs text-amber-600/70">
                              ({truck.reviewCount})
                            </span>
                          )}
                        </span>
                      )}
                      {truck.priceRange && (
                        <span className="rounded-full border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600">
                          {truck.priceRange}
                        </span>
                      )}
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                        onCampus
                          ? "border-emerald-200 text-emerald-700"
                          : "border-sky-200 text-sky-700"
                      }`}>
                        {onCampus ? "Campus core" : "Citywide"}
                      </span>
                    </div>
                  </div>
                  <StatusBadge status={truck.status} />
                </div>

                <p className="text-sm text-slate-600">{truck.shortDescription}</p>
                {truck.quote && (
                  <p className="text-sm italic text-slate-500">“{truck.quote}”</p>
                )}

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3">
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Line estimate
                    </p>
                    <p className="text-lg font-semibold text-slate-900">{lineLabel}</p>
                    <p className="text-xs text-slate-500">{lineHelper}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3">
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Freshness
                    </p>
                    <p className="text-lg font-semibold text-slate-900">{freshnessLabel}</p>
                    <p className="text-xs text-slate-500">
                      {truck.freshnessMinutes != null
                        ? `${truck.freshnessMinutes} min ago`
                        : "Awaiting first check-in"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3">
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Last verified
                    </p>
                    <p className="text-lg font-semibold text-slate-900">{lastVerifiedLabel}</p>
                    <p className="text-xs text-slate-500">Local time</p>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3">
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Reports (30m)
                    </p>
                    <p className="text-lg font-semibold text-slate-900">
                      {truck.submissionsInWindow}
                    </p>
                    <p className="text-xs text-slate-500">Check-ins powering this view</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-white/90 p-3">
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <span>Signal confidence</span>
                    <span className="text-slate-700">{confidencePercent}%</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-slate-100">
                    <span
                      className={`block h-full rounded-full ${accent.progress}`}
                      style={{ width: `${Math.max(confidencePercent, 6)}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {truck.submissionsInWindow} votes in the last 30 minutes
                  </p>
                </div>

                <div className="flex flex-wrap items-start justify-between gap-3 border-t border-slate-100 pt-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Location
                    </p>
                    <p className="text-sm font-semibold text-slate-900">
                      {truck.locationHint}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={buildGoogleMapsUrl(truck)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-full border border-slate-300/80 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
                    >
                      <span aria-hidden="true">↗</span>
                      Google Maps
                    </a>
                    <button
                      type="button"
                      onClick={() => handleTruckSelection(truck.id)}
                      className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-1.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-800"
                    >
                      Check in
                    </button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {visibleTrucks.length === 0 && (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
          No trucks match “{searchQuery}”. Try a different keyword or clear the
          search field.
        </p>
      )}

      {selectedTruck && (
        <CheckinDialog
          truck={selectedTruck}
          verifiedEmail={verifiedEmail}
          onRequireVerification={() => setEmailModalOpen(true)}
          onCancel={() => setSelectedTruckId(null)}
          onSubmitted={handleSubmissionComplete}
          onError={(message) => setToast({ type: "error", message })}
        />
      )}

      {pickerOpen && (
        <div className="fixed inset-0 z-40 flex items-end bg-slate-900/40 p-4 md:items-center">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Choose a truck
                </p>
                <h3 className="text-2xl font-semibold text-slate-900">
                  Where are you eating?
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPickerOpen(false)}
                className="text-sm text-slate-500 transition hover:text-slate-900"
              >
                Close
              </button>
            </div>
            <div className="mt-4 max-h-[60vh] space-y-2 overflow-y-auto pr-1">
              {trucks.map((truck) => (
                <button
                  type="button"
                  key={truck.id}
                  onClick={() => {
                    setPickerOpen(false);
                    handleTruckSelection(truck.id);
                  }}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-left text-sm text-slate-800 transition hover:border-slate-900"
                >
                  <p className="font-semibold text-slate-900">{truck.name}</p>
                  <p className="text-xs text-slate-500">{truck.cuisine}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      {emailModalOpen && (
        <EmailVerificationDialog
          onClose={() => setEmailModalOpen(false)}
          onVerified={(email) => {
            setVerifiedEmail(email);
            setEmailModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: TruckStatus["status"] }) {
  if (status === "unknown") {
    return (
      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
        Unknown
      </span>
    );
  }

  if (status === "present") {
    return (
      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
        Verified here
      </span>
    );
  }

  return (
    <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
      Likely away
    </span>
  );
}

function formatLineLabel(label: TruckStatus["lineLength"]) {
  if (label === "unknown") return "Unknown";
  switch (label) {
    case "none":
      return "No line";
    case "short":
      return "Short (1–5)";
    case "medium":
      return "Medium (6–12)";
    case "long":
      return "Long (12+)";
    default:
      return label;
  }
}

type CheckinDialogProps = {
  truck: TruckStatus;
  verifiedEmail: string | null;
  onRequireVerification: () => void;
  onSubmitted: (message?: string) => void;
  onCancel: () => void;
  onError: (message: string) => void;
};

function CheckinDialog({
  truck,
  verifiedEmail,
  onRequireVerification,
  onSubmitted,
  onCancel,
  onError,
}: CheckinDialogProps) {
  const [presence, setPresence] = useState<PresenceLabel>("present");
  const [lineLength, setLineLength] = useState<LineLengthLabel>("short");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState<number>(5);
  const [submitting, setSubmitting] = useState(false);
  const [workerId, setWorkerId] = useState<string | null>(null);
  const [locationStatus, setLocationStatus] = useState<
    "idle" | "checking" | "inside" | "outside" | "error"
  >("idle");
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationOverride, setLocationOverride] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [raffleOptIn, setRaffleOptIn] = useState(true);

  useEffect(() => {
    if (verifiedEmail) {
      const normalized = verifiedEmail.toLowerCase();
      setWorkerId(normalized);
      if (typeof window !== "undefined") {
        window.localStorage.setItem("locustgrubWorkerId", normalized);
      }
      return;
    }

    if (typeof window === "undefined") return;
    const existing = window.localStorage.getItem("locustgrubWorkerId");
    if (existing) {
      setWorkerId(existing);
      return;
    }

    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2, 10);
    window.localStorage.setItem("locustgrubWorkerId", id);
    setWorkerId(id);
  }, [verifiedEmail]);

  const requestLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocationStatus("error");
      setLocationError("Geolocation not supported in this browser.");
      return;
    }
    setLocationStatus("checking");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lng: longitude });
        if (isWithinPennCampus(latitude, longitude)) {
          setLocationStatus("inside");
          setLocationError(null);
          setLocationOverride(false);
        } else {
          setLocationStatus("outside");
          setLocationError("Looks like you're outside Penn's campus.");
        }
      },
      (error) => {
        setLocationStatus("error");
        setLocationError(error.message);
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  };

  const locationGatePassed =
    locationStatus === "inside" ||
    (locationOverride && comment.trim().length >= 10);

  const canSubmit =
    Boolean(verifiedEmail) && locationGatePassed && Boolean(workerId);

  const submit = async () => {
    if (!verifiedEmail) {
      onRequireVerification();
      return;
    }

    if (!locationGatePassed) {
      onError(
        "Please verify your location or leave a detailed remote note (10+ characters).",
      );
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          truckId: truck.id,
          presence,
          lineLength,
          comment,
          workerId,
          rating,
          enteredRaffle: raffleOptIn,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(
          data.error || "Unable to submit check-in right now.",
        );
      }

      onSubmitted();
      setComment("");
      setRating(5);
      setRaffleOptIn(true);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.";
      onError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-slate-900/30 p-4 md:items-center">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">Check in</p>
            <h3 className="text-xl font-semibold text-slate-900">
              {truck.name}
            </h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-sm text-slate-500 transition hover:text-slate-900"
          >
            Close
          </button>
        </div>

        <form
          className="mt-4 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
        >
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">
            <p>
              {verifiedEmail
                ? `Verified as ${verifiedEmail}`
                : "You must verify a Penn email before submitting."}
            </p>
            {!verifiedEmail && (
              <button
                type="button"
                onClick={onRequireVerification}
                className="mt-2 rounded-full border border-slate-900 px-4 py-1 text-xs font-semibold text-slate-900 transition hover:bg-slate-900 hover:text-white"
              >
                Verify now
              </button>
            )}
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-slate-700">
              Is the truck here?
            </legend>
            <div className="flex gap-3">
              {(["present", "absent"] as PresenceLabel[]).map((option) => (
                <label
                  key={option}
                  className={`flex-1 cursor-pointer rounded-lg border px-3 py-2 text-center text-sm font-medium capitalize ${
                    presence === option
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 text-slate-700"
                  }`}
                >
                  <input
                    type="radio"
                    className="hidden"
                    name="presence"
                    value={option}
                    checked={presence === option}
                    onChange={() => setPresence(option)}
                  />
                  {option}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-slate-700">
              Line length
            </legend>
            <div className="grid grid-cols-2 gap-2">
              {(["none", "short", "medium", "long"] as LineLengthLabel[]).map(
                (option) => (
                  <label
                    key={option}
                    className={`cursor-pointer rounded-lg border px-3 py-2 text-center text-sm font-medium capitalize ${
                      lineLength === option
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 text-slate-700"
                    }`}
                  >
                    <input
                      type="radio"
                      className="hidden"
                      name="lineLength"
                      value={option}
                      checked={lineLength === option}
                      onChange={() => setLineLength(option)}
                    />
                    {option}
                  </label>
                ),
              )}
            </div>
          </fieldset>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-slate-700">
              Review score
            </legend>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <label
                  key={value}
                  className={`flex-1 cursor-pointer rounded-lg border px-3 py-2 text-center text-sm font-medium ${
                    rating === value
                      ? "border-amber-500 bg-amber-50 text-amber-700"
                      : "border-slate-200 text-slate-700"
                  }`}
                >
                  <input
                    type="radio"
                    className="hidden"
                    name="rating"
                    value={value}
                    checked={rating === value}
                    onChange={() => setRating(value)}
                  />
                  {value}★
                </label>
              ))}
            </div>
          </fieldset>

          <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium text-slate-700">Location check</p>
              <button
                type="button"
                onClick={requestLocation}
                className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
              >
                {locationStatus === "checking"
                  ? "Verifying…"
                  : "Verify I&apos;m on campus"}
              </button>
            </div>
            <p className="text-xs text-slate-500">
              {locationStatus === "inside" &&
                "Great! Location verified on campus."}
              {locationStatus === "outside" &&
                "Need help? You appear off campus—leave a detailed note or try again."}
              {locationStatus === "error" && locationError}
              {locationStatus === "idle" &&
                "We only accept reviews from people physically on or near Locust Walk."}
              {locationStatus === "checking" && "Checking location…"}
            </p>
            {coords && (
              <p className="text-[11px] text-slate-400">
                Last ping: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
              </p>
            )}
            <label className="flex items-center gap-2 text-xs text-slate-600">
              <input
                type="checkbox"
                checked={locationOverride}
                disabled={locationStatus === "inside"}
                onChange={(event) => setLocationOverride(event.target.checked)}
              />
              I&apos;m remote but relaying a trusted update (requires a 10+
              character note).
            </label>
          </div>

          <label className="block space-y-2 text-sm font-medium text-slate-700">
            Optional comment
            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              maxLength={240}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-900"
              placeholder="Any quick tips or context?"
            />
          </label>
          {locationOverride && comment.trim().length < 10 && (
            <p className="text-xs text-rose-500">
              Remote updates need at least 10 characters so we can verify them.
            </p>
          )}

          <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={raffleOptIn}
              onChange={(event) => setRaffleOptIn(event.target.checked)}
            />
            Enter me in this week&apos;s free meal raffle.
          </label>

          <div className="flex items-center justify-between text-xs text-slate-500">
            <p>
              {workerId
                ? `Your volunteer ID: ${workerId.slice(0, 8)}`
                : "Generating worker ID…"}
            </p>
            <p>Max 3 updates per 10 min.</p>
          </div>

          <button
            type="submit"
            disabled={!canSubmit || submitting}
            className="w-full rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
          >
            {submitting ? "Sending…" : "Submit check-in"}
          </button>
          {!locationGatePassed && (
            <p className="text-center text-xs text-rose-500">
              Verify location or provide a detailed remote note (10+ characters)
              to continue.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

type EmailVerificationDialogProps = {
  onClose: () => void;
  onVerified: (email: string) => void;
};

const PENN_EMAIL_REGEX = /^[^@]+@([^.]+\.)?upenn\.edu$/;

function EmailVerificationDialog({
  onClose,
  onVerified,
}: EmailVerificationDialogProps) {
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    const normalized = email.trim().toLowerCase();
    if (!PENN_EMAIL_REGEX.test(normalized)) {
      setError("Please use a valid Penn email (upenn.edu).");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/request-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalized }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Could not send code.");
        return;
      }

      setToken(data.token);
      setStep("code");
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!token) {
      setError("Missing verification token. Please resend the code.");
      return;
    }

    const normalized = email.trim().toLowerCase();
    const codeStr = code.trim();

    if (!codeStr) {
      setError("Please enter the code from your email.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: normalized,
          code: codeStr,
          token,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Could not verify code.");
        return;
      }

      onVerified(normalized);
      onClose();
    } catch (err) {
      console.error(err);
      setError("Something went wrong verifying your code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-slate-900/30 p-4 md:items-center">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Penn verification
            </p>
            <h3 className="text-xl font-semibold text-slate-900">
              {step === "email" ? "Enter your Penn email" : "Enter your code"}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {step === "email"
                ? "We will email you a 6 digit verification code at your Penn address."
                : "Check your inbox for the LocustGrub code and enter it below."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-slate-500 transition hover:text-slate-900"
          >
            Close
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {step === "email" ? (
            <label className="block text-sm font-medium text-slate-700">
              Penn email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                placeholder="netid@upenn.edu"
              />
            </label>
          ) : (
            <label className="block text-sm font-medium text-slate-700">
              6 digit code
              <input
                type="text"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                placeholder="123456"
              />
            </label>
          )}

          {error && (
            <p className="text-sm text-red-600">
              {error}
            </p>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          {step === "code" && (
            <button
              type="button"
              onClick={() => {
                setStep("email");
                setCode("");
                setToken(null);
                setError(null);
              }}
              className="rounded-full border border-slate-200 px-4 py-1.5 text-sm font-medium text-slate-600 hover:border-slate-300 hover:text-slate-900"
            >
              Back
            </button>
          )}
          <button
            type="button"
            onClick={step === "email" ? handleSendCode : handleVerifyCode}
            disabled={loading}
            className="rounded-full bg-sky-600 px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading
              ? step === "email"
                ? "Sending..."
                : "Verifying..."
              : step === "email"
                ? "Send code"
                : "Verify"}
          </button>
        </div>
      </div>
    </div>
  );
}

