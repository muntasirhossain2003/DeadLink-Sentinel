'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';

export function SignInForm() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await signIn('resend', { email, redirect: false });
    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-sonar/30 bg-abyss-2/80 p-8 text-center">
        <div className="mb-3 text-sonar text-2xl">✉</div>
        <p className="font-display font-bold">Check your inbox</p>
        <p className="mt-2 text-sm text-fog">We sent a magic link to <strong>{email}</strong></p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-snow/[.09] bg-abyss-2/80 p-8 backdrop-blur-md">
      {/* GitHub OAuth */}
      <button
        onClick={() => void signIn('github', { callbackUrl: '/dashboard' })}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-snow/20 px-4 py-3 text-sm font-medium transition-all hover:border-snow/40 hover:bg-snow/5"
      >
        <GithubIcon />
        Continue with GitHub
      </button>

      <div className="my-6 flex items-center gap-3 text-[#5C7589]">
        <div className="h-px flex-1 bg-snow/[.08]" />
        <span className="font-mono text-xs">or</span>
        <div className="h-px flex-1 bg-snow/[.08]" />
      </div>

      {/* Email magic link */}
      <form onSubmit={(e) => void handleMagicLink(e)} className="flex flex-col gap-3">
        <input
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-xl border border-snow/[.12] bg-abyss/60 px-4 py-3 font-mono text-sm placeholder-[#5C7589] focus:border-sonar/50 focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-sonar py-3 font-display text-sm font-bold text-abyss transition-all hover:shadow-[0_0_24px_rgba(43,217,194,.4)] disabled:opacity-50"
        >
          {loading ? 'Sending…' : 'Send magic link'}
        </button>
      </form>
    </div>
  );
}

function GithubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.38.6.11.82-.26.82-.58v-2.03c-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.74.08-.73.08-.73 1.21.09 1.84 1.24 1.84 1.24 1.07 1.84 2.82 1.3 3.5 1 .11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 013-.4c1.02 0 2.04.13 3 .4 2.28-1.55 3.29-1.23 3.29-1.23.66 1.66.25 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.48 5.92.43.37.82 1.1.82 2.22v3.29c0 .32.21.7.83.58C20.57 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}
