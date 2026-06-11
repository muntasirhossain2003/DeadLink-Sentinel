'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { prisma } from '@deadlink-sentinel/db';
import { CreateSiteSchema } from '@deadlink-sentinel/shared';
import { assertNotPrivate } from '@/lib/ssrf-guard';

export async function createSite(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Not authenticated');

  const raw = {
    name: formData.get('name'),
    rootUrl: formData.get('rootUrl'),
  };

  const parsed = CreateSiteSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }

  // SSRF guard: reject private/reserved IP targets
  try {
    await assertNotPrivate(parsed.data.rootUrl);
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Invalid URL' };
  }

  // Enforce per-user site limit (3)
  const count = await prisma.site.count({ where: { userId: session.user.id } });
  if (count >= 3) {
    return { error: 'Site limit reached (3). Delete a site to add another.' };
  }

  const site = await prisma.site.create({
    data: {
      userId: session.user.id,
      name: parsed.data.name,
      rootUrl: parsed.data.rootUrl,
      scanOptions: parsed.data.scanOptions ?? {},
    },
  });

  revalidatePath('/dashboard');
  redirect(`/dashboard`);
}

export async function deleteSite(siteId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Not authenticated');

  // Confirm ownership before deleting — cascades to scans/pages/link_checks
  await prisma.site.deleteMany({
    where: { id: siteId, userId: session.user.id },
  });

  revalidatePath('/dashboard');
}
