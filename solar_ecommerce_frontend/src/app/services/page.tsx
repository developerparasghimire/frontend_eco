import type { Metadata } from 'next';

import {
  SolariseButton,
  SolariseJoinBanner,
  SolariseMedia,
  SolariseProcessSection,
  SolariseShell,
} from '@/components/SolariseSite';
import { servicesOverview } from '@/data/solariseContent';

export const metadata: Metadata = {
  title: 'Solar Services',
  description:
    'Eco Planet Solar offers residential & commercial solar panel installation, system design, maintenance, and energy consultation across India. Get started today.',
  keywords: [
    'solar panel installation', 'solar system design', 'rooftop solar', 'solar maintenance',
    'commercial solar', 'residential solar', 'energy consultation',
  ],
  alternates: { canonical: '/services' },
  openGraph: {
    title: 'Solar Services — Eco Planet Solar',
    description:
      'From system design to installation and maintenance — Eco Planet Solar provides end-to-end solar energy services for homes and businesses.',
    url: '/services',
  },
};

export default function ServicesPage() {
  return (
    <SolariseShell footerEmail="info@solarise.com">
      <section className="solar-container solar-spacer solar-spacer--lg" />

      <section className="solar-container solar-services-intro">
        <div className="solar-services-intro__heading">
          <h1 className="solar-title solar-title--xl">
            Our expertise in <span className="solar-highlight">solar technology</span> ensures you get
            the most efficient and reliable solutions, whether you&apos;re a homeowner or a business owner
          </h1>
        </div>

        <div className="solar-services-list">
          {servicesOverview.map((service) => (
            <section
              key={service.title}
              className={`solar-service-row${service.reverse ? ' solar-service-row--reverse' : ''}`}
            >
              <SolariseMedia />

              <div className="solar-service-copy">
                <h2>{service.title}</h2>
                <p>{service.text}</p>
                <SolariseButton href={service.href} tone="navy" size="sm">
                  See Detail
                </SolariseButton>
              </div>
            </section>
          ))}
        </div>
      </section>

      <SolariseProcessSection />

      <div className="solar-container">
        <SolariseJoinBanner />
      </div>
    </SolariseShell>
  );
}
