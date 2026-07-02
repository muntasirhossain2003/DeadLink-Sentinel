import type { ScanStatus } from '@deadlink-sentinel/db';

const STYLES: Record<ScanStatus, { dot: string; text: string }> = {
  COMPLETED: { dot: 'bg-sonar', text: 'text-sonar' },
  RUNNING: { dot: 'bg-amber animate-pulse', text: 'text-amber' },
  QUEUED: { dot: 'bg-amber', text: 'text-amber' },
  FAILED: { dot: 'bg-coral', text: 'text-coral' },
  CANCELLED: { dot: 'bg-fog', text: 'text-fog' },
};

export function StatusPill({ status }: { status: ScanStatus }) {
  const s = STYLES[status];
  return (
    <span className={`inline-flex items-center gap-1.5 font-mono text-xs ${s.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} aria-hidden />
      {status.toLowerCase()}
    </span>
  );
}
