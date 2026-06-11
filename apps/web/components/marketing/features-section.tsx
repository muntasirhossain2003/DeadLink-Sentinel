const features = [
  {
    type: '404',
    title: 'Dead links',
    description: 'Internal or external, gone is gone. Grouped by source page so you fix once, everywhere.',
    demo: (
      <div className="rounded-[10px] border border-snow/[.08] bg-abyss/70 px-4 py-[14px] font-mono text-[12.5px] text-fog">
        GET /api/v1/reports → <span className="text-coral">404 Not Found</span>
        <br />
        found on <span className="text-sonar">3 pages</span> · first seen <span className="text-amber">this scan</span>
      </div>
    ),
  },
  {
    type: '#',
    title: 'Broken anchors',
    description: "The heading got renamed; the link still \"works.\" Page loads, reader lands nowhere. Almost no tool catches this. Sentinel does.",
    demo: (
      <div className="rounded-[10px] border border-snow/[.08] bg-abyss/70 px-4 py-[14px] font-mono text-[12.5px] text-fog">
        /setup/deploy<span className="text-coral">#railway-config</span>
        <br />
        page <span className="text-sonar">200 OK</span> · fragment <span className="text-coral">not found</span>
      </div>
    ),
  },
  {
    type: '301',
    title: 'Redirect chains',
    description: 'Three hops where one would do — slow for users, leaky for SEO. Full chain recorded, collapse suggested.',
    demo: (
      <div className="rounded-[10px] border border-snow/[.08] bg-abyss/70 px-4 py-[14px] font-mono text-[12.5px] text-fog">
        /docs → /docs/ → /documentation → <span className="text-amber">/guides</span>
        <br />
        <span className="text-amber">3 hops</span> · collapse to 1
      </div>
    ),
  },
  {
    type: 'alt',
    title: 'Content decay',
    description: 'Missing alt text, vanished titles, dropped meta descriptions — the slow erosion that costs accessibility and ranking.',
    demo: (
      <div className="rounded-[10px] border border-snow/[.08] bg-abyss/70 px-4 py-[14px] font-mono text-[12.5px] text-fog">
        /img/hero.png → <span className="text-amber">missing alt</span>
        <br />
        /changelog → <span className="text-amber">no meta description</span>
      </div>
    ),
  },
];

export function FeaturesSection() {
  return (
    <section className="mx-auto max-w-[1140px] px-8 pt-[130px]">
      <div className="mb-[70px]">
        <p className="mb-[18px] font-mono text-xs uppercase tracking-[.26em] text-sonar">// what the sweep finds</p>
        <h2 className="max-w-[18ch] font-display text-[clamp(30px,4.4vw,54px)] font-extrabold leading-[1.04] tracking-[-0.03em]">
          Four kinds of decay. One pass.
        </h2>
        <p className="mt-5 max-w-[58ch] text-[17px] text-fog">
          A page that returns 200 can still be broken. Sentinel classifies every link it touches — including the failure modes that don&apos;t look like failures.
        </p>
      </div>

      <div className="grid gap-[18px]">
        {features.map((f, i) => (
          <div
            key={f.type}
            className="grid grid-cols-[90px_1fr_1fr] items-center gap-[30px] rounded-[18px] border border-snow/[.09] bg-gradient-to-b from-abyss-2/55 to-abyss-2/25 px-9 py-[34px] backdrop-blur-[10px] transition-all duration-300 hover:-translate-y-[3px] hover:border-sonar/45 hover:shadow-[0_0_60px_rgba(43,217,194,.08)]"
          >
            <div className="font-mono text-[13px] text-[#5C7589]">
              type
              <b className="block text-[30px] font-medium text-sonar">{f.type}</b>
            </div>
            <div>
              <h3 className="mb-1 font-display text-[23px] font-bold tracking-[-0.015em]">{f.title}</h3>
              <p className="text-[14.5px] text-fog">{f.description}</p>
            </div>
            {f.demo}
          </div>
        ))}
      </div>
    </section>
  );
}
