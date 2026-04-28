import {
  SolariseButton,
  SolariseFeatureCard,
  SolariseOfferBanner,
  SolariseProcessSection,
  SolariseShell,
} from '@/components/SolariseSite';
import { serviceDetailValueCards } from '@/data/solariseContent';

export default function ServiceDetailPage() {
  return (
    <SolariseShell footerEmail="info@ecoplanet.com">
      <section className="solar-container solar-service-hero">
        <div className="solar-service-hero__box">
          <h1>Consultation &amp; Assessment</h1>
          <p>
            We begin by assessing your property to determine its solar potential. We analyze factors such
            as roof orientation, shading, and energy consumption to design a system that meets your
            specific needs.
          </p>
        </div>
      </section>

      <section className="solar-container solar-service-detail">
        <div className="solar-heading-wrap">
          <h2 className="solar-title solar-title--xl">
            We envision a planet powered by the sun, where clean energy is{' '}
            <span className="solar-highlight">affordable</span> and{' '}
            <span className="solar-highlight">accessible</span> to all
          </h2>
          <p className="solar-copy solar-copy--compact">
            The &quot;Consultation and Assessment&quot; service is a critical initial step in the solar
            panel installation process. It ensures that the solar system is tailored to the unique needs
            of the customer, that all regulatory requirements are met, and that the customer is fully
            informed about the project. The consultation and assessment lay the foundation for a
            successful solar installation that maximizes energy production, cost savings, and
            environmental benefits.
          </p>
          <SolariseButton href="/contact" tone="navy">
            Contact Us
          </SolariseButton>
        </div>

        <div className="solar-values-stack">
          {serviceDetailValueCards.map((item) => (
            <SolariseFeatureCard key={item.title} icon={item.icon} title={item.title} text={item.text} />
          ))}
        </div>
      </section>

      <SolariseProcessSection />

      <div className="solar-container">
        <SolariseOfferBanner />
      </div>
    </SolariseShell>
  );
}
