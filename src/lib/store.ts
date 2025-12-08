import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

import {
  isDatabaseAvailable,
  getCheckinsFromDb,
  getRecentCheckinsFromDb,
  addCheckinRecordToDb,
  checkWorkerRateLimit,
} from "@/lib/db";
import type {
  CheckinInput,
  CheckinRecord,
  PresenceLabel,
  LineLengthLabel,
} from "@/lib/types";

const DATA_FILE = path.join(process.cwd(), "data", "checkins.json");
const MAX_WORKER_SUBMISSIONS_PER_WINDOW = 3;
const WORKER_WINDOW_MINUTES = 10;
const BAD_WORDS = [
  "fuck",
  "shit",
  "bitch",
  "asshole",
  "bastard",
  "cunt",
  "dick",
  "piss",
];

async function ensureDataFile() {
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, "[]", "utf-8");
  }
}

async function readAll(): Promise<CheckinRecord[]> {
  await ensureDataFile();
  const raw = await fs.readFile(DATA_FILE, "utf-8");
  if (!raw.trim()) {
    return [];
  }

  try {
    return JSON.parse(raw) as CheckinRecord[];
  } catch {
    // If the file somehow gets corrupted, reset it.
    await fs.writeFile(DATA_FILE, "[]", "utf-8");
    return [];
  }
}

async function writeAll(checkins: CheckinRecord[]) {
  await fs.writeFile(DATA_FILE, JSON.stringify(checkins, null, 2), "utf-8");
}

function isValidPresence(value: string): value is PresenceLabel {
  return value === "present" || value === "absent";
}

function isValidLineLength(value: string): value is LineLengthLabel {
  return value === "none" || value === "short" || value === "medium" || value === "long";
}

function normalizeRating(value: unknown): number | undefined {
  if (typeof value === "undefined" || value === null) return undefined;
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return undefined;
  if (parsed < 1 || parsed > 5) return undefined;
  return Math.round(parsed);
}

function containsBadLanguage(text: string) {
  const normalized = text.toLowerCase();
  return BAD_WORDS.some((word) => normalized.includes(word));
}

export async function getCheckins(options?: {
  truckId?: string;
  minutes?: number;
}): Promise<CheckinRecord[]> {
  // Use database if available, otherwise fall back to file storage
  if (isDatabaseAvailable()) {
    return getCheckinsFromDb(options);
  }

  const all = await readAll();
  const { truckId, minutes } = options ?? {};

  return all.filter((item) => {
    if (truckId && item.truckId !== truckId) {
      return false;
    }

    if (minutes && minutes > 0) {
      const cutoff = Date.now() - minutes * 60 * 1000;
      if (new Date(item.createdAt).getTime() < cutoff) {
        return false;
      }
    }

    return true;
  });
}

export async function getRecentCheckins(limit = 50): Promise<CheckinRecord[]> {
  // Use database if available, otherwise fall back to file storage
  if (isDatabaseAvailable()) {
    return getRecentCheckinsFromDb(limit);
  }

  const all = await readAll();
  return all
    .slice()
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, limit);
}

export async function addCheckinRecord(
  payload: CheckinInput,
): Promise<CheckinRecord> {
  const {
    truckId,
    presence,
    lineLength,
    comment,
    workerId,
    rating,
    enteredRaffle,
  } = payload;

  if (!truckId) {
    throw new Error("truckId is required");
  }

  if (!isValidPresence(presence)) {
    throw new Error("presence must be present|absent");
  }

  if (!isValidLineLength(lineLength)) {
    throw new Error("lineLength must be none|short|medium|long");
  }

  const normalizedWorkerId =
    workerId?.trim() || `anon-${randomUUID().slice(0, 8)}`;

  const record: CheckinRecord = {
    id: randomUUID(),
    truckId,
    presence,
    lineLength,
    comment: comment?.trim()?.slice(0, 240) || undefined,
    rating: normalizeRating(rating),
    enteredRaffle: Boolean(enteredRaffle),
    workerId: normalizedWorkerId,
    createdAt: new Date().toISOString(),
  };

  if (record.comment && containsBadLanguage(record.comment)) {
    throw new Error("Please keep reviews respectful.");
  }

  if (isDatabaseAvailable()) {
    const canSubmit = await checkWorkerRateLimit(
      normalizedWorkerId,
      WORKER_WINDOW_MINUTES,
      MAX_WORKER_SUBMISSIONS_PER_WINDOW,
    );

    if (!canSubmit) {
      throw new Error("Rate limit exceeded for this worker.");
    }

    await addCheckinRecordToDb(record);
    return record;
  }

  const checkins = await readAll();
  const windowStart = Date.now() - WORKER_WINDOW_MINUTES * 60 * 1000;
  const recentForWorker = checkins.filter(
    (entry) =>
      entry.workerId === normalizedWorkerId &&
      new Date(entry.createdAt).getTime() >= windowStart,
  );

  if (recentForWorker.length >= MAX_WORKER_SUBMISSIONS_PER_WINDOW) {
    throw new Error("Rate limit exceeded for this worker.");
  }

  checkins.push(record);
  await writeAll(checkins);

  return record;
}
