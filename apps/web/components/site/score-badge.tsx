interface Props {
  score: number;
  size?: 'sm' | 'lg';
}

function tone(score: number) {
  if (score >= 80) return { text: 'text-sonar', ring: 'border-sonar/30' };
  if (score >= 60) return { text: 'text-amber', ring: 'border-amber/30' };
  return { text: 'text-coral', ring: 'border-coral/30' };
}

export function ScoreBadge({ score, size = 'sm' }: Props) {
  const t = tone(score);
  if (size === 'lg') {
    return (
      <span className={`font-display text-4xl font-black ${t.text}`}>
        {score}
        <span className="ml-1 font-mono text-[10px] font-normal uppercase tracking-[.2em] text-[#5C7589]">
          / 100
        </span>
      </span>
    );
  }
  return (
    <span
      className={`inline-block rounded-md border ${t.ring} px-2 py-0.5 font-mono text-xs font-medium ${t.text}`}
    >
      {score}
    </span>
  );
}
