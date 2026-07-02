import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="grid min-h-svh place-items-center px-6 text-center">
      <div>
        <p className="font-mono text-xs uppercase tracking-[.3em] text-[#5C7589]">
          404 · not found
        </p>
        <h1 className="mt-4 font-display text-5xl font-black tracking-tight">
          This link is <span className="text-coral">dead</span>.
        </h1>
        <p className="mx-auto mt-4 max-w-[42ch] text-fog">
          Fitting, isn&apos;t it? The page you&apos;re after has rotted away — or never existed.
        </p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-xl bg-sonar px-8 py-3 font-display text-sm font-bold text-abyss transition-all hover:shadow-[0_0_24px_rgba(43,217,194,.4)]"
        >
          ← Back to safety
        </Link>
      </div>
    </div>
  );
}
