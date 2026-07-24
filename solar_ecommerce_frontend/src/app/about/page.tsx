import type { Metadata } from 'next';

import {
  SolariseButton,
  SolariseFeatureCard,
  SolariseJoinBanner,
  SolariseMedia,
  SolarisePageHero,
  SolariseShell,
} from '@/components/SolariseSite';
import { aboutValueCards } from '@/data/solariseContent';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Learn about Eco Planet Solar — our story, mission, and commitment to delivering clean, reliable solar energy solutions for homes and businesses across India.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About Eco Planet Solar',
    description:
      'We exist to empower individuals and businesses to embrace solar energy. Learn about our story, values, and commitment to a sustainable future.',
    url: '/about',
  },
};

export default function AboutPage() {
  return (
    <SolariseShell footerEmail="info@ecoplanet.eco">
      <SolarisePageHero
        eyebrow="ABOUT US"
        title="Empowering India through clean solar energy"
        subtitle="We exist to make solar power accessible, reliable, and affordable for every home and business — one installation at a time."
        image="https://images.unsplash.com/photo-1497440001374-f26997328c1b?w=1600&q=80"
        height="lg"
      />

      <section className="solar-container solar-about-story">
        <SolariseMedia
          src="https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=900&q=80"
          alt="Solar panels on a rooftop"
        />

        <div className="solar-about-story__copy">
          <p className="solar-eyebrow">OUR STORY</p>
          <h1 className="solar-title solar-title--xxl">
            We exist to <span className="solar-highlight">empower</span> individuals and businesses to{' '}
            <span className="solar-highlight">embrace</span> solar energy
          </h1>

          <div className="solar-copy-stack">
            <p className="solar-copy solar-copy--compact">
              At Eco Planet Solar, we are driven by a deep passion for renewable energy and a strong
              commitment to building a sustainable future. Our journey began with a clear and powerful
              vision to harness the limitless energy of the sun and transform it into clean, reliable, and
              accessible power for everyone.
            </p>
            <p className="solar-copy solar-copy--compact">
              Today, the demand for sustainable energy solutions is greater than ever. With climate change
              and environmental challenges becoming increasingly urgent, the need for responsible energy
              choices cannot be ignored. Eco Planet Solar was founded to be part of the solution to
              delivering practical, forward-thinking solar energy systems that make a real difference.
            </p>
            <p className="solar-copy solar-copy--compact">
              We are here to empower individuals, communities, and businesses to transition to solar
              energy, reduce their carbon footprint, and actively contribute to a cleaner, greener planet.
              Through innovation, quality, and dedication, Eco Planet Solar is proud to support the global
              movement toward sustainable living.
            </p>
          </div>
        </div>
      </section>

      <section className="solar-container solar-about-commitment">
        <div className="solar-heading-wrap">
          <p className="solar-eyebrow">OUR COMMITMENT</p>
          <h2 className="solar-title solar-title--xl">
            We envision a planet powered by the sun, where clean energy is{' '}
            <span className="solar-highlight">affordable</span> and{' '}
            <span className="solar-highlight">accessible</span> to all
          </h2>
          <p className="solar-copy solar-copy--compact">
            Join us in our journey toward a cleaner, greener, and more sustainable future. Together, we
            can power change, one solar panel at a time.
          </p>
          <SolariseButton href="/contact" tone="navy">
            Contact Us
          </SolariseButton>
        </div>

        <div className="solar-values-stack">
          {aboutValueCards.map((item) => (
            <SolariseFeatureCard key={item.title} icon={item.icon} title={item.title} text={item.text} />
          ))}
        </div>
      </section>

      <section className="solar-container solar-about-mission">
        <SolariseMedia
          src="https://images.unsplash.com/photo-1581092162384-8987c1d64718?w=900&q=80"
          alt="Solar installation technician working on rooftop"
        />

        <div className="solar-about-mission__copy">
          <p className="solar-eyebrow">OUR MISSION</p>
          <h2 className="solar-title solar-title--xl">
            Our mission is clear: to make the world a better place by providing innovative, reliable, and
            eco-friendly solar energy solutions.
          </h2>
        </div>
      </section>

      <div className="solar-container">
        <SolariseJoinBanner />
      </div>
    </SolariseShell>
  );
}
