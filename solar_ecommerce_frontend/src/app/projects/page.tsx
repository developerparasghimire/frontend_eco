import {
  SolariseMedia,
  SolariseOfferBanner,
  SolariseProjectCard,
  SolariseSearchBar,
  SolariseShell,
} from '@/components/SolariseSite';
import { projectCards } from '@/data/solariseContent';

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
