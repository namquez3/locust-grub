# NETS-2130-Final-Project


---

## 1. What I Explored Today

_List the projects you seriously considered. Keep it brief._

| Project Name | Source | Key Takeaway (1 sentence) |
|--------------|--------|---------------------------|
| Street Truck Finder  | Round 3 | Viable only if scope is reduced to Penn campus and the team seeds all initial data |
| Kinnect | R2 Drop  | Strong natural crowdsourcing motivation, but requires more technical complexity unless heavily stripped down for MVP|
| ProfPulse  | Instructor / New | Useful idea but less exciting personally and already close to existing university review platforms|

_Add more rows if needed_

**Resources I used**:
- [-] Rubric scoring (RUBRIC-PROJECT-VIABILITY.md)
- [-] V2 detailed analyses (reports/v2-analyses/)
- [-] Steelman Analysis pathways (STEELMAN-ANALYSIS.md)
- [ ] Group discussions
- [ ] Other: [specify]

---

## 2. My Decision

**Project Name**: Street Truck Finder – Penn-Only

**Decision type**:
- [ ] STAYING with Round 3 project (same approach)
- [-] STAYING with Round 3 project (modified approach/scope)
- [ ] PIVOTING to different project
- [ ] JOINING another team's project

**If pivoting or adopting someone's idea**:
- Original author (if applicable): [N/A]
- Original round: [N/A]

---

## 3. Why This Decision

**High-level reasoning** (2-3 paragraphs):

_Explain your thought process. What made you choose this project? What were the key factors? What trade-offs did you consider?_

I chose to stay with the Food Truck Finder project, but only after significantly modifying the approach. The original idea failed the viability score (17/30) because it depended on real-time crowdsourcing and full Philly coverage, which would have required external partnerships, a large active user base, and daily data collection. Also, the Steelman Analysis made it clear that the only way this project works in 5 weeks is if we drop the “live tracking” requirement and concentrate solely on the Penn campus, where we can manually seed complete data in Week 1. That removes the cold-start problem and gives us a usable app on launch day.

With the Penn-only scope, the project becomes realistically buildable, testable, and recruitable, because Penn students already experience the problem (“Which truck is out,a nd where dshould i get food from?”), and we can reach them through Sidechat, Discords, and r/UPenn. This version I would say raises the rubric score to ~22/30, which puts it into the “Weak GO” category. I also considered pivoting to Kinnect, which was more motivationally strong but technically larger. Between the two, this is the one I can confidently build in 5 weeks.

**What convinced me**:
- Solves our cold-start problem by having the team seed all truck data before launch
- Clear captive audience -ie penn kids
- MVP is simple and buildable within 2 weeks

**What concerns me** (and how I'll address it):
- Low usage if launch is not well-timed → Run validation at lunch hour and also target Penn-specific channels
- Manual location updating may be tedious → Limit updates to probably 3x per week and visibly show “Last updated” timestamp

---

## 4. What I'm Building

**One-sentence project description**:
A campus-focused map of Penn food trucks with menus, hours, and manually updated locations, later expandable through crowdsourced updates

**MVP Scope** (3-4 core features only):

1. **Interactive truck map**: Shows 8–10 Penn-area food trucks pinned on a map
2. **Truck info pages**: Menu photos, hours, cuisine tags, and price ranges
3. **“Last updated” system**: Team updates locations manually M/W/F during Week 1–2
4. **[Feature 4 name - OPTIONAL]**: [1-sentence description]

**What I'm explicitly NOT building** (to keep scope realistic):
- Real-time GPS tracking or automatic truck location feeds
- Full Philadelphia coverage beyond Penn campus
- Push notifications, truck owner dashboards, or complex QC systems

---

## 5. Week 1 Validation

**The specific test I'll run Week 1**:

_Be concrete. Not "social media" but "Post in r/UPenn and 3 class Slacks on Monday at 10am"_

- **Where**: r/UPenn subreddit, CIS 1200 + 1210 GroupMes, Penn Discord servers
- **When**: Monday, Nov 17 at 11:30am 
- **What**: Post demo screenshots and link and ask “Would you use this before deciding where to eat?” with short interest form maybe
- **Success metric**: At least 40 link clicks, 15+ form responses, and 5+ users ask for launch access or features

**If Week 1 test fails, I will**:
- [ ] Pivot to: [alternative approach]
- [ ] Use MTurk/paid participants
- [-] Try different recruitment channel: [penn dining maybe]
- [-] Simplify the task to: [static menu without the map ]
- [ ] Other: [specify]

---

## 6. **Tentative** Team (Optional, Only If You Already Have An Idea)

At this stage, you are not expected to have formed teams, however if you already have an idea of who you intend to work with, you may indicate it here.

**Team members**:

1. [Name] ([PennKey]) - [Primary role]
2. [Name] ([PennKey]) - [Primary role]
3. [Name] ([PennKey]) - [Primary role] _(optional)_
4. [Name] ([PennKey]) - [Primary role] _(optional)_

**Team status**:
- [ ] Same team from Round 3
- [ ] New team formed during Round 4
- [ ] Solo (will find teammates later)
- [ ] Joining an existing team

---

## 7. Reflection

**Most valuable part of Round 4**:
I think it was realizing that a project can sound exciting but still fail if the first version has zero value until other people use it.

**Biggest surprise**:
I guess that almost every crowdsourcing idea collapses if it depends on the crowd before delivering value

**One thing I'd tell future students about Round 4**:
I'd say Don’t defend your project.Try and change it. The rubric is a great tool for that.
---

## Commitment

**I commit to**:
- [-] Building the MVP scope above (3-4 features maximum)
- [-] Running a concrete Week 1 validation test
- [-] Pivoting if Week 1 shows <20% success
- [-] Meeting with instructor if I hit major blockers

**Signature**: Kieran Chetty **Date**: 11/04/2025

---

## Submission

1. Save as `round4/[your-pennkey].md`
2. Submit via pull request
3. Deadline: [Instructor will specify]

---

## Database Setup

The app supports both file-based storage (for local dev) and Prisma Postgres (for production). See `PRISMA_SETUP.md` for detailed setup instructions.

**Quick start:**
1. Create a Prisma Postgres database in your Vercel project dashboard
2. Set `DATABASE_URL` environment variable in Vercel
3. Run `npx prisma db push` to create the tables
4. Deploy!

## Future stretch goals

See the updated LocustGrub README below for current backlog items and stretch ideas.

---

## LocustGrub MVP

LocustGrub is a Penn-only food truck radar. We seed a directory of 10 popular trucks and keep their real-time status fresh via lightweight student check-ins. This repository contains:

- A Next.js 15 app with Tailwind styling
- API routes for reading truck status, recording check-ins, and viewing recent submissions
- Minimal QC (rate limiting + required fields) and 30-minute majority-vote aggregation
- A live map (`/map`), top-trucks leaderboard (`/top`), deals/rewards hub (`/deals`), and an internal `/admin` page for debugging submissions

## Tech stack

- Next.js App Router + TypeScript
- Tailwind CSS
- File-backed JSON store at `data/checkins.json` (swap with Supabase/Neon when ready)
- React Leaflet + OpenStreetMap tiles for the interactive map

## Local development

```bash
npm install          # first time only
npm run dev          # http://localhost:3000
```

### Key routes (all update every 30 seconds)

| Path | Purpose |
| --- | --- |
| `/` | List view with search, plus button to launch the review modal. |
| `/map` | Leaflet map with pins, popovers, and a Google Maps fallback link. |
| `/top` | Top trucks based on past-24h ratings and recent comments. |
| `/deals` | Mocked promotions + explanation of the raffle incentive. |
| `/admin` | Internal log of the last 100 submissions (ratings, raffle opt-ins, etc.). |

### Persistent storage

Check-ins are saved to `data/checkins.json`. The repo bootstraps an empty array so you can run locally without extra services. In production you can replace `src/lib/store.ts` with a Supabase or Postgres adapter—everything else calls the same functions.

### Seed data

Truck metadata lives in `src/data/trucks.ts`. Update/add entries there (id, name, cuisine, usual hours, lat/lng).

## API surfaces

| Route | Method | Description |
| --- | --- | --- |
| `/api/trucks` | GET | Returns aggregated truck statuses (majority vote + recency filtering). |
| `/api/checkin` | POST | Stores `{ truckId, presence, lineLength, comment?, workerId? }`; rate-limited to 3 submissions / 10 min per worker. |
| `/api/admin/submissions` | GET | Last 100 submissions with relative timestamps. |

The home page fetches from `/api/trucks` (and revalidates after each submission). The `/admin` page renders server-side.

## Suggested workflow

1. Run `npm run dev`.
2. Visit `/` to see the seeded trucks and submit check-ins.
3. Use `/admin` to confirm they landed, copy into analysis notebooks, or export JSON.
4. For evaluation, collect real ground-truth checks during lunch and compare against `/api/trucks`.

## Quality control checklist

- **Penn email verification + code**: Users must verify an `@upenn.edu` address before the review modal unlocks. Demo codes show inline since we don't send real emails yet.
- **Location checker**: We request browser geolocation, verify it sits inside a pre-defined Penn bounding box, and block submissions otherwise (with an override that requires a 10+ character note).
- **Bad word filter**: Server rejects comments containing common profanity.
- **Rate limiting**: Max 3 submissions per worker per 10 minutes.
- **Raffle opt-in**: Every verified review can opt into the weekly “free meal” drawing; `/admin` shows the flag so we can audit entries.

## Future stretch goals

- Swap the JSON store for Supabase or Neon (see `src/lib/store.ts`).
- Add worker reliability and gold checks in `src/lib/truck-service.ts`.
- Layer in a Leaflet/Mapbox map view to complement the list UI.
- Automate analytics notebooks that read from `/api/admin/submissions`.
