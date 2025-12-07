import Link from "next/link";

import { getTruckStatuses } from "@/lib/truck-service";
import { getCheckins } from "@/lib/store";
import { buildGoogleMapsUrl } from "@/lib/truck-utils";

export const dynamic = "force-dynamic";

async function buildTopTrucks(): Promise<
  Array<
    Awaited<ReturnType<typeof getTruckStatuses>>[number] & {
      avgRating: number | null;
      reviewCount: number;
      recentComments: {
        id: string;
        text: string;
        rating?: number;
        createdAt: string;
      }[];
    }
  >
> {
  const [statuses, checkins] = await Promise.all([
    getTruckStatuses(),
    getCheckins({ minutes: 60 * 24 }),
  ]);

  return statuses
    .map((truck) => {
      const truckReviews = checkins.filter(
        (review) => review.truckId === truck.id,
      );
      const rated = truckReviews.filter(
        (review) => typeof review.rating === "number" && review.rating,
      );
      const avgRating =
        rated.length > 0
          ? rated.reduce((sum, review) => sum + (review.rating ?? 0), 0) /
            rated.length
          : null;

      const recentComments = truckReviews
        .filter((review) => review.comment)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 3)
        .map((item) => ({
          id: item.id,
          text: item.comment!,
          rating: item.rating,
          createdAt: item.createdAt,
        }));

      return {
        ...truck,
        avgRating,
        reviewCount: truckReviews.length,
        recentComments,
      };
    })
    .sort((a, b) => {
      const ratingDiff =
        (b.avgRating ?? 0) - (a.avgRating ?? 0);
      if (ratingDiff !== 0) return ratingDiff;
      return b.reviewCount - a.reviewCount;
    });
}

export default async function TopPage() {
  const topTrucks = await buildTopTrucks();

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-100 p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
            Top trucks
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900 sm:text-4xl">
            Best-reviewed trucks in the last 24 hours
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-slate-600">
            Rankings blend recent average ratings, number of check-ins, and
            whether the truck is currently verified on campus.
          </p>
        </header>

        <ol className="mt-8 space-y-6">
          {topTrucks.map((truck, index) => (
            <li
              key={truck.id}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    #{index + 1}
                  </p>
                  <h2 className="text-2xl font-semibold text-slate-900">
                    {truck.name}
                  </h2>
                  <p className="text-sm text-slate-500">{truck.cuisine}</p>
                </div>
                <div className="flex gap-4 text-sm">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Avg. rating
                    </p>
                    <p className="text-lg font-semibold text-slate-900">
                      {truck.avgRating ? `${truck.avgRating.toFixed(1)}★` : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Reviews (24h)
                    </p>
                    <p className="text-lg font-semibold text-slate-900">
                      {truck.reviewCount}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Status
                    </p>
                    <p className="text-lg font-semibold text-slate-900">
                      {truck.status === "present"
                        ? "Verified"
                        : truck.status === "absent"
                          ? "Away"
                          : "Unknown"}
                    </p>
                  </div>
                </div>
              </div>

              {truck.recentComments.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {truck.recentComments.map((review) => (
                    <blockquote
                      key={review.id}
                      className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700"
                    >
                      <p>“{review.text}”</p>
                      <footer className="mt-2 flex items-center justify-between text-xs text-slate-500">
                        <span>
                          {review.rating ? `${review.rating}★` : "Unrated"}
                        </span>
                        <span>
                          {new Date(review.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </footer>
                    </blockquote>
                  ))}
                </div>
              ) : (
                <p className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                  No written reviews yet. Be the first to add one from the main
                  page.
                </p>
              )}

              <div className="mt-4 flex flex-wrap gap-3">
                <a
                  href={buildGoogleMapsUrl(truck)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-slate-300 px-4 py-1.5 text-sm font-semibold text-slate-800 transition hover:border-slate-900 hover:text-slate-900"
                >
                  Directions
                </a>
                <Link
                  href="/"
                  className="rounded-full bg-slate-900 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Leave a review
                </Link>
              </div>
            </li>
          ))}
        </ol>
      </main>
    </div>
  );
}

