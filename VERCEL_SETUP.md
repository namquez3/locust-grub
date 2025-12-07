# Quick Setup Guide: Vercel Postgres Backend

## ✅ What's Been Done

1. ✅ Installed `@vercel/postgres` package
2. ✅ Created database schema (`schema.sql`)
3. ✅ Created database utilities (`src/lib/db.ts`)
4. ✅ Updated `src/lib/store.ts` to use database when available (with file fallback)
5. ✅ Added migration documentation

## 🚀 Next Steps

### 1. Create Postgres Database in Vercel

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project → **Storage** tab
3. Click **Create Database** → **Postgres**
4. Name it (e.g., `locustgrub-db`) and select a region
5. Click **Create**

### 2. Run the Schema

1. In Vercel dashboard → **Storage** → Your database → **Query** tab
2. Copy/paste contents of `schema.sql`
3. Click **Run**

### 3. Get Connection String

1. In database dashboard → **.env.local** tab
2. Copy the `POSTGRES_URL` value

### 4. Set Environment Variable

**In Vercel Dashboard:**
- Project → **Settings** → **Environment Variables**
- Add `POSTGRES_URL` with your connection string
- Apply to: Production, Preview, Development

**For Local Development (optional):**
- Create `.env.local` file
- Add: `POSTGRES_URL=your_connection_string_here`
- Or leave empty to use file-based storage

### 5. Deploy & Test

```bash
# Push your changes
git add .
git commit -m "Add Vercel Postgres backend support"
git push

# Vercel will auto-deploy, or trigger manually
```

Then test:
- Create a checkin via the UI
- Check `/admin` page to see it saved
- Verify in Vercel dashboard → Storage → Query

## 📝 How It Works

The code automatically chooses storage:
- **Has `POSTGRES_URL`?** → Uses Vercel Postgres ✅
- **No `POSTGRES_URL`?** → Uses `data/checkins.json` (local dev) ✅

This means:
- ✅ Local development works without database
- ✅ Production uses real database
- ✅ No code changes needed to switch

## 🔍 Verify It's Working

1. Check Vercel logs for database connection
2. Query the database: `SELECT COUNT(*) FROM checkins;`
3. Create a test checkin and verify it appears in database

## 📚 More Details

See `MIGRATION.md` for:
- Detailed step-by-step instructions
- Data migration script (if you have existing data)
- Troubleshooting guide

