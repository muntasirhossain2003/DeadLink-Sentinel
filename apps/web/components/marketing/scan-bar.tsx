'use client';

import { useRouter } from 'next/navigation';
import { useRef } from 'react';

export function ScanBar() {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function handleScan() {
    const url = inputRef.current?.value.trim();
    if (!url) return;
    // Sends user to the demo-scan results page; the actual scan starts there
    router.push(`/demo?url=${encodeURIComponent(url)}`);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleScan();
  }

  return (
    <div className="mx-auto flex w-[min(560px,92vw)] items-center gap-0 rounded-[14px] border border-sonar/30 bg-abyss-2/65 p-[7px] shadow-[0_0_0_1px_rgba(6,18,31,.4),0_20px_60px_rgba(0,0,0,.5),inset_0_0_30px_rgba(43,217,194,.04)] backdrop-blur-[14px]">
      <input
        ref={inputRef}
        type="url"
        placeholder="https://docs.yoursite.com"
        aria-label="Site URL to scan"
        onKeyDown={handleKeyDown}
        className="min-w-0 flex-1 bg-transparent px-4 py-3 font-mono text-[14.5px] text-snow placeholder-[#5C7589] focus:outline-none"
      />
      <button
        onClick={handleScan}
        className="whitespace-nowrap rounded-[9px] bg-sonar px-[26px] py-3 font-display text-sm font-bold tracking-[.01em] text-abyss transition-all duration-300 hover:-translate-y-px hover:shadow-[0_0_34px_rgba(43,217,194,.55)]"
      >
        SCAN FREE
      </button>
    </div>
  );
}
