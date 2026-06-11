import type { Metadata } from 'next';
import { SignInForm } from '@/components/auth/sign-in-form';

export const metadata: Metadata = { title: 'Sign in' };

export default function SignInPage() {
  return (
    <div className="grid min-h-svh place-items-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center gap-3 font-display text-base font-extrabold">
            <span className="h-[30px] w-[30px] rounded-full border-2 border-sonar" aria-hidden />
            DEADLINK SENTINEL
          </div>
          <p className="text-[14px] text-fog">Sign in to your account</p>
        </div>
        <SignInForm />
      </div>
    </div>
  );
}
