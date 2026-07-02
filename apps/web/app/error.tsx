'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="grid min-h-svh place-items-center px-6 text-center">
      <div>
        <p className="font-mono text-xs uppercase tracking-[.3em] text-coral">
          something broke
        </p>
        <h1 className="mt-4 font-display text-4xl font-black tracking-tight">
          Well, this is awkward.
        </h1>
        <p className="mx-auto mt-4 max-w-[42ch] text-fog">
          The link checker hit an error of its own. Try again — if it keeps happening, it&apos;s on us.
        </p>
        {error.digest && (
          <p className="mt-3 font-mono text-[10px] text-[#5C7589]">ref: {error.digest}</p>
        )}
        <button
          onClick={reset}
          className="mt-8 rounded-xl bg-sonar px-8 py-3 font-display text-sm font-bold text-abyss transition-all hover:shadow-[0_0_24px_rgba(43,217,194,.4)]"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
