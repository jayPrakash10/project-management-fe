import { ClosingCta, LandingFooter } from '@/components/features/landing/closing-cta';
import { FeatureGrid } from '@/components/features/landing/feature-grid';
import { HeroSection } from '@/components/features/landing/hero-section';
import { HowItWorks } from '@/components/features/landing/how-it-works';
import { LandingHeader } from '@/components/features/landing/landing-header';
import { RolesSection } from '@/components/features/landing/roles-section';
import { ThemeShowcase } from '@/components/features/landing/theme-showcase';
import { DemoBanner } from '@/components/layout/demo-banner';

/** Public marketing page at "/" for signed-out visitors. */
export function LandingPage() {
  return (
    <div className="min-h-dvh bg-bg">
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-surface px-3 py-2 text-fg shadow-md focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Skip to content
      </a>
      <DemoBanner />
      <LandingHeader />
      <main id="main">
        <HeroSection />
        <FeatureGrid />
        <HowItWorks />
        <RolesSection />
        <ThemeShowcase />
        <ClosingCta />
      </main>
      <LandingFooter />
    </div>
  );
}
