import {
  SolariseButton,
  SolariseFeatureCard,
  SolariseOfferBanner,
  SolarisePageHero,
  SolariseProcessSection,
  SolariseShell,
} from '@/components/SolariseSite';
import { serviceDetailValueCards } from '@/data/solariseContent';

export default function ServiceDetailPage() {
  return (
    <SolariseShell footerEmail="info@ecoplanet.eco">
      <SolarisePageHero
        eyebrow="OUR SERVICES"
        title="Consultation & Assessment"
        subtitle="We assess your property to determine its solar potential — analyzing roof orientation, shading, and energy consumption to design a system tailored to your needs."
        image="https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=1600&q=80"
        height="md"
      />

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
