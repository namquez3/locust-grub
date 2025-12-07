import { randomUUID } from "node:crypto";
import { neon } from "@neondatabase/serverless";

import type {
  CheckinInput,
  CheckinRecord,
  PresenceLabel,
  LineLengthLabel,
} from "@/lib/types";

function createSqlClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured");
  }
  return neon(connectionString);
}

const sql = createSqlClient();
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

type CheckinRow = {
  id: string;
  truck_id: string;
  presence: PresenceLabel;
  line_length: LineLengthLabel;
  comment: string | null;
  rating: number | null;
  entered_raffle: boolean;
  worker_id: string;
  created_at: string;
};

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

function mapRowToCheckin(row: CheckinRow): CheckinRecord {
  return {
    id: row.id,
    truckId: row.truck_id,
    presence: row.presence,
    lineLength: row.line_length,
    comment: row.comment ?? undefined,
    rating: row.rating ?? undefined,
    enteredRaffle: row.entered_raffle,
    workerId: row.worker_id,
    createdAt: row.created_at,
  };
}

export async function getCheckins(options?: {
  truckId?: string;
  minutes?: number;
}): Promise<CheckinRecord[]> {
  const { truckId, minutes } = options ?? {};
  const whereParts: string[] = [];
  const values: Array<string | Date> = [];

  if (truckId) {
    values.push(truckId);
    whereParts.push(`truck_id = $${values.length}`);
  }
  if (minutes && minutes > 0) {
    values.push(new Date(Date.now() - minutes * 60 * 1000));
    whereParts.push(`created_at >= $${values.length}`);
  }

  const whereClause = whereParts.length
    ? `WHERE ${whereParts.join(" AND ")}`
    : "";

  const rows = (await sql.unsafe(
    `SELECT id,
            truck_id,
            presence,
            line_length,
            comment,
            rating,
            entered_raffle,
            worker_id,
            created_at
     FROM checkins
     ${whereClause}
     ORDER BY created_at DESC`,
    values,
  )) as CheckinRow[];

  return rows.map(mapRowToCheckin);
}

export async function getRecentCheckins(limit = 50): Promise<CheckinRecord[]> {
  const rows = await sql<CheckinRow[]>`
    SELECT id,
           truck_id,
           presence,
           line_length,
           comment,
           rating,
           entered_raffle,
           worker_id,
           created_at
    FROM checkins
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;

  return rows.map(mapRowToCheckin);
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

  const windowStart =
    Date.now() - WORKER_WINDOW_MINUTES * 60 * 1000;

  const [{ count }] = await sql<{ count: string }[]>`
    SELECT COUNT(*)::int AS count
    FROM checkins
    WHERE worker_id = ${normalizedWorkerId}
      AND created_at >= ${new Date(windowStart)}
  `;

  if (Number(count) >= MAX_WORKER_SUBMISSIONS_PER_WINDOW) {
    throw new Error("Rate limit exceeded for this worker.");
  }

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

  const [inserted] = await sql<CheckinRow[]>`
    INSERT INTO checkins (
      id,
      truck_id,
      presence,
      line_length,
      comment,
      rating,
      entered_raffle,
      worker_id,
      created_at
    )
    VALUES (
      ${record.id},
      ${record.truckId},
      ${record.presence},
      ${record.lineLength},
      ${record.comment ?? null},
      ${record.rating ?? null},
      ${record.enteredRaffle},
      ${record.workerId},
      ${record.createdAt}
    )
    RETURNING id,
              truck_id,
              presence,
              line_length,
              comment,
              rating,
              entered_raffle,
              worker_id,
              created_at
  `;

  return mapRowToCheckin(inserted);
}
