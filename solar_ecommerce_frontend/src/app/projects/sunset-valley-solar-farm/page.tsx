import { SolariseOfferBanner, SolariseShell, SolariseStarburst } from '@/components/SolariseSite';
import {
  sunsetValleyProject,
  sunsetValleyProjectSections,
} from '@/data/solariseContent';

export default function ProjectDetailPage() {
  return (
    <SolariseShell footerEmail="info@ecoplanet.com">
      <section className="solar-container solar-spacer solar-spacer--lg" />

      <section className="solar-container solar-project-detail-hero">
        <div className="solar-project-detail-hero__box">
          <h1>{sunsetValleyProject.title}</h1>
          <p>{sunsetValleyProject.metaLine}</p>
          <SolariseStarburst className="solar-project-detail-hero__burst" tone="accent" />
        </div>
      </section>

      <section className="solar-container">
        <div className="solar-text-panel">
          <h2>Project Detail</h2>

          {sunsetValleyProjectSections.map((section) => {
            const [heading, ...rest] = section.split('\n');
            const body = rest.join('\n');

            return body ? (
              <p key={heading}>
                <strong>{heading}</strong>
                <br />
                {body}
              </p>
            ) : (
              <p key={heading}>{heading}</p>
            );
          })}
        </div>
      </section>

      <div className="solar-container">
        <SolariseOfferBanner />
      </div>
    </SolariseShell>
  );
}
