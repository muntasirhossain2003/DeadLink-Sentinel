'use client';

import { useState } from 'react';
import { createSite } from '@/actions/site-actions';

export function NewSiteButton() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    const result = await createSite(formData);
    if (result?.error) setError(result.error);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-xl bg-sonar px-5 py-2.5 font-display text-sm font-bold text-abyss transition-all hover:shadow-[0_0_24px_rgba(43,217,194,.4)]"
      >
        + Add site
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-abyss/80 backdrop-blur-sm" onClick={() => setOpen(false)}>
      <div
        className="w-full max-w-md rounded-2xl border border-snow/[.09] bg-abyss-2 p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-6 font-display text-xl font-bold">Add a site</h2>
        <form action={(fd) => void handleSubmit(fd)} className="flex flex-col gap-4">
          <label className="flex flex-col gap-2">
            <span className="font-mono text-xs text-fog">Name</span>
            <input
              name="name"
              required
              placeholder="My docs site"
              className="rounded-xl border border-snow/[.12] bg-abyss/60 px-4 py-3 font-mono text-sm focus:border-sonar/50 focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="font-mono text-xs text-fog">Root URL</span>
            <input
              name="rootUrl"
              type="url"
              required
              placeholder="https://docs.yoursite.com"
              className="rounded-xl border border-snow/[.12] bg-abyss/60 px-4 py-3 font-mono text-sm focus:border-sonar/50 focus:outline-none"
            />
          </label>
          {error && <p className="font-mono text-xs text-coral">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 rounded-xl bg-sonar py-3 font-display text-sm font-bold text-abyss"
            >
              Add site
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex-1 rounded-xl border border-snow/[.12] py-3 font-display text-sm font-bold text-fog"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
