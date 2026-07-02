import NextAuth, { type NextAuthResult } from 'next-auth';
import GitHub from 'next-auth/providers/github';
import Resend from 'next-auth/providers/resend';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@deadlink-sentinel/db';

const nextAuth = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    Resend({
      apiKey: process.env.RESEND_API_KEY!,
      from: process.env.EMAIL_FROM ?? 'no-reply@deadlink-sentinel.dev',
    }),
  ],
  callbacks: {
    session({ session, user }) {
      // Expose user id and role to the client session so Server Actions can
      // authorise without an extra DB query
      session.user.id = user.id;
      // @ts-expect-error — role is in our DB but not in the default NextAuth User type
      session.user.role = user.role as string;
      return session;
    },
  },
  pages: {
    signIn: '/sign-in',
    error: '/sign-in',
  },
});

// Explicit annotations work around next-auth v5's non-portable inferred
// types (TS2742) in a monorepo.
export const handlers: NextAuthResult['handlers'] = nextAuth.handlers;
export const auth: NextAuthResult['auth'] = nextAuth.auth;
export const signIn: NextAuthResult['signIn'] = nextAuth.signIn;
export const signOut: NextAuthResult['signOut'] = nextAuth.signOut;
