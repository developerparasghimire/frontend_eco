import { SolariseOfferBanner, SolarisePageHero, SolariseShell } from '@/components/SolariseSite';
import {
  sunsetValleyProject,
  sunsetValleyProjectSections,
} from '@/data/solariseContent';

export default function ProjectDetailPage() {
  return (
    <SolariseShell footerEmail="info@ecoplanet.eco">
      <SolarisePageHero
        eyebrow="PROJECT CASE STUDY"
        title={sunsetValleyProject.title}
        subtitle={sunsetValleyProject.metaLine}
        image="https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=1600&q=80"
        height="md"
      />

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
