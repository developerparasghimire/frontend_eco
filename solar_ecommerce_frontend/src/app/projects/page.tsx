import type { Metadata } from 'next';

import {
  SolariseMedia,
  SolariseOfferBanner,
  SolariseProjectCard,
  SolariseSearchBar,
  SolariseShell,
} from '@/components/SolariseSite';
import { projectCards } from '@/data/solariseContent';

export const metadata: Metadata = {
  title: 'Solar Projects & Case Studies',
  description:
    'Explore completed solar energy projects by Eco Planet Solar — from residential rooftop installations to large-scale commercial and solar farm deployments.',
  alternates: { canonical: '/projects' },
  openGraph: {
    title: 'Solar Projects & Case Studies — Eco Planet Solar',
    description:
      'Residential rooftop installations to large-scale solar farms. See how Eco Planet Solar powers real communities.',
    url: '/projects',
  },
};

export default function ProjectsPage() {
  return (
    <SolariseShell footerEmail="info@ecoplanet.com">
      <section className="solar-container solar-spacer solar-spacer--lg" />

      <section className="solar-container">
        <SolariseSearchBar />
      </section>

      <section className="solar-container solar-project-list">
        <div className="solar-project-list__row">
          <SolariseMedia />
          <SolariseProjectCard
            title={projectCards[0].title}
            meta={projectCards[0].meta}
            href={projectCards[0].href}
            accent
          />
        </div>

        <div className="solar-project-list__row solar-project-list__row--alt">
          <SolariseProjectCard
            title={projectCards[1].title}
            meta={projectCards[1].meta}
            href={projectCards[1].href}
            accent
          />
          <SolariseMedia />
        </div>

        <div className="solar-project-list__row">
          <SolariseMedia />
          <SolariseProjectCard
            title={projectCards[2].title}
            meta={projectCards[2].meta}
            href={projectCards[2].href}
            accent
          />
        </div>
      </section>

      <div className="solar-container">
        <SolariseOfferBanner />
      </div>
    </SolariseShell>
  );
}
