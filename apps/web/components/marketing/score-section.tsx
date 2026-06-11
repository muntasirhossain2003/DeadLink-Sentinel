'use client';

import { useEffect, useRef, useState } from 'react';

const timeline = [
  {
    bad: false,
    time: 'MON 02:00 · scheduled sweep',
    title: '94 pages, all clear',
    body: "Score holds at 88. No mail sent — silence is the feature.",
  },
  {
    bad: true,
    time: 'THU 02:00 · scheduled sweep',
    title: '5 new issues detected',
    body: "An API route was removed; 3 pages still link to it. Score drops to 81. One email, top issues summarised.",
  },
  {
    bad: false,
    time: 'THU 09:40 · manual re-scan',
    title: 'Fixed and verified',
    body: (
      <>
        You patch the links, hit re-scan, watch the diff flip to{' '}
        <b className="text-sonar">FIXED ×5</b>. Score recovers before anyone noticed.
      </>
    ),
  },
];

export function ScoreSection() {
  const gaugeRef = useRef<HTMLDivElement>(null);
  const [score, setScore] = useState(0);
  const [arcLen, setArcLen] = useState(0);
  const CIRCUMFERENCE = 1106;
  const TARGET = 81;

  useEffect(() => {
    const el = gaugeRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();

        const dur = 1600;
        const t0 = performance.now();
        const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (reduced) {
          setScore(TARGET);
          setArcLen(Math.round(CIRCUMFERENCE * TARGET / 100));
          return;
        }

        function step(t: number) {
          const p = Math.min(1, (t - t0) / dur);
          const ease = 1 - Math.pow(1 - p, 3);
          setScore(Math.round(TARGET * ease));
          setArcLen(Math.round(CIRCUMFERENCE * TARGET * ease / 100));
          if (p < 1) requestAnimationFrame(step);
        }

        setArcLen(Math.round(CIRCUMFERENCE * TARGET / 100));
        requestAnimationFrame(step);
      },
      { threshold: 0.4 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="mx-auto max-w-[1140px] px-8 pt-[130px]">
      <div className="mb-[70px]">
        <p className="mb-[18px] font-mono text-xs uppercase tracking-[.26em] text-sonar">// the health score</p>
        <h2 className="max-w-[18ch] font-display text-[clamp(30px,4.4vw,54px)] font-extrabold leading-[1.04] tracking-[-0.03em]">
          One number. The whole story.
        </h2>
        <p className="mt-5 max-w-[58ch] text-[17px] text-fog">
          Every sweep computes a weighted 0–100 score. Internal breakage hurts most — it&apos;s yours to fix. Watch it over time and a falling line becomes an early warning, not a postmortem.
        </p>
      </div>

      <div className="grid grid-cols-2 items-center gap-[60px]">
        {/* Gauge */}
        <div
          ref={gaugeRef}
          className="relative mx-auto w-[min(380px,80vw)]"
          role="img"
          aria-label={`Animated health score gauge showing ${score}`}
        >
          <svg
            viewBox="0 0 400 400"
            fill="none"
            className="block w-full drop-shadow-[0_0_38px_rgba(43,217,194,.18)]"
          >
            <circle cx="200" cy="200" r="176" stroke="rgba(239,246,251,.1)" strokeWidth="1" />
            <circle cx="200" cy="200" r="132" stroke="rgba(239,246,251,.08)" strokeWidth="1" strokeDasharray="2 6" />
            <circle cx="200" cy="200" r="88" stroke="rgba(239,246,251,.08)" strokeWidth="1" strokeDasharray="2 6" />
            <circle
              cx="200" cy="200" r="176"
              stroke="#2BD9C2" strokeWidth="6" strokeLinecap="round"
              strokeDasharray={`${arcLen} ${CIRCUMFERENCE}`}
              transform="rotate(-90 200 200)"
              style={{ transition: 'stroke-dasharray 1.6s cubic-bezier(.2,.7,.2,1)' }}
            />
            <g style={{ transformOrigin: '50% 50%', animation: 'sweep 5s linear infinite' }}>
              <path d="M200 200 L200 28" stroke="url(#bm)" strokeWidth="3" strokeLinecap="round" />
            </g>
            <circle cx="262" cy="110" r="5" fill="#2BD9C2" opacity=".9" />
            <circle cx="300" cy="240" r="5" fill="#FF5C45" />
            <circle cx="120" cy="286" r="5" fill="#F2B544" opacity=".9" />
            <defs>
              <linearGradient id="bm" x1="200" y1="200" x2="200" y2="28" gradientUnits="userSpaceOnUse">
                <stop stopColor="#2BD9C2" stopOpacity="0" />
                <stop offset="1" stopColor="#2BD9C2" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 grid place-items-center text-center">
            <div>
              <b className="block font-display font-black leading-none tracking-[-0.04em]" style={{ fontSize: 'clamp(58px,8vw,88px)' }}>
                {score}
              </b>
              <span className="font-mono text-[11px] uppercase tracking-[.3em] text-[#5C7589]">health score</span>
            </div>
          </div>
          <style>{`@keyframes sweep{to{transform:rotate(360deg)}}`}</style>
        </div>

        {/* Timeline */}
        <ul className="grid gap-0">
          {timeline.map((item, i) => (
            <li key={i} className={`relative grid grid-cols-[22px_1fr] gap-[18px] pb-[30px] before:absolute before:bottom-1 before:left-[10px] before:top-[22px] before:w-px before:bg-snow/[.12] last:before:hidden`}>
              <span className={`grid h-[21px] w-[21px] place-items-center rounded-full border border-snow/20 bg-abyss-2`}>
                <i className={`block h-[7px] w-[7px] rounded-full ${item.bad ? 'bg-coral shadow-[0_0_12px_rgba(255,92,69,.7)]' : 'bg-sonar'}`} />
              </span>
              <div>
                <div className="font-mono text-[11px] tracking-[.06em] text-[#5C7589]">{item.time}</div>
                <h4 className="mb-1 mt-[3px] font-display text-[16.5px] font-bold">{item.title}</h4>
                <p className="text-[13.5px] text-fog">{item.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
