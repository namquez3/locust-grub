import { prisma } from "@/lib/prisma";
import type {
  CheckinInput,
  CheckinRecord,
  PresenceLabel,
  LineLengthLabel,
} from "@/lib/types";

// Check if we're using the database (has DATABASE_URL env var)
export function isDatabaseAvailable(): boolean {
  return !!process.env.DATABASE_URL;
}

// Convert Prisma model to CheckinRecord
function prismaToRecord(checkin: {
  id: string;
  truckId: string;
  presence: string;
  lineLength: string;
  comment: string | null;
  rating: number | null;
  enteredRaffle: boolean;
  workerId: string;
  createdAt: Date;
}): CheckinRecord {
  return {
    id: checkin.id,
    truckId: checkin.truckId,
    presence: checkin.presence as PresenceLabel,
    lineLength: checkin.lineLength as LineLengthLabel,
    comment: checkin.comment || undefined,
    rating: checkin.rating || undefined,
    enteredRaffle: checkin.enteredRaffle,
    workerId: checkin.workerId,
    createdAt: checkin.createdAt.toISOString(),
  };
}

// Get checkins with optional filters
export async function getCheckinsFromDb(options?: {
  truckId?: string;
  minutes?: number;
}): Promise<CheckinRecord[]> {
  if (!isDatabaseAvailable()) {
    throw new Error(
      "Database not configured. Set DATABASE_URL environment variable.",
    );
  }

  const { truckId, minutes } = options ?? {};

  const where: {
    truckId?: string;
    createdAt?: { gte: Date };
  } = {};

  if (truckId) {
    where.truckId = truckId;
  }

  if (minutes && minutes > 0) {
    where.createdAt = {
      gte: new Date(Date.now() - minutes * 60 * 1000),
    };
  }

  const checkins = await prisma.checkin.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return checkins.map(prismaToRecord);
}

// Get recent checkins with limit
export async function getRecentCheckinsFromDb(
  limit = 50,
): Promise<CheckinRecord[]> {
  if (!isDatabaseAvailable()) {
    throw new Error(
      "Database not configured. Set DATABASE_URL environment variable.",
    );
  }

  const checkins = await prisma.checkin.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
  });

  return checkins.map(prismaToRecord);
}

// Add a new checkin record
export async function addCheckinRecordToDb(
  input: CheckinInput & { id: string; createdAt: string },
): Promise<CheckinRecord> {
  if (!isDatabaseAvailable()) {
    throw new Error(
      "Database not configured. Set DATABASE_URL environment variable.",
    );
  }

  const checkin = await prisma.checkin.create({
    data: {
      id: input.id,
      truckId: input.truckId,
      presence: input.presence,
      lineLength: input.lineLength,
      comment: input.comment || null,
      rating: input.rating || null,
      enteredRaffle: input.enteredRaffle || false,
      workerId: input.workerId || "anonymous",
      createdAt: new Date(input.createdAt),
    },
  });

  return prismaToRecord(checkin);
}

// Check rate limit for a worker
export async function checkWorkerRateLimit(
  workerId: string,
  windowMinutes: number,
  maxSubmissions: number,
): Promise<boolean> {
  if (!isDatabaseAvailable()) {
    throw new Error(
      "Database not configured. Set DATABASE_URL environment variable.",
    );
  }

  const cutoff = new Date(Date.now() - windowMinutes * 60 * 1000);

  const count = await prisma.checkin.count({
    where: {
      workerId,
      createdAt: {
        gte: cutoff,
      },
    },
  });

  return count < maxSubmissions;
}
