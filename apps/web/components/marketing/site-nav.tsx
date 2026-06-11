import Link from 'next/link';

export function SiteNav() {
  return (
    <nav className="fixed left-0 right-0 top-0 z-10 flex items-center justify-between px-10 py-[22px]">
      <div className="flex items-center gap-[11px] font-display text-base font-extrabold tracking-[.01em]">
        <span className="relative h-[30px] w-[30px] flex-none rounded-full border-2 border-sonar">
          <span
            className="absolute left-1/2 top-1/2 h-3 w-0.5 -translate-x-1/2 origin-top bg-sonar"
            style={{ animation: 'hand 3s linear infinite' }}
            aria-hidden="true"
          />
        </span>
        DEADLINK SENTINEL
      </div>

      <Link
        href="#cta"
        className="rounded-full border border-snow/25 px-[22px] py-[10px] font-mono text-[13.5px] font-medium text-snow transition-all duration-300 hover:border-sonar hover:text-sonar hover:shadow-[0_0_24px_rgba(43,217,194,.25)]"
      >
        start_scan()
      </Link>

      <style>{`@keyframes hand{to{transform:translateX(-50%) rotate(360deg)}}`}</style>
    </nav>
  );
}
