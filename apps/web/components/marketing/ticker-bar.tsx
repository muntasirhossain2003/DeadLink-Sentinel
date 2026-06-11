// Server Component — no interactivity needed, just CSS animation
export function TickerBar() {
  const items = [
    <>avg docs site: <b className="font-medium text-coral">6.2% links broken</b></>,
    <>anchor links break when headings rename — <b className="font-medium text-coral">no 404, no warning</b></>,
    <>sentinel checks <i className="not-italic text-sonar">#fragments</i> other tools skip</>,
    <>health score <i className="not-italic text-sonar">0–100</i>, tracked every sweep</>,
    <>alerts only on <i className="not-italic text-sonar">what&apos;s new</i> — zero noise</>,
    <>your customer should never be your link checker</>,
  ];

  const doubled = [...items, ...items];

  return (
    <div
      aria-hidden="true"
      className="overflow-hidden border-b border-t border-snow/[.08] bg-abyss-2/50 py-4 backdrop-blur-[8px]"
    >
      <div className="flex w-max gap-16 font-mono text-[13px] text-fog [animation:scrollx_28s_linear_infinite]">
        {doubled.map((item, i) => (
          <div key={i}>{item}</div>
        ))}
      </div>
      <style>{`@keyframes scrollx{to{transform:translateX(-50%)}}`}</style>
    </div>
  );
}
