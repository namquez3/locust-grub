import { listRecentCheckins } from "@/lib/truck-service";
import { trucks } from "@/data/trucks";
import { AdminContentWrapper } from "@/components/AdminContentWrapper";

const truckLookup = new Map(trucks.map((truck) => [truck.id, truck.name]));

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const submissions = await listRecentCheckins(100);

  return (
    <AdminContentWrapper>
      <div className="min-h-screen bg-slate-50">
        <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Internal view
          </p>
          <h1 className="text-3xl font-semibold text-slate-900">
            Submission log
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Most recent 100 check-ins. Use this to spot spam, copy into
            notebooks, or share data slices in the final report.
          </p>
        </header>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="grid grid-cols-8 gap-4 border-b border-slate-100 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <span>Truck</span>
            <span>Presence</span>
            <span>Line</span>
            <span>Rating</span>
            <span>Comment</span>
            <span>When</span>
            <span>Worker</span>
            <span>Raffle</span>
          </div>
          <div className="divide-y divide-slate-100">
            {submissions.length === 0 ? (
              <p className="px-4 py-6 text-sm text-slate-500">
                No submissions yet. Collect a few check-ins during lunch.
              </p>
            ) : (
              submissions.map((submission) => (
                <div
                  key={submission.id}
                  className="grid grid-cols-8 gap-4 px-4 py-3 text-sm text-slate-700"
                >
                  <span className="font-medium">
                    {truckLookup.get(submission.truckId) ?? submission.truckId}
                  </span>
                  <span className="capitalize">{submission.presence}</span>
                  <span className="capitalize">{submission.lineLength}</span>
                  <span className="font-mono text-xs text-slate-500">
                    {submission.rating ? `${submission.rating}★` : "—"}
                  </span>
                  <span className="truncate text-slate-500">
                    {submission.comment ?? "—"}
                  </span>
                  <span className="text-slate-500">
                    {submission.relativeMinutes === 0
                      ? "Just now"
                      : `${submission.relativeMinutes} min ago`}
                  </span>
                  <span className="font-mono text-xs text-slate-500">
                    {submission.workerId.slice(0, 8)}
                  </span>
                  <span className="font-mono text-xs text-slate-500">
                    {submission.enteredRaffle ? "Yes" : "No"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
        </main>
      </div>
    </AdminContentWrapper>
  );
}

