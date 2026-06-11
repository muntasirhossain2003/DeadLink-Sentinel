import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { DashboardNav } from '@/components/dashboard/dashboard-nav';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect('/sign-in');

  return (
    <div className="flex min-h-svh flex-col">
      <DashboardNav user={session.user} />
      <main className="mx-auto w-full max-w-[1140px] flex-1 px-6 py-8">
        {children}
      </main>
    </div>
  );
}
