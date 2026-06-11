import type { Metadata } from 'next';
import { HeroSection } from '@/components/marketing/hero-section';
import { TickerBar } from '@/components/marketing/ticker-bar';
import { FeaturesSection } from '@/components/marketing/features-section';
import { ScoreSection } from '@/components/marketing/score-section';
import { CtaSection } from '@/components/marketing/cta-section';
import { SiteNav } from '@/components/marketing/site-nav';
import { SiteFooter } from '@/components/marketing/site-footer';
import { NetworkBackground } from '@/components/marketing/network-background';

export const metadata: Metadata = {
  title: 'DeadLink Sentinel — The web is rotting',
  description:
    'Sweep your docs site for broken links, missing anchors, and redirect chains. Health score tracked over time. First 25 pages free.',
};

export default function LandingPage() {
  return (
    <>
      <NetworkBackground />

      <div className="relative z-[2]">
        <SiteNav />

        <main>
          <HeroSection />
          <TickerBar />
          <FeaturesSection />
          <ScoreSection />
          <CtaSection />
        </main>

        <SiteFooter />
      </div>
    </>
  );
}
