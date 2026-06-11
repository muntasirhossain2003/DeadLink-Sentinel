'use client';

import { useEffect, useRef, useState } from 'react';
import type { Scan, Page, LinkCheck } from '@deadlink-sentinel/db';

type FullScan = Scan & {
  site: { name: string; rootUrl: string };
  linkChecks: LinkCheck[];
  pages: Page[];
};

interface Props {
  scan: FullScan;
}

export function ScanResultsView({ scan }: Props) {
  const [status, setStatus] = useState(scan.status);
  const [pagesCrawled, setPagesCrawled] = useState(scan.pagesCrawled);
  const [healthScore, setHealthScore] = useState(scan.healthScore);
  const [liveMessages, setLiveMessages] = useState<string[]>([]);
  const esRef = useRef<EventSource | null>(null);
  const isLive = status === 'QUEUED' || status === 'RUNNING';

  useEffect(() => {
    if (!isLive) return;

    const es = new EventSource(`/api/scans/${scan.id}/events`);
    esRef.current = es;

    es.onmessage = (e) => {
      const event = JSON.parse(e.data as string) as Record<string, unknown>;
      const type = event['type'] as string;

      if (type === 'PAGE_CRAWLED') {
        setPagesCrawled(event['pagesCrawled'] as number);
        setLiveMessages((prev) => [
          `Crawled: ${event['url'] as string}`,
          ...prev.slice(0, 49),
        ]);
      } else if (type === 'SCAN_COMPLETED') {
        setStatus('COMPLETED');
        setHealthScore(event['healthScore'] as number);
        es.close();
      } else if (type === 'SCAN_FAILED') {
        setStatus('FAILED');
        es.close();
      }
    };

    return () => es.close();
  }, [scan.id, isLive]);

  const broken = scan.linkChecks.filter((l) => l.result === 'BROKEN');
  const brokenAnchors = scan.linkChecks.filter((l) => l.result === 'BROKEN_ANCHOR');
  const redirects = scan.linkChecks.filter((l) => l.result === 'REDIRECT');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">{scan.site.name}</h1>
          <p className="mt-1 font-mono text-xs text-fog">{scan.site.rootUrl}</p>
        </div>
        {healthScore != null && (
          <div className="text-right">
            <div
              className={`font-display text-5xl font-black ${
                healthScore >= 80 ? 'text-sonar' : healthScore >= 60 ? 'text-amber' : 'text-coral'
              }`}
            >
              {healthScore}
            </div>
            <div className="font-mono text-[11px] uppercase tracking-[.3em] text-[#5C7589]">health score</div>
          </div>
        )}
      </div>

      {/* Live progress */}
      {isLive && (
        <div className="rounded-2xl border border-sonar/30 bg-abyss-2/50 p-6">
          <div className="mb-4 flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-sonar shadow-[0_0_8px_rgba(43,217,194,.8)] [animation:pulse_1.5s_ease_infinite]" />
            <span className="font-mono text-xs text-sonar">
              scanning · {pagesCrawled} pages crawled
            </span>
          </div>
          <div className="max-h-48 overflow-y-auto space-y-1">
            {liveMessages.map((msg, i) => (
              <p key={i} className="font-mono text-[11px] text-fog">{msg}</p>
            ))}
          </div>
          <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
        </div>
      )}

      {/* Stats row */}
      {status === 'COMPLETED' && (
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Pages crawled', value: pagesCrawled, colour: 'text-snow' },
            { label: 'Broken links', value: broken.length, colour: broken.length > 0 ? 'text-coral' : 'text-sonar' },
            { label: 'Broken anchors', value: brokenAnchors.length, colour: brokenAnchors.length > 0 ? 'text-coral' : 'text-sonar' },
            { label: 'Redirect chains', value: redirects.length, colour: redirects.length > 0 ? 'text-amber' : 'text-sonar' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-snow/[.08] bg-abyss-2/50 p-4 text-center">
              <div className={`font-display text-3xl font-black ${stat.colour}`}>{stat.value}</div>
              <div className="mt-1 font-mono text-[11px] text-fog">{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Issues table */}
      {broken.length > 0 && (
        <section>
          <h2 className="mb-4 font-display text-lg font-bold">Broken links</h2>
          <div className="overflow-hidden rounded-xl border border-snow/[.08]">
            <table className="w-full">
              <thead className="border-b border-snow/[.08] bg-abyss-2/60">
                <tr className="font-mono text-[11px] uppercase tracking-[.1em] text-fog">
                  <th className="px-4 py-3 text-left">Target URL</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-snow/[.05]">
                {broken.map((l) => (
                  <tr key={l.id} className="font-mono text-[12px]">
                    <td className="px-4 py-3 text-coral">{l.targetUrl}</td>
                    <td className="px-4 py-3 text-coral">{l.httpStatus ?? 'ERR'}</td>
                    <td className="px-4 py-3 text-fog truncate max-w-[240px]">{scan.pages.find((p) => p.id === l.sourcePageId)?.url ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {brokenAnchors.length > 0 && (
        <section>
          <h2 className="mb-4 font-display text-lg font-bold">Broken anchors</h2>
          <div className="overflow-hidden rounded-xl border border-snow/[.08]">
            <table className="w-full">
              <thead className="border-b border-snow/[.08] bg-abyss-2/60">
                <tr className="font-mono text-[11px] uppercase tracking-[.1em] text-fog">
                  <th className="px-4 py-3 text-left">URL</th>
                  <th className="px-4 py-3 text-left">Missing fragment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-snow/[.05]">
                {brokenAnchors.map((l) => (
                  <tr key={l.id} className="font-mono text-[12px]">
                    <td className="px-4 py-3 text-fog truncate max-w-[300px]">{l.targetUrl}</td>
                    <td className="px-4 py-3 text-coral">{l.errorDetail ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
