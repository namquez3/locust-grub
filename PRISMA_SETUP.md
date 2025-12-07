# Prisma Postgres Setup Guide

## ✅ What's Been Done

1. ✅ Installed Prisma and Prisma Client
2. ✅ Created Prisma schema (`prisma/schema.prisma`)
3. ✅ Updated database utilities to use Prisma Client
4. ✅ Generated Prisma Client

## 🚀 Next Steps

**Note:** You don't need to edit the schema in the Vercel dashboard. Your local `prisma/schema.prisma` file is the source of truth, and we'll sync it to the database.

### Step 1: Get Your Connection String

1. In the database dashboard, click the **".env.local"** tab
2. Click **"Show secret"** to reveal the values
3. Copy the `DATABASE_URL` value (not POSTGRES_URL)

### Step 2: Set Environment Variable Locally (for migration)

1. Go to your **Vercel project dashboard** (not the database dashboard)
2. Navigate to **Settings** → **Environment Variables**
3. Click **"Add New"**
4. Add:
   - **Name:** `DATABASE_URL`
   - **Value:** Paste the `DATABASE_URL` you copied
   - **Environments:** Select Production, Preview, and Development
5. Click **"Save"**

### Step 3: Set Environment Variable in Vercel Project

1. Go to your **Vercel project dashboard** (not the database dashboard)
2. Navigate to **Settings** → **Environment Variables**
3. Click **"Add New"**
4. Add:
   - **Name:** `DATABASE_URL`
   - **Value:** Paste the `DATABASE_URL` you copied
   - **Environments:** Select Production, Preview, and Development
5. Click **"Save"**

### Step 4: Sync Schema to Database

1. Create a `.env.local` file in your project root (if it doesn't exist):
   ```bash
   DATABASE_URL=your_connection_string_here
   ```
   (Use the same `DATABASE_URL` you copied from Vercel)

2. Push the schema to your database:
   ```bash
   npx prisma db push
   ```
   
   This will create the `checkins` table and indexes in your Vercel Postgres database.

   **Alternative:** If you prefer migrations:
   ```bash
   npx prisma migrate dev --name init
   ```

### Step 5: Generate Prisma Client

Make sure Prisma Client is generated:
```bash
npx prisma generate
```

### Step 6: Verify Setup

1. Check that tables were created:
   ```bash
   # If you have DATABASE_URL set locally
   npx prisma studio
   # This opens a GUI where you can see your tables
   ```

2. Or query directly:
   ```bash
   npx prisma db execute --stdin
   # Then type: SELECT * FROM checkins LIMIT 1;
   ```

### Step 7: Deploy & Test

1. Commit and push your changes:
   ```bash
   git add .
   git commit -m "Add Prisma Postgres backend"
   git push
   ```

2. Vercel will automatically deploy

3. Test your app:
   - Create a checkin via the UI
   - Check `/admin` page to verify it saved
   - The data should now be in your Prisma Postgres database!

## 📝 How It Works

The code automatically detects storage:
- **Has `DATABASE_URL`?** → Uses Prisma Postgres ✅
- **No `DATABASE_URL`?** → Uses `data/checkins.json` (local dev fallback) ✅

## 🔍 Troubleshooting

### "Prisma Client not generated"
```bash
npx prisma generate
```

### "Database connection error"
- Verify `DATABASE_URL` is set correctly in Vercel project settings
- Check that your database is active in Vercel dashboard

### "Table doesn't exist"
- Make sure you ran the migration (Step 4)
- Check the Prisma schema matches what's in the database

### For Local Development
- Create `.env.local` with `DATABASE_URL` to use the database locally
- Or leave it empty to use file-based storage (`data/checkins.json`)

