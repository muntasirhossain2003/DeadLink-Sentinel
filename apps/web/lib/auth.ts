import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import Resend from 'next-auth/providers/resend';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@deadlink-sentinel/db';

export const { handlers, auth, signIn, signOut } = NextAuth({
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
