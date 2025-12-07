-- Vercel Postgres schema for LocustGrub checkins
-- Run this in your Vercel Postgres database dashboard or via CLI

CREATE TABLE IF NOT EXISTS checkins (
  id TEXT PRIMARY KEY,
  truck_id TEXT NOT NULL,
  presence TEXT NOT NULL CHECK (presence IN ('present', 'absent')),
  line_length TEXT NOT NULL CHECK (line_length IN ('none', 'short', 'medium', 'long')),
  comment TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  entered_raffle BOOLEAN DEFAULT FALSE,
  worker_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_checkins_truck_id ON checkins(truck_id);
CREATE INDEX IF NOT EXISTS idx_checkins_created_at ON checkins(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_checkins_worker_id ON checkins(worker_id);
CREATE INDEX IF NOT EXISTS idx_checkins_truck_created ON checkins(truck_id, created_at DESC);

