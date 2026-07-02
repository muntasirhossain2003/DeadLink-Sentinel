'use client';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';

export type TimelinePoint = {
  date: string; // pre-formatted label, e.g. "12 Jun"
  score: number;
};

interface Props {
  data: TimelinePoint[];
}

// Single-series line chart: no legend needed, the card title names it.
// Marks follow the dataviz spec: 2px line, hidden dots, 10px active dot with
// a 2px surface ring, recessive grid, text in text tokens (fog), never the
// series color.
export function HealthTimeline({ data }: Props) {
  if (data.length < 2) {
    return (
      <div className="grid h-56 place-items-center rounded-xl border border-dashed border-snow/[.12]">
        <p className="font-mono text-xs text-[#5C7589]">
          Run at least two scans to see the trend
        </p>
      </div>
    );
  }

  return (
    <div className="h-56 w-full" role="img" aria-label="Health score over time">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -18 }}>
          <CartesianGrid
            vertical={false}
            stroke="rgba(239,246,251,.06)"
            strokeWidth={1}
          />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#5C7589', fontSize: 11, fontFamily: 'IBM Plex Mono' }}
            dy={8}
          />
          <YAxis
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#5C7589', fontSize: 11, fontFamily: 'IBM Plex Mono' }}
          />
          {/* healthy threshold, labelled so it isn't color-alone */}
          <ReferenceLine
            y={80}
            stroke="rgba(43,217,194,.25)"
            strokeDasharray="4 4"
            label={{
              value: 'healthy ≥ 80',
              position: 'insideTopRight',
              fill: '#5C7589',
              fontSize: 10,
              fontFamily: 'IBM Plex Mono',
            }}
          />
          <Tooltip
            cursor={{ stroke: 'rgba(239,246,251,.2)', strokeWidth: 1 }}
            content={<TimelineTooltip />}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#2BD9C2"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 5, fill: '#2BD9C2', stroke: '#06121F', strokeWidth: 2 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function TimelineTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const score = payload[0]?.value;
  return (
    <div className="rounded-lg border border-snow/[.12] bg-abyss-2 px-3 py-2 shadow-[0_8px_24px_rgba(0,0,0,.5)]">
      <p className="font-mono text-[10px] uppercase tracking-[.15em] text-[#5C7589]">{label}</p>
      <p className="mt-0.5 font-display text-lg font-bold text-snow">
        {score}
        <span className="ml-1.5 font-mono text-[10px] font-normal text-fog">/ 100</span>
      </p>
    </div>
  );
}
