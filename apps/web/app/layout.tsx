import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    template: '%s — DeadLink Sentinel',
    default: 'DeadLink Sentinel — Site health monitor',
  },
  description:
    'Continuous link-rot monitoring for docs sites. Broken links, broken anchors, redirect chains — detected before your users find them.',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000',
  ),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
