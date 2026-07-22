"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type SourceCount = {
  tag: string;
  label: string;
  count: number;
};

type ApiResult = {
  sources: SourceCount[];
  totalContacts: number;
  matchedContacts: number;
  generatedAt: string;
  prefix: string;
};

export default function Home() {
  const [data, setData] = useState<ApiResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/referral-sources", { cache: "no-store" });
      const body = (await response.json()) as ApiResult & { error?: string };

      if (!response.ok) {
        throw new Error(body.error || "Unable to load referral-source data.");
      }

      setData(body);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load referral-source data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const maximum = useMemo(
    () => Math.max(1, ...(data?.sources.map((source) => source.count) ?? [1])),
    [data]
  );

  return (
    <main className="widget-shell">
      <header className="widget-header">
        <div>
          <h1>Leads by Referral Source</h1>
          <p>Year-to-Date {new Date().getFullYear()}.</p>
        </div>
        <button type="button" onClick={() => void loadData()} disabled={loading}>
          {loading ? "Loading…" : "Refresh"}
        </button>
      </header>

      {error && (
        <section className="notice error" role="alert">
          <strong>The widget could not load.</strong>
          <span>{error}</span>
        </section>
      )}

      {loading && !data && <section className="notice">Loading referral-source data…</section>}

      {!loading && data && data.sources.length === 0 && (
        <section className="notice">
          No contacts were found with tags beginning with <code>{data.prefix}</code>.
        </section>
      )}

      {data && data.sources.length > 0 && (
        <section className="chart" aria-label="Referral source bar chart">
          {data.sources.map((source) => {
            const width = Math.max(3, (source.count / maximum) * 100);
            return (
              <div className="bar-row" key={source.tag}>
                <div className="bar-label" title={source.label}>{source.label}</div>
                <div className="bar-track" aria-hidden="true">
                  <div className="bar-fill" style={{ width: `${width}%` }} />
                </div>
                <div className="bar-value">{source.count}</div>
              </div>
            );
          })}
        </section>
      )}

      {data && (
        <footer>
          <span>{data.matchedContacts} contacts with referral-source tags</span>
          <span>Updated {new Date(data.generatedAt).toLocaleString()}</span>
        </footer>
      )}
    </main>
  );
}
