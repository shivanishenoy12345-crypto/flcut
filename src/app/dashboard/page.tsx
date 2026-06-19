"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

type Analytics = {
  link: {
    slug: string;
    originalUrl: string;
    createdAt: string;
    goLiveAt: string | null;
    expiresAt: string | null;
    maxClicks: number | null;
  };
  analytics: {
    totalClicks: number;
    uniqueClicks: number;
    byReferrer: Record<string, number>;
    byDevice: Record<string, number>;
    byCountry: Record<string, number>;
    byHour: Record<number, number>;
    byDate: Record<string, number>;
  };
};

function Dashboard() {
  const searchParams = useSearchParams();
  const slugFromUrl = searchParams.get("slug") || "";

  const [slug, setSlug] = useState(slugFromUrl);
  const [input, setInput] = useState(slugFromUrl);
  const [data, setData] = useState<Analytics | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (slugFromUrl) fetchAnalytics(slugFromUrl);
  }, [slugFromUrl]);

  async function fetchAnalytics(s: string) {
    setError("");
    setData(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics/${s}`);
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Link not found.");
      } else {
        setData(json);
        setSlug(s);
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleSearch() {
    if (!input.trim()) return;
    fetchAnalytics(input.trim());
  }

  const peakHour = data
    ? Object.entries(data.analytics.byHour).sort((a, b) => b[1] - a[1])[0]
    : null;

  return (
    <main className="min-h-screen bg-[#0F1623] text-white px-4 py-12">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <a href="/" className="text-[#4F46E5] text-sm hover:underline">
            ← Back to FLcut
          </a>
          <h1 className="text-4xl font-bold mt-4">
            Analytics
          </h1>
          <p className="text-[#8892A4] text-sm mt-1">
            Enter a short link slug to see its stats.
          </p>
        </div>

        {/* Slug Search */}
        <div className="flex gap-2 mb-10">
          <input
            type="text"
            placeholder="Enter slug e.g. aB3xYz"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="flex-1 bg-[#151D2E] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-[#8892A4] focus:outline-none focus:border-[#4F46E5] transition"
          />
          <button
            onClick={handleSearch}
            className="bg-[#4F46E5] hover:bg-[#4338CA] transition px-5 py-3 rounded-lg text-sm font-semibold"
          >
            Search
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <p className="text-[#8892A4] text-sm">Loading...</p>
        )}

        {/* Error */}
        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}

        {/* Results */}
        {data && (
          <div className="space-y-6">

            {/* Link Info */}
            <div className="bg-[#151D2E] rounded-2xl p-5 border border-white/5">
              <p className="text-xs text-[#8892A4] uppercase tracking-widest mb-1">
                Short link
              </p>
              <p className="text-[#4F46E5] font-medium">
                {process.env.NEXT_PUBLIC_BASE_URL}/{slug}
              </p>
              <p className="text-xs text-[#8892A4] mt-2 break-all">
                → {data.link.originalUrl}
              </p>
              <div className="flex gap-6 mt-4 text-xs text-[#8892A4]">
                <span>Created: {new Date(data.link.createdAt).toLocaleDateString()}</span>
                {data.link.goLiveAt && (
                  <span>Live: {new Date(data.link.goLiveAt).toLocaleDateString()}</span>
                )}
                {data.link.expiresAt && (
                  <span>Expires: {new Date(data.link.expiresAt).toLocaleDateString()}</span>
                )}
                {data.link.maxClicks && (
                  <span>Cap: {data.link.maxClicks} clicks</span>
                )}
              </div>
            </div>

            {/* Top Stats */}
            <div className="grid grid-cols-3 gap-4">
              <StatCard
                label="Total Clicks"
                value={data.analytics.totalClicks}
              />
              <StatCard
                label="Unique Clicks"
                value={data.analytics.uniqueClicks}
              />
              <StatCard
                label="Peak Hour"
                value={peakHour ? `${peakHour[0]}:00` : "—"}
              />
            </div>

            {/* By Device */}
            <BreakdownCard
              title="By Device"
              data={data.analytics.byDevice}
              total={data.analytics.totalClicks}
            />

            {/* By Referrer */}
            <BreakdownCard
              title="By Referrer"
              data={data.analytics.byReferrer}
              total={data.analytics.totalClicks}
            />

            {/* By Country */}
            <BreakdownCard
              title="By Country"
              data={data.analytics.byCountry}
              total={data.analytics.totalClicks}
            />

            {/* Clicks by Hour */}
            <div className="bg-[#151D2E] rounded-2xl p-5 border border-white/5">
              <p className="text-xs text-[#8892A4] uppercase tracking-widest mb-4">
                Clicks by Hour
              </p>
              <div className="flex items-end gap-1 h-24">
                {Array.from({ length: 24 }, (_, i) => {
                  const count = data.analytics.byHour[i] || 0;
                  const max = Math.max(...Object.values(data.analytics.byHour), 1);
                  const height = Math.round((count / max) * 100);
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full bg-[#4F46E5] rounded-sm transition-all"
                        style={{ height: `${height}%`, minHeight: count > 0 ? "4px" : "0" }}
                        title={`${i}:00 — ${count} clicks`}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between text-[10px] text-[#8892A4] mt-1">
                <span>12am</span>
                <span>6am</span>
                <span>12pm</span>
                <span>6pm</span>
                <span>11pm</span>
              </div>
            </div>

            {/* Clicks Over Time */}
            <div className="bg-[#151D2E] rounded-2xl p-5 border border-white/5">
              <p className="text-xs text-[#8892A4] uppercase tracking-widest mb-4">
                Clicks Over Time
              </p>
              {Object.keys(data.analytics.byDate).length === 0 ? (
                <p className="text-[#8892A4] text-sm">No clicks yet.</p>
              ) : (
                <div className="space-y-2">
                  {Object.entries(data.analytics.byDate)
                    .sort((a, b) => a[0].localeCompare(b[0]))
                    .map(([date, count]) => {
                      const max = Math.max(...Object.values(data.analytics.byDate));
                      const width = Math.round((count / max) * 100);
                      return (
                        <div key={date} className="flex items-center gap-3 text-sm">
                          <span className="text-[#8892A4] text-xs w-24 shrink-0">
                            {date}
                          </span>
                          <div className="flex-1 bg-white/5 rounded-full h-2">
                            <div
                              className="bg-[#4F46E5] h-2 rounded-full"
                              style={{ width: `${width}%` }}
                            />
                          </div>
                          <span className="text-xs text-white w-6 text-right">
                            {count}
                          </span>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </main>
  );
}

// ── Sub Components ─────────────────────────────────────────

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-[#151D2E] rounded-2xl p-5 border border-white/5 text-center">
      <p className="text-3xl font-bold text-white">{value}</p>
      <p className="text-xs text-[#8892A4] mt-1 uppercase tracking-widest">
        {label}
      </p>
    </div>
  );
}

function BreakdownCard({
  title,
  data,
  total,
}: {
  title: string;
  data: Record<string, number>;
  total: number;
}) {
  const sorted = Object.entries(data).sort((a, b) => b[1] - a[1]);

  return (
    <div className="bg-[#151D2E] rounded-2xl p-5 border border-white/5">
      <p className="text-xs text-[#8892A4] uppercase tracking-widest mb-4">
        {title}
      </p>
      {sorted.length === 0 ? (
        <p className="text-[#8892A4] text-sm">No data yet.</p>
      ) : (
        <div className="space-y-3">
          {sorted.map(([key, count]) => {
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div key={key} className="flex items-center gap-3 text-sm">
                <span className="text-white w-28 truncate shrink-0">{key}</span>
                <div className="flex-1 bg-white/5 rounded-full h-2">
                  <div
                    className="bg-[#4F46E5] h-2 rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs text-[#8892A4] w-12 text-right">
                  {count} ({pct}%)
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Suspense wrapper needed for useSearchParams
export default function DashboardPage() {
  return (
    <Suspense>
      <Dashboard />
    </Suspense>
  );
}