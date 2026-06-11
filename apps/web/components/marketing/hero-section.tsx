import { ScanBar } from './scan-bar';

export function HeroSection() {
  return (
    <header className="relative grid min-h-svh place-items-center px-6 pb-20 pt-[120px] text-center">
      {/* vignette overlays */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[1]"
        style={{
          background: `
            radial-gradient(1200px 700px at 70% 12%, rgba(43,217,194,.07), transparent 60%),
            radial-gradient(900px 600px at 12% 85%, rgba(255,92,69,.05), transparent 60%),
            linear-gradient(180deg, rgba(6,18,31,.25) 0%, rgba(6,18,31,0) 22%, rgba(6,18,31,0) 70%, rgba(6,18,31,.85) 100%)
          `,
        }}
      />

      <div className="relative z-[2]">
        {/* eyebrow */}
        <span className="mb-7 inline-flex items-center gap-[10px] font-mono text-xs uppercase tracking-[.28em] text-sonar before:h-px before:w-9 before:bg-gradient-to-r before:from-transparent before:to-sonar after:h-px after:w-9 after:bg-gradient-to-l after:from-transparent after:to-sonar">
          site health · sonar for your links
        </span>

        <h1
          className="font-display font-black tracking-[-0.035em] leading-[.98]"
          style={{ fontSize: 'clamp(46px,8.5vw,118px)' }}
        >
          THE WEB IS
          <br />
          <span className="text-snow/50 [-webkit-text-stroke:1.5px_rgba(239,246,251,0.5)] [color:transparent]">
            QUIETLY
          </span>{' '}
          <span className="relative inline-block text-coral after:absolute after:left-[-2%] after:right-[-2%] after:top-[54%] after:h-1 after:bg-coral after:shadow-[0_0_18px_rgba(255,92,69,.8)] after:[animation:strike_1.1s_0.9s_cubic-bezier(.85,0,.15,1)_both] after:[transform:rotate(-1.6deg)]">
            ROTTING
          </span>
        </h1>

        <p className="mx-auto mb-10 mt-[30px] max-w-[54ch] text-fog" style={{ fontSize: 'clamp(15px,1.6vw,18px)' }}>
          Every page behind you is decaying — links die, anchors vanish, redirects pile up. Sentinel sweeps your site like sonar and pings you{' '}
          <span className="font-mono text-sonar text-[.92em]">the moment something breaks</span>.
          Watch the background: that&apos;s your website without it.
        </p>

        <ScanBar />

        <p className="mt-4 font-mono text-[11.5px] tracking-[.04em] text-[#5C7589]">
          no signup · 25 pages free · respects robots.txt · 2 req/s, always polite
        </p>
      </div>

      <div
        aria-hidden="true"
        className="absolute bottom-[34px] left-1/2 flex -translate-x-1/2 flex-col items-center gap-[10px] font-mono text-[10.5px] uppercase tracking-[.3em] text-[#5C7589]"
      >
        descend
        <span className="block h-11 w-px bg-gradient-to-b from-sonar to-transparent [animation:drip_2s_ease_infinite]" />
      </div>

      <style>{`
        @keyframes strike{from{transform:rotate(-1.6deg) scaleX(0)}to{transform:rotate(-1.6deg) scaleX(1)}}
        @keyframes drip{0%{transform:scaleY(0);transform-origin:top}45%{transform:scaleY(1);transform-origin:top}55%{transform:scaleY(1);transform-origin:bottom}100%{transform:scaleY(0);transform-origin:bottom}}
      `}</style>
    </header>
  );
}
