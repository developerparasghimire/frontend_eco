import type { Metadata } from 'next';

import {
  SolariseMedia,
  SolariseOfferBanner,
  SolarisePageHero,
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
    <SolariseShell footerEmail="info@ecoplanet.eco">
      <SolarisePageHero
        eyebrow="OUR PROJECTS"
        title="Real solar installations powering real communities"
        subtitle="From rooftop home systems to utility-scale solar farms — explore our completed projects across India."
        image="https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=1600&q=80"
        height="lg"
      />

      <section className="solar-container">
        <SolariseSearchBar />
      </section>

      <section className="solar-container solar-project-list">
        <div className="solar-project-list__row">
          <SolariseMedia
            src={projectCards[0].image}
            alt={projectCards[0].title}
          />
          <SolariseProjectCard
            title={projectCards[0].title}
            meta={projectCards[0].meta}
            href={projectCards[0].href}
            image={projectCards[0].image}
            accent
          />
        </div>

        <div className="solar-project-list__row solar-project-list__row--alt">
          <SolariseProjectCard
            title={projectCards[1].title}
            meta={projectCards[1].meta}
            href={projectCards[1].href}
            image={projectCards[1].image}
            accent
          />
          <SolariseMedia
            src={projectCards[1].image}
            alt={projectCards[1].title}
          />
        </div>

        <div className="solar-project-list__row">
          <SolariseMedia
            src={projectCards[2].image}
            alt={projectCards[2].title}
          />
          <SolariseProjectCard
            title={projectCards[2].title}
            meta={projectCards[2].meta}
            href={projectCards[2].href}
            image={projectCards[2].image}
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
