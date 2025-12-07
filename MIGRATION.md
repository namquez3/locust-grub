# Migration Guide: File System to Vercel Postgres

This guide walks you through migrating LocustGrub from file-based storage to Vercel Postgres.

## Prerequisites

- A Vercel account (free tier works)
- Your project deployed or ready to deploy on Vercel

## Step 1: Create Vercel Postgres Database

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (or create a new one)
3. Navigate to the **Storage** tab
4. Click **Create Database** → Select **Postgres**
5. Choose a name for your database (e.g., `locustgrub-db`)
6. Select a region closest to your users
7. Click **Create**

## Step 2: Run Database Schema

1. In your Vercel project dashboard, go to **Storage** → Your Postgres database
2. Click on the **Query** tab
3. Copy and paste the contents of `schema.sql` from this repository
4. Click **Run** to execute the schema

Alternatively, you can use the Vercel CLI:

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Link your project
vercel link

# Run the schema (you'll need to use psql or a database client)
# The connection string is available in your Vercel dashboard
```

## Step 3: Get Connection String

1. In your Vercel dashboard, go to **Storage** → Your Postgres database
2. Click on the **.env.local** tab
3. Copy the `POSTGRES_URL` value

## Step 4: Set Environment Variables

### For Local Development

1. Create a `.env.local` file in your project root (if it doesn't exist)
2. Add your connection string:

```bash
POSTGRES_URL=postgres://user:password@host:port/database?sslmode=require
```

**Note:** For local development, you can leave `POSTGRES_URL` empty to use file-based storage as a fallback.

### For Vercel Production

1. In your Vercel dashboard, go to your project → **Settings** → **Environment Variables**
2. Add a new variable:
   - **Name:** `POSTGRES_URL`
   - **Value:** Your connection string from Step 3
   - **Environment:** Production, Preview, Development (select all)
3. Click **Save**

## Step 5: Migrate Existing Data (Optional)

If you have existing checkins in `data/checkins.json` that you want to migrate:

1. Create a migration script (see `scripts/migrate-data.ts` example below)
2. Run it once to import your existing data

```typescript
// scripts/migrate-data.ts
import { sql } from "@vercel/postgres";
import { readFileSync } from "fs";
import type { CheckinRecord } from "@/lib/types";

const checkins: CheckinRecord[] = JSON.parse(
  readFileSync("data/checkins.json", "utf-8")
);

async function migrate() {
  for (const checkin of checkins) {
    await sql`
      INSERT INTO checkins (
        id, truck_id, presence, line_length, comment,
        rating, entered_raffle, worker_id, created_at
      )
      VALUES (
        ${checkin.id},
        ${checkin.truckId},
        ${checkin.presence},
        ${checkin.lineLength},
        ${checkin.comment || null},
        ${checkin.rating || null},
        ${checkin.enteredRaffle || false},
        ${checkin.workerId},
        ${checkin.createdAt}
      )
      ON CONFLICT (id) DO NOTHING
    `;
  }
  console.log(`Migrated ${checkins.length} checkins`);
}

migrate().catch(console.error);
```

## Step 6: Verify Migration

1. Deploy your project to Vercel (or run locally with `POSTGRES_URL` set)
2. Test creating a checkin via the UI
3. Check the `/admin` page to verify data is being saved
4. Verify in Vercel dashboard → Storage → Query that data appears in the database

## How It Works

The code automatically detects if `POSTGRES_URL` is set:

- **If `POSTGRES_URL` is set:** Uses Vercel Postgres database
- **If `POSTGRES_URL` is not set:** Falls back to file-based storage (`data/checkins.json`)

This allows you to:
- Develop locally without a database
- Use the database in production
- Easily switch between storage methods

## Troubleshooting

### "Database not configured" error

- Make sure `POSTGRES_URL` is set in your environment variables
- For local development, check your `.env.local` file
- For Vercel, verify the environment variable is set in project settings

### Connection errors

- Verify your connection string is correct
- Check that your database is active in Vercel dashboard
- Ensure your IP is allowed (Vercel Postgres should handle this automatically)

### Schema errors

- Make sure you've run `schema.sql` in your database
- Check that the table exists: `SELECT * FROM checkins LIMIT 1;`

## Next Steps

- Consider adding database backups
- Set up monitoring for database performance
- Add indexes for additional query patterns if needed

