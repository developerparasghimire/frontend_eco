import type { Metadata } from 'next';
import Link from 'next/link';
import {
  SolariseButton,
  SolariseFeatureCard,
  SolariseJoinBanner,
  SolariseMedia,
  SolariseNewsTile,
  SolariseOfferBanner,
  SolariseProjectCard,
  SolariseSectionHeader,
  SolariseShell,
  SolariseStarburst,
  SolariseStatCard,
  SolariseTestimonial,
} from '@/components/SolariseSite';
import {
  homeBenefits,
  homeServiceLinks,
  homeStats,
  newsCards,
  projectCards,
} from '@/data/solariseContent';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';

export const metadata: Metadata = {
  title: 'Eco Planet Solar — Harness the Power of the Sun',
  description:
    'Eco Planet Solar provides premium solar panels, inverters, and complete rooftop installation for homes and businesses across India. Get a free quote today.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Eco Planet Solar — Harness the Power of the Sun',
    description:
      'Premium solar panels, inverters & complete rooftop installation packages. Trusted by thousands across India.',
    url: '/',
    type: 'website',
  },
};

const organizationLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Eco Planet Solar',
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+62-1234-5678',
    contactType: 'customer service',
    email: 'info@ecoplanet.com',
    areaServed: 'IN',
    availableLanguage: ['English', 'Hindi'],
  },
  sameAs: [
    'https://www.facebook.com/ecoplanetsolar',
    'https://www.instagram.com/ecoplanetsolar',
    'https://twitter.com/EcoPlanetSolar',
  ],
};

const websiteLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Eco Planet Solar',
  url: SITE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/products?search={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

export default function HomePage() {
  return (
    <SolariseShell footerEmail="info@ecoplanet.com">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }}
      />
      <section className="solar-container solar-home-hero">
        <SolariseStarburst className="solar-home-hero__burst--left" tone="ghost" />

        <div className="solar-home-hero__copy">
          <h1 className="solar-title solar-title--hero">Harness the limitless power of the sun</h1>
          <p className="solar-home-hero__text">
            We&apos;re your trusted partner in the world of renewable energy, and we&apos;re excited to
            introduce you to a world of possibilities.
          </p>
          <SolariseButton href="/services" tone="navy" size="sm">
            Our Services
          </SolariseButton>
        </div>

        <div aria-hidden="true" className="solar-home-hero__img-wrap" style={{ position: 'relative', overflow: 'hidden', borderRadius: 38, minHeight: 420 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1200&q=80"
            alt="Solar panels on a rooftop"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', borderRadius: 38 }}
          />
        </div>
        <SolariseStarburst className="solar-home-hero__burst--right" tone="ghost" />
      </section>

      <section className="solar-container solar-home-stats">
        {homeStats.map((item) => (
          <SolariseStatCard key={item.value} value={item.value} label={item.label} />
        ))}
      </section>

      <section className="solar-container solar-home-grid solar-home-grid--why">
        <div className="solar-home-copy">
          <p className="solar-eyebrow">WHY SOLARISE</p>
          <h2 className="solar-title solar-title--xl">
            Our innovative spirit drives us to create visionary{' '}
            <span className="solar-highlight">solar solutions</span>
          </h2>
          <p className="solar-copy solar-copy--compact">
            At Solarise, we pride ourselves on being your premier choice for solar energy solutions.
            When you choose us, you&apos;re choosing a partner dedicated to your satisfaction and the
            future of clean, sustainable energy.
          </p>
          <SolariseButton href="/services" tone="navy" size="sm">
            Our Services
          </SolariseButton>
        </div>

        <div className="solar-home-features">
          {homeBenefits.map((item) => (
            <SolariseFeatureCard key={item.title} icon={item.icon} title={item.title} text={item.text} />
          ))}
        </div>
      </section>

      <section className="solar-container solar-home-grid solar-home-grid--about">
        <SolariseMedia
          src="https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=900&q=80"
          alt="Solar panels on a home rooftop"
        />

        <div className="solar-home-copy">
          <p className="solar-eyebrow">ABOUT US</p>
          <h2 className="solar-title solar-title--xl">
            We exist to <span className="solar-highlight">empower</span> individuals and businesses to{' '}
            <span className="solar-highlight">embrace</span> solar energy
          </h2>
          <div className="solar-copy-stack">
            <p className="solar-copy solar-copy--compact">
              At Solarise, we&apos;re driven by a deep-rooted passion for renewable energy and a
              commitment to a sustainable future. Our journey began with a simple but powerful idea: to
              harness the immense power of the sun and transform it into a source of clean, accessible
              energy for all.
            </p>
            <p className="solar-copy solar-copy--compact">
              The world is facing a growing need for sustainable energy sources. Climate change and
              environmental concerns are more pressing than ever. Solarise was founded to address these
              challenges and offer real solutions.
            </p>
          </div>
          <SolariseButton href="/about" tone="navy" size="sm">
            About Us
          </SolariseButton>
        </div>
      </section>

      <section className="solar-container solar-home-services">
        <SolariseStarburst className="solar-home-services__burst" tone="ghost" />

        <div className="solar-home-copy">
          <p className="solar-eyebrow">OUR SERVICES</p>
          <h2 className="solar-title solar-title--xl">
            Our expertise in <span className="solar-highlight">solar technology</span> ensures you get
            the most efficient and reliable solutions, whether you&apos;re a homeowner or a business owner
          </h2>
        </div>

        <div className="solar-chip-row">
          {homeServiceLinks.map((item) => (
            <Link key={item.label} href={item.href} className="solar-chip-link">
              <span>{item.label}</span>
              <span className="solar-chip-link__icon">
                <ChipArrow />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="solar-container solar-home-projects">
        <SolariseSectionHeader
          eyebrow="OUR WORKS"
          title="Recent Projects and Works"
          buttonHref="/projects"
          buttonLabel="See All"
        />

        <div className="solar-home-projects__grid">
          <SolariseMedia
            className="solar-media--lg"
            src="https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=900&q=80"
            alt="Large solar farm"
          />
          <SolariseProjectCard
            filled
            title={projectCards[0].title}
            meta={projectCards[0].meta}
            href={projectCards[0].href}
            image={projectCards[0].image}
          />
          <SolariseProjectCard
            filled
            title={projectCards[1].title}
            meta={projectCards[1].meta}
            href={projectCards[1].href}
            image={projectCards[1].image}
          />
          <SolariseMedia
            src="https://images.unsplash.com/photo-1548337138-e87d889cc369?w=700&q=80"
            alt="Solar installation team"
          />
        </div>
      </section>

      <div className="solar-container">
        <SolariseOfferBanner />
        <SolariseTestimonial />
        <SolariseJoinBanner />
      </div>

      <section className="solar-container solar-home-news">
        <SolariseSectionHeader
          eyebrow="NEWS"
          title="Recent News from Eco Planet"
          buttonHref="/news"
          buttonLabel="See All"
        />

        <div className="solar-home-news__grid">
          <SolariseNewsTile title={newsCards[0].title} href={newsCards[0].href} image={newsCards[0].image} />
          <SolariseNewsTile title={newsCards[1].title} href={newsCards[1].href} image={newsCards[1].image} />
          <SolariseNewsTile title={newsCards[2].title} href={newsCards[2].href} image={newsCards[2].image} />
        </div>
      </section>
    </SolariseShell>
  );
}

function ChipArrow() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h14" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
      <path
        d="m12 5 7 7-7 7"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  );
}
