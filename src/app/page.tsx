import Link from "next/link";

import { TruckBoard } from "@/components/truck-board";
import { getTruckStatuses } from "@/lib/truck-service";
import { buildGoogleMapsUrl, isWithinPennCampus } from "@/lib/truck-utils";

export const dynamic = "force-dynamic";

export default async function Home() {
  const trucks = await getTruckStatuses();
  const campusCount = trucks.filter((truck) =>
    isWithinPennCampus(truck.lat, truck.lng),
  ).length;
  const statHighlights = [
    { label: "Active trucks", value: trucks.length, helper: "Seeded & verified" },
    { label: "Campus core", value: campusCount, helper: "Within Locust radius" },
  ];
  const trendingTrucks = [...trucks]
    .filter((truck) => typeof truck.rating === "number")
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-transparent">
      <main className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-10 sm:px-6 lg:px-8">
        <section className="relative overflow-hidden rounded-[40px] border border-white/40 bg-white/80 p-8 shadow-2xl shadow-emerald-100/40 backdrop-blur">
          <div
            className="pointer-events-none absolute inset-0 -z-10 opacity-60"
            aria-hidden="true"
          >
            <div className="absolute -left-16 top-0 h-40 w-40 rounded-full bg-emerald-200 blur-3xl" />
            <div className="absolute right-0 top-8 h-32 w-32 rounded-full bg-sky-200 blur-3xl" />
          </div>
          <nav className="flex flex-col gap-4 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-lg font-semibold text-white">
                LG
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
                  LocustGrub
                </p>
                <p className="text-sm font-semibold text-slate-900">
                  Penn food truck radar
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/map"
                className="rounded-full border border-slate-200/80 px-4 py-1.5 font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
              >
                Live map
              </Link>
              <Link
                href="/leaderboard"
                className="rounded-full border border-slate-200/80 px-4 py-1.5 font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
              >
                Leaderboard
              </Link>
              <Link
                href="/admin"
                className="rounded-full border border-slate-900 px-4 py-1.5 font-semibold text-slate-900 transition hover:bg-slate-900 hover:text-white"
              >
                Admin
              </Link>
            </div>
          </nav>

          <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-500">
                Real-time status · 30 min window
              </p>
              <h1 className="mt-3 text-4xl font-semibold text-slate-900 sm:text-5xl">
                Know which trucks are actually serving before you leave class.
              </h1>
              <p className="mt-4 max-w-2xl text-lg text-slate-600">
                Students seed the roster, then keep it fresh with verified check-ins,
                line updates, and quick quotes. Majority vote + recency rules power
                every badge you&apos;ll see below.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="#truck-board"
                  className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/30 transition hover:bg-slate-800"
                >
                  Browse trucks
                  <span aria-hidden="true">→</span>
                </Link>
                <Link
                  href="/map"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
                >
                  Open live map
                  <span aria-hidden="true">↗</span>
                </Link>
              </div>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {statHighlights.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-slate-100 bg-white/90 p-4 text-slate-900 shadow-sm"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                      {stat.label}
                    </p>
                    <p className="mt-2 text-3xl font-semibold">{stat.value}</p>
                    <p className="text-sm text-slate-500">{stat.helper}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-5 shadow-lg shadow-slate-900/10">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                Trending trucks
              </p>
              <h2 className="mt-2 text-xl font-semibold text-slate-900">
                Campus favorites right now
              </h2>
              <p className="text-sm text-slate-500">
                Pulled from live ratings and recent check-ins.
              </p>
              <div className="mt-5 space-y-4">
                {trendingTrucks.map((truck) => (
                  <div
                    key={truck.id}
                    className="flex items-start justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {truck.name}
                      </p>
                      <p className="text-xs text-slate-500">{truck.cuisine}</p>
                      {truck.quote && (
                        <p className="mt-1 text-xs text-slate-500">“{truck.quote}”</p>
                      )}
                    </div>
                    <div className="text-right">
                      {truck.rating && (
                        <p className="text-sm font-semibold text-amber-600">
                          ★ {truck.rating.toFixed(1)}
                        </p>
                      )}
                      {truck.reviewCount && (
                        <p className="text-xs text-slate-400">
                          {truck.reviewCount} reviews
                        </p>
                      )}
                      <a
                        href={buildGoogleMapsUrl(truck)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-slate-600 underline decoration-dotted hover:text-slate-900"
                      >
                        Map <span aria-hidden="true">↗</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <TruckBoard initialTrucks={trucks} />

        <section className="grid gap-6 rounded-3xl border border-slate-200/80 bg-white/95 p-6 text-sm text-slate-600 shadow-lg shadow-slate-900/5 md:grid-cols-3">
          {[
            {
              title: "How contributions flow",
              body:
                "Every check-in is rate-limited, lightly QC'd, and then rolled up with majority votes plus a 30-minute freshness window.",
            },
            {
              title: "What the badges mean",
              body:
                "“Verified here” means present votes outnumber absent ones. Line length + freshness use the most recent trusted submissions.",
            },
            {
              title: "Want to help?",
              body:
                "Tap any “Check in” button while you're on campus. 20–30 solid submissions keep trucks honest and power the engagement leaderboard.",
            },
          ].map((card) => (
            <article key={card.title} className="space-y-2">
              <h3 className="text-base font-semibold text-slate-900">
                {card.title}
              </h3>
              <p>{card.body}</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
