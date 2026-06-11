import Link from 'next/link';
import type { User } from 'next-auth';
import { signOut } from '@/lib/auth';

interface Props {
  user: User;
}

export function DashboardNav({ user }: Props) {
  return (
    <header className="border-b border-snow/[.08] bg-abyss-2/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1140px] items-center justify-between px-6 py-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 font-display text-sm font-extrabold tracking-[.01em]"
        >
          <span className="h-7 w-7 rounded-full border-2 border-sonar" aria-hidden />
          DEADLINK SENTINEL
        </Link>

        <div className="flex items-center gap-4">
          <span className="font-mono text-xs text-fog">{user.email}</span>
          <form
            action={async () => {
              'use server';
              await signOut({ redirectTo: '/' });
            }}
          >
            <button
              type="submit"
              className="font-mono text-xs text-[#5C7589] hover:text-snow transition-colors"
            >
              sign_out()
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
