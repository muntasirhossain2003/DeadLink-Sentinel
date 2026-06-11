'use client';

import { useEffect, useRef, useState } from 'react';
import type { ScanProgressEvent } from '@deadlink-sentinel/shared';

interface Props {
  url: string;
}

type Phase = 'idle' | 'scanning' | 'done' | 'error';

interface Result {
  healthScore: number;
  pagesCrawled: number;
}

export function DemoScanRunner({ url }: Props) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [progress, setProgress] = useState<string[]>([]);
  const [result, setResult] = useState<Result | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!url) return;

    async function kickoff() {
      setPhase('scanning');

      // POST to a demo-scan Server Action via a simple fetch wrapper.
      // The route validates URL, enforces IP rate-limit, and returns a scanId.
      const res = await fetch('/api/demo-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) {
        const { error } = await res.json() as { error: string };
        setErrorMsg(error ?? 'Could not start scan');
        setPhase('error');
        return;
      }

      const { scanId } = await res.json() as { scanId: string };

      const es = new EventSource(`/api/scans/${scanId}/events`);
      esRef.current = es;

      es.onmessage = (e) => {
        const event = JSON.parse(e.data as string) as ScanProgressEvent;

        if (event.type === 'PAGE_CRAWLED') {
          setProgress((prev) => [`Crawled: ${event.url}`, ...prev.slice(0, 29)]);
        } else if (event.type === 'SCAN_COMPLETED') {
          setResult({ healthScore: event.healthScore, pagesCrawled: event.pagesCrawled });
          setPhase('done');
          es.close();
        } else if (event.type === 'SCAN_FAILED') {
          setErrorMsg(event.errorMessage);
          setPhase('error');
          es.close();
        }
      };

      es.onerror = () => {
        setErrorMsg('Connection lost. Try again.');
        setPhase('error');
        es.close();
      };
    }

    void kickoff();
    return () => esRef.current?.close();
  }, [url]);

  if (!url) {
    return (
      <p className="text-center font-mono text-sm text-coral">No URL provided. Go back and enter a URL.</p>
    );
  }

  if (phase === 'error') {
    return (
      <div className="rounded-2xl border border-coral/30 bg-abyss-2/60 p-8 text-center">
        <p className="text-coral font-mono text-sm">{errorMsg}</p>
      </div>
    );
  }

  if (phase === 'done' && result) {
    const colour = result.healthScore >= 80 ? 'text-sonar' : result.healthScore >= 60 ? 'text-amber' : 'text-coral';
    return (
      <div className="rounded-2xl border border-sonar/30 bg-abyss-2/60 p-10 text-center">
        <div className={`font-display text-8xl font-black ${colour}`}>{result.healthScore}</div>
        <div className="mt-2 font-mono text-xs uppercase tracking-[.3em] text-[#5C7589]">health score</div>
        <p className="mt-6 text-fog">{result.pagesCrawled} pages scanned</p>
        <p className="mt-8 text-sm text-fog">
          Sign up to monitor continuously, view all issues, and get alerted when new ones appear.
        </p>
        <a
          href="/sign-in"
          className="mt-4 inline-block rounded-xl bg-sonar px-8 py-3 font-display text-sm font-bold text-abyss hover:shadow-[0_0_24px_rgba(43,217,194,.4)]"
        >
          Create free account →
        </a>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-sonar/30 bg-abyss-2/60 p-8">
      <div className="mb-4 flex items-center gap-3">
        <span className="h-2 w-2 rounded-full bg-sonar shadow-[0_0_8px_rgba(43,217,194,.8)] [animation:pulse_1.5s_ease_infinite]" />
        <span className="font-mono text-xs text-sonar">scanning {url}</span>
      </div>
      <div className="max-h-64 overflow-y-auto space-y-1">
        {progress.map((msg, i) => (
          <p key={i} className="font-mono text-[11px] text-fog">{msg}</p>
        ))}
        {progress.length === 0 && (
          <p className="font-mono text-[11px] text-[#5C7589]">Starting crawler…</p>
        )}
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
    </div>
  );
}
