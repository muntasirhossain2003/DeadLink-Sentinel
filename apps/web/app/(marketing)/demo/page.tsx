import { Suspense } from 'react';
import { DemoScanRunner } from '@/components/marketing/demo-scan-runner';

interface Props {
  searchParams: { url?: string };
}

export default function DemoPage({ searchParams }: Props) {
  const url = searchParams.url ?? '';
  return (
    <div className="mx-auto max-w-[900px] px-6 py-20">
      <div className="mb-10 text-center">
        <h1 className="font-display text-3xl font-black tracking-tight">Demo Scan</h1>
        <p className="mt-3 text-fog">Up to 25 pages · no account needed · 1 scan / IP / day</p>
      </div>
      <Suspense fallback={<p className="text-center font-mono text-sm text-fog">Starting scan…</p>}>
        <DemoScanRunner url={url} />
      </Suspense>
    </div>
  );
}
