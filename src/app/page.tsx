"use client";

import { useState } from "react";

export default function HomePage() {
  const [originalUrl, setOriginalUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [goLiveAt, setGoLiveAt] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [maxClicks, setMaxClicks] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [result, setResult] = useState<{ slug: string; shortUrl: string } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleSubmit() {
    setError("");
    setResult(null);
    setLoading(true);

    if (!originalUrl) {
      setError("Please enter a URL.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalUrl,
          alias: alias || undefined,
          goLiveAt: goLiveAt || undefined,
          expiresAt: expiresAt || undefined,
          maxClicks: maxClicks || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
      } else {
        setResult(data);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    if (!result) return;
    navigator.clipboard.writeText(result.shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <main className="min-h-screen bg-[#0F1623] text-white flex flex-col items-center justify-center px-4">
      
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-white">
          FL<span className="text-[#4F46E5]">cut</span>
        </h1>
        <p className="text-[#8892A4] mt-2 text-sm">
          Shorten. Schedule. Track.
        </p>
      </div>

      {/* Card */}
      <div className="w-full max-w-lg bg-[#151D2E] rounded-2xl p-6 shadow-xl border border-white/5">

        {/* URL Input */}
        <label className="text-xs text-[#8892A4] uppercase tracking-widest mb-1 block">
          Paste your long URL
        </label>
        <input
          type="url"
          placeholder="https://example.com/very/long/link"
          value={originalUrl}
          onChange={(e) => setOriginalUrl(e.target.value)}
          className="w-full bg-[#0F1623] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-[#8892A4] focus:outline-none focus:border-[#4F46E5] transition mb-4"
        />

        {/* Advanced Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-xs text-[#4F46E5] mb-4 hover:underline"
        >
          {showAdvanced ? "− Hide options" : "+ Scheduling, alias & caps"}
        </button>
        </div>

        {/* Advanced Options */}
        {showAdvanced && (
          <div className="space-y-3 mb-4">

            <div>
              <label className="text-xs text-[#8892A4] uppercase tracking-widest mb-1 block">
                Custom alias (optional)
              </label>
              <div className="flex items-center bg-[#0F1623] border border-white/10 rounded-lg px-4 py-3">
                <span className="text-[#8892A4] text-sm mr-1">flcut.app/</span>
                <input
                  type="text"
                  placeholder="my-link"
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-white placeholder-[#8892A4] focus:outline-none"
                />
              </div>
         </div>

            <div>
              <label className="text-xs text-[#8892A4] uppercase tracking-widest mb-1 block">
                Go live at (optional)
              </label>
              <input
                type="datetime-local"
                value={goLiveAt}
                onChange={(e) => setGoLiveAt(e.target.value)}
                className="w-full bg-[#0F1623] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#4F46E5] transition"
              />
            </div>

            <div>
              <label className="text-xs text-[#8892A4] uppercase tracking-widest mb-1 block">
                Expires at (optional)
              </label>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full bg-[#0F1623] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#4F46E5] transition"
              />
            </div>

            <div>
              <label className="text-xs text-[#8892A4] uppercase tracking-widest mb-1 block">
                Max clicks / registrations (optional)
              </label>
              <input
                type="number"
                placeholder="e.g. 100"
                value={maxClicks}
                onChange={(e) => setMaxClicks(e.target.value)}
                className="w-full bg-[#0F1623] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-[#8892A4] focus:outline-none focus:border-[#4F46E5] transition"
              />
            </div>

          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-red-400 text-sm mb-3">{error}</p>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-[#4F46E5] hover:bg-[#4338CA] transition rounded-lg py-3 text-sm font-semibold disabled:opacity-50"
        >
          {loading ? "Shortening..." : "Shorten →"}
        </button>

        {/* Result */}
        {result && (
             <div className="mt-5 bg-[#0F1623] border border-[#4F46E5]/40 rounded-lg px-4 py-4 flex items-center justify-between">
             <div>
               <p className="text-xs text-[#8892A4] mb-1">Your short link</p>

             <a
                href={result.shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#4F46E5] font-medium text-sm hover:underline"
              >
              {result.shortUrl}
             </a>
             </div>

    <div className="flex gap-2">
      <button
        onClick={handleCopy}
        className="text-xs bg-white/5 hover:bg-white/10 transition px-3 py-2 rounded-lg"
      >
        {copied ? "Copied!" : "Copy"}
      </button>

      <a
        href={`/dashboard?slug=${result.slug}`}
        className="text-xs bg-[#4F46E5]/20 hover:bg-[#4F46E5]/30 transition px-3 py-2 rounded-lg text-[#4F46E5]"
      >
        Analytics →
      </a>
    </div>
  </div>
)}</main>
)}