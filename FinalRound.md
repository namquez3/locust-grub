# Final Project Proposal: LocustGrub

**Team Name**: LocustGrub  
**Submission Date**: 11/13/2025  
**GitHub Organization**: https://github.com/kchett1/NETS-2130-Final-Project

---

## Team Information

### Team Members

| Name          | PennKey  | Primary Role(s)                          | Secondary Skills                 |
|--------------|----------|-------------------------------------------|----------------------------------|
| Nico Marquez | namquez | Frontend Dev, UX & Writing | Data Analysis, Experiment Design |
| [TBD 2]       | [tbd2]  | Backend Dev, API Integration             | DevOps, Database Design          |
| [TBD 3]       | [tbd3]  | QC & Aggregation Module                  | Statistics, Python               |
| [TBD 4]       | [tbd4]  | Crowd Recruitment & Analytics            | Survey Design, Visualization     |

### Team Skills Inventory

**Skills we have:**
- Web frontend (React/JS): Nico (namquez), [tbd2]
- Basic backend & APIs (Node/Express): [tbd2]
- UX writing / user research: Nico (namquez)
- Data analysis & basic statistics: Nico (namquez), [tbd3]

**Skills we need to learn/acquire:**
- Map APIs (Leaflet/Mapbox): Needed for interactive truck map – [tbd2] will learn it  
- Robust QC/aggregation patterns: Needed for combining crowd signals – [tbd3] will learn and prototype in Python  
- Recruitment at scale (beyond class): Needed to reach enough Penn students – Nico will explore channels and messaging patterns

**External resources we might need:**
- Map tiles / geocoding API (e.g., Mapbox or Leaflet + OSM) – Status: pending (free student tier expected)  
- Potential small MTurk or Prolific budget for pilot tasks – Status: planning, estimate <$50

### Team Availability for TA Meetings

**Week of 11/17/2025:**

_List all time slots when the ENTIRE team can meet with a TA. Eastern Time._

- Monday: 6:00 PM – 10:00 PM  
- Tuesday: 6:00 PM – 10:00 PM  
- Wednesday: 6:00 PM – 10:00 PM  
- Thursday: 6:00 PM – 10:00 PM  
- Friday: 6:00 PM – 10:00 PM

**Preferred meeting duration**: 45 min  
**Meeting format preference**: Either (in-person or Zoom)  
**Primary contact for scheduling**: [tbd]

---

## Project Overview

### Project Connection to Round 4

**Round 4 Decision**: STAYING (modified approach/scope) – rebranded as LocustGrub  
**Original idea from**: Round 3 / Round 4 – “Street Truck Finder – Penn Only” (Kieran Chetty, chettyk)

**How the idea evolved**:  
The original “Street Truck Finder” tried to cover all of Philly with near real-time updates, which failed the viability rubric because it required a huge active user base and real-time data feeds. In Round 4, we narrowed the scope to Penn campus only and committed to manually seeding complete initial data, dropping live GPS and full-city coverage. LocustGrub keeps the Penn-only focus but makes the crowdsourcing piece explicit: Penn students and crowd workers will validate truck presence, wait time, and basic conditions, with QC and aggregation modules turning noisy reports into reliable, student-facing information.

### Problem Statement

Finding a good food truck on or near Penn’s campus is surprisingly hard at lunch: students don’t know which trucks are actually out, what lines look like, or what the options are beyond a few well-known spots. Existing maps are static or incomplete, and truck hours are inconsistent. LocustGrub solves this by combining seeded truck data with continuous, lightweight crowd contributions that keep a campus-focused truck map fresh enough to be truly useful during the lunch rush.

### One-Sentence Pitch

LocustGrub is a Penn-only food truck map whose locations, hours, and “is-it-really-here-right-now?” status are continuously kept up to date through crowdsourced check-ins and lightweight validation tasks.

### Target Users

**End Users**:  
Penn students and staff deciding where to grab lunch on/around Locust Walk and Spruce, especially during busy lunch hours.

**Crowd Workers**:  
- Penn students physically near campus (class volunteers, friends, r/UPenn, Discord, GroupMes) submitting check-ins and photos.  
- Optional: external crowd workers (MTurk/Prolific) used for validation/labeling of photos and text reports (e.g., inferring line length from photos).

**Scale**:  
- For a successful demo:  
  - End users: 20–40 Penn students who open LocustGrub at least once over lunch hour  
  - Crowd workers: 25–50 check-ins across 8–10 trucks over multiple days  
  - At least 3–5 external workers per validation batch (photo/line-length labeling) for aggregation experiments

### Project Type

- [ ] Human computation algorithm  
- [ ] Social science experiment with the crowd  
- [ ] Tool for crowdsourcing (requesters or workers)  
- [x] Business idea using crowdsourcing  
- [ ] Other: 

---

## System Architecture

### Flow Diagram

**Flow diagram location**: `docs/locustgrub-flow-diagram.png`

The diagram will show:

1. **Seed Data Module** (team manually curates truck list, locations, hours, menus)  
2. **End-User Web App** (map + truck detail pages)  
3. **Crowd Submission API** (forms for check-ins, photos, simple labels)  
4. **QC Module** (filters, agreement checks, worker reliability)  
5. **Aggregation Module** (combines QC-passed reports into truck status and wait-time estimates)  
6. **Database** (stores trucks, raw submissions, QC outputs, aggregated state)  
7. **Admin Dashboard** (team views pipeline health, flags issues)

**If you haven't created it yet – component relationships (words):**

1. Seeded Truck Data → stored in DB as base layer  
2. End-user requests → Backend reads aggregated truck state from DB → returns map + detail info  
3. Crowd submissions (check-ins/photos) → Crowd Submission API → stored as raw reports  
4. QC Module consumes raw reports → flags low-quality or inconsistent ones, passes acceptable ones forward  
5. Aggregation Module consumes QC-passed reports → computes truck-level status (e.g., “Open with ~10–15 min line”) → writes back to DB  
6. Admin Dashboard reads both raw and processed data → lets team monitor pipeline and adjust thresholds

### Major System Components

_List all major components with point values (1–4). Target total: 15–20._

| Component                             | Description                                                                                 | Points | Owner(s)   | Dependencies                              |
|--------------------------------------|---------------------------------------------------------------------------------------------|--------|-----------|-------------------------------------------|
| 1. Seed & Truck Directory Module     | Create and maintain list of ~8–10 Penn trucks with base info and initial locations.        | 2      | Nico    | None                                      |
| 2. End-User Map & Detail UI         | React/map interface showing trucks, statuses, and detail pages (menus, hours).             | 4      | Nico    | Component 1 (seed data), basic backend    |
| 3. Crowd Submission & API Backend    | REST endpoints and DB tables for check-ins, photos, and simple categorical inputs.         | 4      | [tbd2]    | Component 1, DB setup                     |
| 4. QC Module                         | Filters spammy/low-quality submissions and computes worker reliability / agreement scores. | 4      | [tbd3]    | Component 3 (submissions), sample data    |
| 5. Aggregation Module                | Combines QC-passed reports into per-truck status, average wait times, confidence scores.   | 3      | [tbd3]    | Components 3 & 4                          |
| 6. Admin Dashboard & Analytics UI    | Simple internal view of trucks, recent submissions, QC results, and aggregated states.     | 3      | [tbd4]    | Components 3, 4, 5                        |

**Total Points**: 2 + 4 + 4 + 4 + 3 + 3 = **20**

**Point allocation rationale**:  
We treat crowd-facing backend (submissions, QC, aggregation) as the core complexity; each is 3–4 points because they require careful schema design, algorithms, and integration. The map UI is also complex (4 points) because it must integrate real-time-ish state and be usable on mobile browsers. The seed module is simpler (2) as mostly data entry + basic CRUD. The admin dashboard is moderate (3) since it’s mostly filtered views of existing data with some debugging tools.

### Detailed Workflow

1. **Seed truck data (Team)**:  
   Team manually creates an initial dataset of ~8–10 trucks around Penn (name, cuisine, typical spot, hours, menu link/photo, base coordinates) and loads it into the DB.

2. **User opens LocustGrub (End User)**:  
   Student visits the web app on their phone; the frontend requests the list of trucks + aggregated status and renders them on a map.

3. **User views truck details (End User)**:  
   Tapping a pin shows a detail card with menu photo, hours, price range, last updated time, and “crowd-estimated line length.”

4. **Crowd check-in (Local students)**:  
   From either the map or a separate “Contribute” tab, a user submits a quick check-in:  
   - Confirm truck presence (Yes/No)  
   - (Optional) Photo of truck/line  
   - Line length category (e.g., “No line / Short / Medium / Long”)  
   - Optional quick rating (1–5 for experience)

5. **Submission capture (Backend)**:  
   Submissions are POSTed to the Crowd Submission API, stored in a `submissions` table with timestamp, approximate location, worker ID, and content.

6. **QC Module processing (Automated)**:  
   On a schedule (e.g., every 5 minutes) or triggered by new submissions:  
   - Filters obviously invalid entries (too far from truck, impossible timestamp, spam text).  
   - Compares multiple workers’ reports for same truck/time window to compute agreement.  
   - Updates worker reliability scores based on agreement with consensus & occasional gold checks.

7. **Aggregation Module processing (Automated)**:  
   For each truck and time window (e.g., last 30 minutes):  
   - Aggregates QC-passed line length labels using reliability-weighted majority voting.  
   - Computes binary “is truck likely present?” with probability/confidence.  
   - Computes “last verified” time and sets freshness buckets (e.g., “verified <20 min ago”).

8. **Update aggregated state (Backend)**:  
   Aggregated results are written to a `truck_status` table that the frontend reads from.

9. **End-user view refresh (End User)**:  
   When user refreshes or revisits the map, the UI shows updated statuses, last verified time, and line length, reflecting aggregated crowd data.

10. **Admin monitoring (Team)**:  
    Through an internal dashboard, team members can see raw submissions, QC decisions, aggregated statuses, and identify trucks with low coverage or inconsistent signals.

### Human vs. Automated Tasks

| Task                                             | Performed By | Justification                                                                                 |
|--------------------------------------------------|--------------|-----------------------------------------------------------------------------------------------|
| Confirming whether a truck is physically present | Human        | Requires physical presence / perception; GPS alone is noisy and truck schedules are informal. |
| Estimating line length from photos               | Human        | Visual crowd density estimation is still better done by humans for small-scale lines.         |
| Basic filtering and agreement computation        | Automated    | Simple rules and agreement metrics can be implemented algorithmically and consistently.       |
| Combining multiple reports into one status       | Automated    | Weighted majority and averaging are standard aggregation operations suitable for code.        |

---

## Quality Control Module

### QC Strategy Overview

Our QC strategy focuses on two things: (1) ensuring that reports actually reflect on-the-ground reality, and (2) discouraging opportunistic low-effort contributions. Because our data is relatively simple (presence, categorical line length, optional photo), we can use agreement-based reliability and basic heuristics to filter out suspicious submissions. We expect a mix of honest, in-situ student contributors and some noisier contributions if we ever open it beyond Penn.

We will apply QC **before** aggregation, so that only reasonable, location-plausible, and agreement-consistent submissions influence the live truck status. QC will also maintain per-worker reliability scores, allowing us to downweight or ignore inputs from workers who frequently disagree with consensus or fail gold tasks. This is especially important if we pay external workers to label line-length from photos.

### Specific QC Mechanisms

**Primary mechanism**: Reliability-weighted agreement + rule-based filters

**Implementation details**:

- **Input format**:  
  A batch of raw submissions for a given time window and truck, each containing:  
  `{ worker_id, truck_id, timestamp, location, presence_label, line_length_label, rating, photo_url? }`

- **Processing**:  
  - **Rule filters**:  
    - Discard submissions where the reported coordinate is more than X meters from truck’s canonical location **and** worker doesn’t provide a photo.  
    - Rate-limit: ignore more than N submissions per worker per 10 minutes.  
  - **Agreement checks**:  
    - For overlapping submissions (same truck, ≤15–20 min apart), compute percent agreement on presence and line category.  
    - Update worker reliability score (e.g., moving average of agreement with consensus).  
  - **Gold checks (if used externally)**:  
    - Inject occasional known-status items (simulated or team-verified) for external workers.  
    - Drop/flag workers failing >Y% of gold items.

- **Output format**:  
  A set of QC-passed submissions with additional metadata:  
  `{ submission_id, worker_id, truck_id, labels..., worker_reliability, qc_passed: bool, qc_flags: [] }`

- **Threshold for acceptance**:  
  - Presence: Keep submissions from workers whose reliability score is above a threshold (e.g., ≥0.6) or which agree with at least one other reliable worker.  
  - Line length: Keep labels if inter-worker agreement for that time window is above a minimal threshold, or mark them as low-confidence.

**Additional mechanisms**:

- [x] Majority voting across multiple workers  
  - At least 3 workers per photo labeling batch; 2+ agreement for presence and line category.  

- [x] Reputation system  
  - Reliability score updated after each batch based on agreement with consensus and gold tasks.  

- [x] Statistical outlier detection  
  - Identify workers whose submissions systematically disagree with others, or who always choose the most “extreme” category, and downweight them.  

- [ ] Gold standard questions (primary only if we use MTurk for photo labeling)  
- [ ] Attention checks (minimal; short tasks)  

### QC Module Code Plan

**Location in repo**: `src/qc/quality_control.py` (or `.js` if implemented in Node)

**Key functions/classes**:

1. `filter_raw_submissions(submissions)` – Applies basic rule-based filters (distance checks, rate-limiting).  
2. `update_worker_reliability(submissions, previous_scores)` – Computes agreement metrics and updates reliability scores.  
3. `qc_batch(submissions, previous_scores)` – High-level function that runs filters, updates reliability, and outputs QC-annotated submissions.

**Input data format**:
```json
[
  {
    "submission_id": 123,
    "worker_id": "penn_001",
    "truck_id": "magic_carpet",
    "timestamp": "2025-11-21T11:45:30Z",
    "lat": 39.9523,
    "lng": -75.1920,
    "presence_label": "present",
    "line_length_label": "medium",
    "rating": 4,
    "photo_url": "https://.../img1.jpg"
  }
]
```

**Output data format**:
```json

    [
      {
        "submission_id": 123,
        "worker_id": "penn_001",
        "truck_id": "magic_carpet",
        "presence_label": "present",
        "line_length_label": "medium",
        "rating": 4,
        "worker_reliability": 0.78,
        "qc_passed": true,
        "qc_flags": []
      }
    ]
```

**Sample scenario**:

Five students submit check-ins for “Magic Carpet” between 11:40–11:55. Two say “present / medium line,” two say “present / long line,” and one says “not present.” The QC module filters out one worker whose location is 400m away and who has a low reliability score. Among remaining submissions, 4/4 agree on presence = “present,” so presence passes QC with high confidence. For line length, two categories (“medium” and “long”) appear; QC marks both as valid but with moderate disagreement and passes them to the aggregation module with associated reliabilities.

---

## Aggregation Module

### Aggregation Strategy Overview

The aggregation module turns QC-passed submissions into a single, interpretable status per truck: is it there, how long is the line, and how fresh is this information? Because our labels are categorical and sometimes sparse, we will use reliability-weighted majority voting plus recency weighting. More recent, higher-reliability submissions count more; old or low-reliability ones count less.

We aggregate at the level of (truck, rolling time window), e.g., last 30 minutes. This lets us output statuses like “Present, medium line, verified 8 minutes ago (high confidence)” instead of raw reports. We will also compute a confidence score and explicitly show it (e.g., through “Last updated” and optional confidence labels), tying directly to user trust in the results.

### Aggregation Method

**Primary method**: Reliability + recency–weighted majority voting for categorical labels

**Implementation details**:

- **Input format**:  
  Batch of QC-passed submissions per truck and time window:
    [
      {
        "submission_id": ...,
        "worker_id": ...,
        "truck_id": ...,
        "presence_label": "present"/"absent",
        "line_length_label": "none"/"short"/"medium"/"long",
        "worker_reliability": float,
        "timestamp": ...
      }
    ]

- **Processing**:
  - Compute weights for each submission as:  
    weight = worker_reliability × recency_factor,  
    where recency_factor decays with age (e.g., submissions older than 30 minutes get near-zero weight).
  - For presence:
    - Sum weights for “present” and “absent”; choose label with higher total weight.
    - Confidence = max_weight_sum / (total_weight_sum + epsilon).
  - For line length:
    - Sum weights for each category and pick argmax.
    - Confidence similarly computed.
  - Compute “last verified” as the timestamp of the most recent QC-passed “present” report.

- **Output format**:
    {
      "truck_id": "magic_carpet",
      "status": "present",          // or "uncertain"/"absent"
      "status_confidence": 0.88,
      "line_length": "medium",
      "line_confidence": 0.72,
      "last_verified_at": "2025-11-21T11:52:00Z",
      "num_reports": 7,
      "effective_window_minutes": 30
    }

- **Handling edge cases**:
  - If total weight < minimal threshold (e.g., almost no data), status = "unknown" and we show “Not recently verified.”
  - If presence is high confidence “absent,” we hide line length or mark it “N/A.”
  - If there is a tie in weighted sums, choose “more conservative” label (e.g., “unknown presence,” “medium line”) and flag for admin review.

**Why this method**:

Weighted majority voting is appropriate because our labels are low-dimensional and easily interpretable, and we expect only a handful of submissions per truck per window. More complex probabilistic methods would be overkill given project scale and timeframe. Reliability + recency weighting maps well to our intuition about trust: people who have agreed with others in the past and who report recently should matter more.

### Aggregation Module Code Plan

**Location in repo**: `src/aggregation/aggregate.py`

**Key functions/classes**:

1. `aggregate_truck_status(qc_submissions)` – Takes QC-passed submissions for one truck, returns aggregated status object.  
2. `compute_weighted_majority(labels, weights)` – Utility function that returns winning label and confidence.  
3. `run_aggregation_for_all_trucks()` – Periodic job that loads recent QC-passed submissions from DB, aggregates per truck, and writes to `truck_status` table.

**Input data format**:
    [
      {
        "submission_id": 123,
        "worker_id": "penn_001",
        "truck_id": "magic_carpet",
        "presence_label": "present",
        "line_length_label": "medium",
        "worker_reliability": 0.8,
        "timestamp": "2025-11-21T11:48:00Z"
      }
    ]

**Output data format**:
    {
      "truck_id": "magic_carpet",
      "status": "present",
      "status_confidence": 0.88,
      "line_length": "medium",
      "line_confidence": 0.72,
      "last_verified_at": "2025-11-21T11:52:00Z",
      "num_reports": 7
    }

**Sample scenario**:

For “Magic Carpet,” within the last 30 minutes we have 5 QC-passed submissions: 4 with presence="present" and line="medium"/"long", and 1 with presence="absent". The "absent" report comes from a worker with low reliability and is 28 minutes old; the others are from more reliable workers in the last 10 minutes. The aggregation module assigns higher weights to the recent, reliable “present” reports, yielding status="present" with high confidence. Line length might be “medium” with moderate confidence if weights are slightly higher there than for “long.”

### Integration: QC ↔ Aggregation

QC always runs before aggregation. The pipeline is:

Raw submissions → QC Module → QC-passed submissions → Aggregation Module → `truck_status` table → End-user UI.

Both QC and Aggregation operate on similar JSON-like structures and share worker reliability scores. Aggregation does not see raw or failed submissions; it only works on QC outputs. The data flow inside the system is visualized in the main flow diagram and mirrored in the directory structure: data sample inputs/outputs for both modules live under `data/sample-qc-*` and `data/sample-agg-*`.

---

## User Interface & Mockups

### Interfaces Required

**For Crowd Workers:**
- Task interface / check-in form (for Penn students)
- Simple instructions popover on how to submit good check-ins

**For End Users:**
- Main map interface (truck pins + filter controls)
- Truck detail page (menu, hours, last updated, line estimate)
- Optional “Contribute” tab/button integrated into main UI

**For Administrators (team):**
- Dashboard listing trucks + current status
- Table of recent submissions with QC/aggregation flags

### Mockup Details

**Mockup location**: `docs/mockups/` (e.g., `docs/mockups/map-main.png`, `docs/mockups/truck-detail.png`, `docs/mockups/checkin-form.png`, `docs/mockups/admin-dashboard.png`)

#### Interface 1: Map & List View

- **User type**: End user  
- **Purpose**: Let students quickly see which trucks are out and how long lines are.  
- **Key elements**:
  - Map centered on Penn campus with pins for each truck
  - Legend for status (e.g., green = present, gray = stale/unknown)
  - Toggle to switch between map view and list view
  - Basic filters: cuisine type, price range
- **Mockup file**: `docs/mockups/map-main.png`  
- **Notes**: Mobile-first design; “Last updated X min ago” shown on pins/list items.

#### Interface 2: Truck Detail Page

- **User type**: End user  
- **Purpose**: Show more detail for a single truck.  
- **Key elements**:
  - Header with truck name, cuisine tags, and “Open / Unknown / Likely closed”
  - Menu photo or link, sample items & price range
  - “Line estimate: Medium (~10–15 min), updated 7 min ago”
  - Button to “Check in / Contribute” for this truck
- **Mockup file**: `docs/mockups/truck-detail.png`  
- **Notes**: Emphasizes clarity over complexity.

#### Interface 3: Check-In / Contribute Form

- **User type**: Crowd worker (mostly Penn students)  
- **Purpose**: Let users submit a quick report in under 30 seconds.  
- **Key elements**:
  - Dropdown or auto-filled truck name based on context
  - Radio buttons: “Is the truck here?” (Yes/No/Not sure)
  - Line length options: None / Short / Medium / Long
  - Optional: photo upload, 1–5 rating
  - Short instructions on what makes a helpful photo/report
- **Mockup file**: `docs/mockups/checkin-form.png`  
- **Notes**: Minimal friction; can be opened directly from truck detail.

#### Interface 4: Admin Dashboard

- **User type**: Admin / team  
- **Purpose**: Monitor pipeline and data quality.  
- **Key elements**:
  - Table of trucks with current status, last verified, #reports
  - List of latest submissions with QC flags
  - Simple filters to find problematic workers or trucks
- **Mockup file**: `docs/mockups/admin-dashboard.png`  
- **Notes**: Internal use only; simple, utilitarian design.

### Task Design (for crowd workers)

**If using MTurk or similar platform (for photo/line labeling):**

**HIT title**: “Estimate Food Truck Line Length from a Photo”

**HIT description**:  
“You will see a photo of a food truck area and answer a few questions about whether the truck is present and how long the line is. Each task takes about 30–60 seconds.”

**Task instructions**:

- You will see one photo of a food truck area near a university campus.  
- First, decide if the truck is visible and clearly present in the photo.  
- Then, estimate line length using these categories:
  - **None** – No line of customers visible.  
  - **Short** – 1–5 people waiting.  
  - **Medium** – About 6–12 people waiting.  
  - **Long** – More than 12 people or a line that clearly extends beyond the frame.  
- Please answer carefully; we check agreement across workers and may reject random or low-effort answers.

**Example task**:

- Show photo of a truck with ~8 people waiting.  
- Worker answers:
  - Truck present? → Yes  
  - Line length? → Medium  

**Estimated time per task**: ~45 seconds  
**Payment per task**: $0.15 (effective rate ≈ $12/hour if estimates hold)  
**Number of tasks per HIT**: 5 photos  
**Qualifications required**:  
- Approval rate > 95%  
- At least 100 approved HITs  
- Location: US

---

## Technical Stack

### Technologies

**Frontend**: React (or Next.js) + simple map library (Leaflet or Mapbox GL)  
**Backend**: Node.js / Express  
**Database**: PostgreSQL (hosted on e.g., Supabase/Render) or SQLite for early dev  
**Crowdsourcing Platform**:  
- Local crowd: Penn students (social media, class channels)  
- Optional external crowd: MTurk/Prolific for photo labeling  
**ML/AI Tools** (optional):  
- Simple Python scripts (pandas, numpy) for offline analysis of QC/aggregation performance  
**Hosting/Deployment**:  
- Frontend: Vercel/Netlify  
- Backend: Render/Heroku-like service  
- DB: Hosted Postgres (Supabase/Render)

**Other tools**:  
- GitHub Actions for CI  
- Figma or Excalidraw for mockups and flow diagrams

### Repository Structure

**Current structure**:
    locustgrub/
    ├── README.md
    ├── docs/
    │   ├── flow-diagram.png
    │   └── mockups/
    ├── src/
    │   ├── frontend/
    │   ├── backend/
    │   ├── qc/
    │   │   └── quality_control.py
    │   └── aggregation/
    │       └── aggregate.py
    ├── data/
    │   ├── raw/
    │   ├── sample-qc-input/
    │   ├── sample-qc-output/
    │   ├── sample-agg-input/
    │   └── sample-agg-output/
    └── round5_final/

**Explain any deviations**:  
If we use TypeScript/Node instead of Python for QC/aggregation, corresponding modules will be `.ts` under `src/backend/qc` and `src/backend/aggregation` instead of separate Python directories. The data structure and responsibilities remain the same.

---

## Data Management

### Input Data

**Source**:  
- Manually seeded truck metadata (team)  
- Crowd submissions from Penn students (check-ins, photos)  
- Optional MTurk/Prolific photo labels

**Format**:  
- CSV/JSON for seed data (truck list)  
- JSON over HTTP for submissions  
- DB schema: tables for `trucks`, `submissions`, `worker_reliability`, `truck_status`

**Sample data location**: `data/raw/`  

**Sample data description**:  
- `trucks_seed.json` – 8–10 entries with truck names, locations, cuisines, typical hours.  
- `sample_submissions.json` – synthetic check-ins for demo and testing.

**How much data do you need?**
- Testing/development: 20–50 synthetic submissions plus a few real ones.  
- Final demo/analysis: 150–300 submissions across all trucks, plus 50–100 external labels (if used).

**Data collection plan**:  
- Week 1–2: Team seeds truck data and collects initial real submissions from friends/classmates.  
- Week 2–3: Run planned validation push (r/UPenn, Discord, class channels).  
- Week 3–4: If needed, supplement with synthetic or MTurk data for photo-labeling experiments.

### QC Module Data

**Input location**: `data/sample-qc-input/`

**Input format**:
    [
      {
        "submission_id": 1,
        "worker_id": "penn_001",
        "truck_id": "magic_carpet",
        "presence_label": "present",
        "line_length_label": "medium",
        "timestamp": "2025-11-21T11:45:00Z",
        "lat": 39.9523,
        "lng": -75.1920
      }
    ]

**Output location**: `data/sample-qc-output/`

**Output format**:
    [
      {
        "submission_id": 1,
        "worker_id": "penn_001",
        "truck_id": "magic_carpet",
        "presence_label": "present",
        "line_length_label": "medium",
        "worker_reliability": 0.75,
        "qc_passed": true,
        "qc_flags": []
      }
    ]

**Sample scenario documentation**:  
`data/sample-qc-input/README.md` will describe a scenario with multiple workers submitting conflicting reports and show how the QC module updates reliability and flags outliers.

### Aggregation Module Data

**Input location**: `data/sample-agg-input/`

**Input format**:  
QC-passed submissions with reliability scores and timestamps (as above).

**Output location**: `data/sample-agg-output/`

**Output format**:
    [
      {
        "truck_id": "magic_carpet",
        "status": "present",
        "status_confidence": 0.9,
        "line_length": "medium",
        "line_confidence": 0.7,
        "last_verified_at": "2025-11-21T11:52:00Z",
        "num_reports": 7
      }
    ]

**Sample scenario documentation**:  
`data/sample-agg-input/README.md` will walk through how several QC-passed submissions over a 30-minute window result in a final aggregated status and how ties or low-data situations are handled.

### Data Dependencies

**Does your QC module output feed into your aggregation module?**  
Yes. Aggregation only runs on QC-passed submissions, using their `worker_reliability` scores and timestamps.

**Data flow between modules**:  
`raw submissions` → `qc_input` → `qc_output` → `agg_input` → `agg_output` → `truck_status` for the frontend.

---

## Crowd Recruitment & Management

### Recruitment Strategy

**Where will workers come from?**

- Primary: Penn students physically near campus (friends, classmates, class Slacks, GroupMe, Discords, r/UPenn).  
- Secondary: Optional MTurk/Prolific workers for photo-based tasks.

**How will you reach them?**

- Posts in r/UPenn, CIS-related Discords, and relevant GroupMes.  
- Short in-class announcements (with instructor permission).  
- QR codes on a simple flyer or slide linking directly to the contribution page.

**When will you recruit?**

- Main push: Week 2 and Week 3, especially around lunch hours (11:30am–1:30pm).  
- Smaller pilot tests: Late Week 1 to verify flows and instructions.

### Worker Incentives

**Compensation model**:

- Penn students: primarily intrinsic motivation (making lunch easier for themselves and others) plus lightweight gamification: “top contributor” badges and optional small raffle (e.g., $10–$20 gift card if allowed).  
- External workers (if used): cash payment via MTurk/Prolific as specified earlier (~$0.15 per 45-second task).

**Justification**:  
For local students, the value is direct (better info when they’re hungry) and tasks are very low effort. A small raffle further encourages participation. For external workers, we must pay fairly given short task times; our estimated rate (~$12/hour) is reasonably aligned with best practices.

### Scale Requirements

**For MVP/Demo**:
- Minimum workers: 20–30 students submitting at least one check-in.  
- Minimum tasks completed: 75–100 submissions across all trucks.  
- Timeline: by end of Week 3.

**For Full Analysis**:
- Target workers: 50+ unique contributors.  
- Target tasks: 150–300 total submissions and 50–100 labeled photos.  
- Timeline: by end of Week 4.

### Backup Plan

If recruitment stalls or is insufficient:

- [x] Simplify task to require fewer workers (focus on presence only, drop line-length initially).  
- [x] Use simulated/synthetic data to test QC/aggregation code paths.  
- [ ] Use MTurk/paid workers for line-length labeling only (budget: up to $50).  

---

## Project Milestones & Timeline

### Week-by-Week Plan

Assume Weeks 1–4 start immediately after this proposal.

**Week 1 (Nov 14 – Nov 20)**  
- Milestone: Core data model and basic frontend skeleton.  
- Tasks:
  - [ ] Seed initial truck list and store in DB – Nico  
  - [ ] Set up backend and DB schema (trucks, submissions, workers) – [tbd2]  
  - [ ] Build basic React map view with static pins – Nico  
- Deliverable: End-to-end skeleton: map opens, trucks loaded from DB, no crowd yet.

**Week 2 (Nov 21 – Nov 27)**  
- Milestone: Crowd submission flow + initial QC prototype.  
- Tasks:
  - [ ] Implement check-in form and submission API – [tbd2]  
  - [ ] Implement basic QC filters (distance, rate-limiting) – [tbd3]  
  - [ ] Implement simple aggregation (unweighted majority) – [tbd3]  
  - [ ] Run small pilot with friends to collect 20–30 submissions – Nico  
- Deliverable: Users can submit check-ins, and aggregated presence/line length appears on map.

**Week 3 (Nov 28 – Dec 4)**  
- Milestone: Full QC + aggregation and main recruitment push.  
- Tasks:
  - [ ] Add reliability-based QC and recency weighting – [tbd3]  
  - [ ] Build admin dashboard to inspect submissions & statuses – [tbd4]  
  - [ ] Run Week 1-style validation test (r/UPenn, Discord, GroupMes) – Nico  
- Deliverable: Working LocustGrub with real data, initial analysis of QC/aggregation behavior.

**Week 4 (Dec 5 – Dec 11)**  
- Milestone: Analysis, polish, and final prep.  
- Tasks:
  - [ ] Conduct final data collection + (optional) MTurk photo labeling – [tbd4]  
  - [ ] Analyze QC/aggregation performance vs. simple baselines – [tbd3]  
  - [ ] Polish UI, documentation, and README – Whole team  
- Deliverable: Final demo-ready system + analysis figures and write-up.

### Critical Path

**Blocking dependencies**:

1. DB & backend setup must be done before crowd submissions or QC can run.  
2. QC module must at least be stubbed before aggregation and analysis.  
3. Recruitment depends on basic submission flow being usable.

**Parallel work**:

- While backend is being set up, frontend map UI and mockups can progress.  
- QC and aggregation can be prototyped on synthetic data while we wait for real submissions.

**Integration points**:

- End of Week 2: First integration of frontend map, backend submissions, and simple aggregation.  
- End of Week 3: Integration of advanced QC, aggregation, and admin dashboard.

---

## Risk Management

### Technical Risks

**Risk 1**: Map integration is more complex than expected (performance, mobile quirks).  
- **Likelihood**: Medium  
- **Impact**: Medium  
- **Mitigation**: Use well-documented libraries (Leaflet/Mapbox) and simple features; test early on mobile.  
- **Backup plan**: Fall back to a list-only UI with approximate distances instead of a full map.

**Risk 2**: QC/aggregation becomes over-complicated and hard to implement in time.  
- **Likelihood**: Medium  
- **Impact**: High  
- **Mitigation**: Start with a simple majority-vote baseline and add reliability weighting incrementally.  
- **Backup plan**: Present baseline results plus a partially implemented reliability-based method.

### Crowd-Related Risks

**Risk 1**: Not enough Penn students contribute submissions.  
- **Likelihood**: Medium–High  
- **Impact**: High  
- **Mitigation**: Aggressive early outreach (friends, classmates, channels) and low-friction tasks.  
- **Backup plan**: Use simulated or MTurk/Prolific data to stress-test QC/aggregation modules.

**Risk 2**: Low quality contributions (spam, random labels).  
- **Likelihood**: Medium  
- **Impact**: Medium  
- **Mitigation**: Clear instructions, simple tasks, basic rate-limiting and QC filters, reliability scoring.  
- **Backup plan**: Restrict analysis to higher-reliability workers and gold-checked subsets; run post-hoc filtering.

### Resource Risks

**Risk 1**: Budget for external crowd runs out or is delayed.  
- **Likelihood**: Low–Medium  
- **Impact**: Medium  
- **Mitigation**: Start small; pilot with a few dozen tasks to estimate costs before scaling.  
- **Backup plan**: Rely on class volunteers and synthetic images instead of MTurk.

---

## Evaluation Plan

### What You'll Measure

**Primary metrics**:

1. **Presence accuracy**:  
   - How measured: Compare aggregated presence vs. team’s ground-truth check at selected time slots.  
   - Target: ≥ 80% correct “present/absent” on evaluated trucks.

2. **Line length accuracy**:  
   - How measured: Compare aggregated line category (none/short/medium/long) vs. human ground-truth labeling on a sample.  
   - Target: ≥ 70% within one category of ground truth.

3. **User interest / potential adoption**:  
   - How measured: Link clicks + short survey (“Would you use this before deciding where to eat?”).  
   - Target: ≥ 20–30 survey responses with >60% positive.

**Secondary metrics**:

1. **Number of unique contributors** – measures crowd scale.  
2. **Coverage** – average number of submissions per truck per day/time window.  

### Analysis Approach

**Questions the analysis will answer**:

1. How accurately can a small crowd keep truck presence and line lengths up to date?  
2. Does reliability-based aggregation outperform simple majority voting?  
3. Is there enough perceived value among Penn students to justify further development?

**Comparisons**:

- [x] Compare crowd vs. expert performance (team’s on-the-ground checks).  
- [x] Compare crowd vs. automated baseline (e.g., naive “scheduled hours only” status).  
- [x] Compare different aggregation methods (simple majority vs. reliability-weighted).  
- [ ] Analyze cost/quality tradeoffs if external crowd is used.

**Data for analysis**:

- All raw submissions (with timestamps and worker IDs).  
- QC outputs (pass/fail, reliability, flags).  
- Aggregated truck statuses over time.  
- Ground-truth checks from the team.  
- Survey responses and click metrics.

**Analysis methods**:

- Confusion matrices for presence and line categories.  
- Accuracy and F1 scores comparing methods.  
- Plots of confidence vs. accuracy to see calibration.  
- Descriptive stats and bar charts for survey responses.

---

## Ethical Considerations

### Worker Treatment

**Fair compensation**:  
- For external crowd: keep effective hourly rate at or above ~\$12/hour based on pilot timing.  
- For local students: tasks are voluntary and quick, with intrinsic benefit and optional small raffle.

**Informed consent**:  
- Explain in task description what LocustGrub is, how their contributions will be used, and that their data will be anonymized.  

**Rejection policy**:  
- Only reject work that is clearly spam (nonsense answers, repeated failures on gold checks).  
- When possible, provide feedback or annotate reasons internally.

### Data Ethics

**Privacy**:  
- No personal identifiers beyond worker IDs; no facial recognition or storage of identifiable student faces (we will avoid zooming on people).  
- For photos, we store only what’s necessary and avoid linking to specific individuals.

**Consent**:  
- Participation is voluntary; external workers accept the HIT with clear terms.  
- Local students will see a short explanation page before contributing.

**Data storage**:  
- Hosted DB with restricted access (team only).  
- No public raw data dumps that could reveal patterns about individuals.

### Potential Harms

**Misuse**:  
- In theory, truck competitors could game the system (e.g., false negatives). Our QC/reliability mitigates this somewhat.  

**Possible harm**:  
- Overcrowding certain trucks because of better visibility.  
- Photos unintentionally capturing bystanders.

**Mitigation**:  
- Encourage balanced usage and emphasize that data is approximate.  
- Avoid sharing raw photos publicly; use them only for internal QC and external labeling.

---

## Documentation Standards

### Code Documentation

**Each module must include**:
- Function/class docstrings describing purpose and input/output.  
- README per major directory describing usage and design decisions.  
- Simple example scripts for running QC and aggregation on sample data.

**Current documentation status**:
- [ ] QC module: Not yet documented (will add docstrings and README with sample scenario).  
- [ ] Aggregation module: Not yet documented (planned alongside implementation).  
- [ ] Other modules:
  - Frontend: TBD – at least component-level comments and high-level README.  
  - Backend: TBD – API endpoints documented in a simple API spec.

### Repository README

**Main README.md will include**:

- [ ] Project overview and goals  
- [ ] Setup instructions (install, run frontend/backend)  
- [ ] How to run QC and aggregation modules on sample data  
- [ ] Data format and schema descriptions  
- [ ] Where to find docs, flow diagrams, and mockups  
- [ ] Team contacts and license

### Ongoing Documentation

**Process for keeping docs current**:

- Update README sections when adding or changing endpoints or data formats.  
- Require at least minimal docstrings on new functions in PRs.  
- Keep a simple CHANGELOG in the repo highlighting major changes.

---

## Questions for Teaching Staff

### Technical Questions

1. Is it acceptable if QC and aggregation logic are prototyped in Python notebooks first and later ported (partially) to Node for integration?  
2. Are there recommended patterns/examples from previous cohorts for reliability-weighted majority voting that we can reference?  
3. Any constraints on using free tiers of services like Mapbox (API keys, privacy) for a class project?

### Scope Questions

1. Is our 20-point component allocation reasonable, or should we downscope any piece?  
2. For evaluation, is focusing accuracy on a subset of “ground-truthed” trucks sufficient?  
3. Is it okay if the admin dashboard is minimal (table-based) as long as QC and aggregation are solid?

### Resource Questions

1. Is there departmental funding or Amazon credits available for a small MTurk pilot (under \$50)?  
2. Do you have guidance on IRB or informal ethics approval for using student volunteers and photos of public spaces?

### Other Concerns

- Are there any campus-specific policies about photographing food trucks or public walkways that we should be aware of?

---

## Commitment

**We commit to**:

- [x] Building a working prototype with functional QC and aggregation modules  
- [x] Creating comprehensive documentation in our GitHub repository  
- [x] Recruiting and managing a real crowd (or simulated crowd if absolutely necessary)  
- [x] Collecting sufficient data for meaningful analysis  
- [x] Meeting project milestones on schedule  
- [x] Communicating proactively if we encounter blockers  
- [x] Treating crowd workers ethically and fairly

**Team signatures**:

- Nico Marquez, 11/13/2025  
- _________________________ [TBD 2], [Date]  
- _________________________ [TBD 3], [Date]  
- _________________________ [TBD 4], [Date]

---

## Submission Checklist

This submission **is a working document**. We may refine diagrams and sample data, which is **acceptable**.

Before submitting this proposal, we will verify that we have:

- [x] Completed all sections of this template  
- [x] Provided team availability for TA meetings  
- [x] Listed team skills and learning needs  
- [x] Included point values for all components (total 15–20)  
- [x] Described a detailed implementation timeline  
- [x] Identified risks and mitigation strategies  
- [ ] Had all team members review and sign

Then:

- [ ] Set up GitHub repository with required directory structure  
- [ ] Prepared questions for teaching staff  
- [ ] Created flow diagram showing QC and aggregation modules  
- [ ] Created mockups for all user-facing interfaces  
- [ ] Added sample input/output data for QC module  
- [ ] Added sample input/output data for aggregation module

**Submission method**:  
- Multiple successive submissions are allowed to iterate on this proposal.  
- Pull request to `ideation-fall-2025` repository, in `round5_final` folder.  
- File should be in the root of the LocustGrub GitHub organization.

**Submission deadline**: Thursday, Nov. 13 at 11:59 PM ET
