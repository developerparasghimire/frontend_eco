import type { Metadata } from 'next';
import Link from 'next/link';
import {
  SolariseJoinBanner,
  SolariseNewsTile,
  SolariseSectionHeader,
  SolariseShell,
  SolariseTestimonial,
} from '@/components/SolariseSite';
import { TabbedProductsSection } from '@/components/products/TabbedProductsSection';
import { homeStats, newsCards } from '@/data/solariseContent';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';

export const metadata: Metadata = {
  title: 'Eco Planet Solar — Harness the Power of the Sun',
  description:
    'Eco Planet Solar provides premium solar panels, inverters, and complete rooftop installation for homes and businesses across Australia. Get a free quote today.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Eco Planet Solar — Harness the Power of the Sun',
    description:
      'Premium solar panels, batteries & complete rooftop installation. CEC approved. Australian owned.',
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
    telephone: '+61734226150',
    contactType: 'customer service',
    email: 'info@ecoplanet.eco',
    areaServed: 'AU',
    availableLanguage: ['English'],
  },
};

const SOLUTIONS = [
  {
    tag: 'Residential',
    title: 'Home Backup Power',
    cta: 'Explore systems',
    href: '/products',
    image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&q=80',
  },
  {
    tag: 'Commercial',
    title: 'Business Solar Solutions',
    cta: 'Learn more',
    href: '/services',
    image: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800&q=80',
  },
  {
    tag: 'Off-Grid',
    title: 'Energy Independence',
    cta: 'Discover more',
    href: '/products',
    image: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=800&q=80',
  },
  {
    tag: 'Storage',
    title: 'Battery Storage Systems',
    cta: 'Shop batteries',
    href: '/products',
    image: 'https://images.unsplash.com/photo-1548337138-e87d889cc369?w=800&q=80',
  },
];

const WHY_ITEMS = [
  {
    title: 'CEC Approved Retailer',
    text: 'We are certified by the Clean Energy Council — Australia\'s highest solar quality standard.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    title: '5-Year Installation Warranty',
    text: 'Every installation is backed by a comprehensive 5-year labour warranty for your peace of mind.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    title: 'Premium Products Only',
    text: 'We source only Tier-1 solar panels and batteries from globally recognised manufacturers.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  {
    title: 'Australian Owned',
    text: 'We\'re proudly Australian owned and operated, with local experts who understand your needs.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
];

export default function HomePage() {
  return (
    <SolariseShell footerEmail="info@ecoplanet.eco" footerPhone="07 3422 6150">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
      />

      {/* ── 1. Full-Bleed Hero ───────────────────────── */}
      <section className="solar-hero-v2" aria-label="Hero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1600&q=80"
          alt="Solar panels on a rooftop at sunset"
          className="solar-hero-v2__bg"
          fetchPriority="high"
        />
        <div className="solar-hero-v2__overlay" aria-hidden="true" />
        <div className="solar-hero-v2__content">
          <p className="solar-hero-v2__eyebrow">CEC Approved · Australian Owned</p>
          <h1 className="solar-hero-v2__title">
            Harness the<br />power of the sun
          </h1>
          <p className="solar-hero-v2__sub">
            Premium solar panels, batteries and installation for homes and businesses across Australia.
          </p>
          <div className="solar-hero-v2__ctas">
            <Link href="/products" className="solar-hero-v2__btn-primary">
              Shop Solar
            </Link>
            <Link href="/contact" className="solar-hero-v2__btn-outline">
              Get Free Quote
            </Link>
          </div>
        </div>
        <div className="solar-hero-v2__scroll" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
          Scroll
        </div>
      </section>

      {/* ── 2. Stats Bar ─────────────────────────────── */}
      <div className="solar-stats-bar">
        <div className="solar-stats-bar__inner">
          {homeStats.map((s) => (
            <div key={s.value} className="solar-stats-bar__item">
              <strong className="solar-stats-bar__value">{s.value}</strong>
              <span className="solar-stats-bar__label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── 3. Tabbed Products ────────────────────────── */}
      <TabbedProductsSection />

      {/* ── 4. Solution Cards ─────────────────────────── */}
      <section className="solar-solutions">
        <div className="solar-solutions__inner">
          <div className="solar-solutions__header">
            <p className="solar-solutions__eyebrow">Explore by Use Case</p>
            <h2 className="solar-solutions__title">Find the Right Solar Solution</h2>
          </div>
          <div className="solar-solutions__grid">
            {SOLUTIONS.map((s) => (
              <Link key={s.title} href={s.href} className="solar-solution-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.image} alt={s.title} className="solar-solution-card__bg" loading="lazy" />
                <div className="solar-solution-card__overlay" aria-hidden="true" />
                <div className="solar-solution-card__content">
                  <span className="solar-solution-card__tag">{s.tag}</span>
                  <h3 className="solar-solution-card__title">{s.title}</h3>
                  <span className="solar-solution-card__cta">
                    {s.cta}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Why Choose Us ─────────────────────────── */}
      <section className="solar-why">
        <div className="solar-why__inner">
          <div className="solar-why__header">
            <p className="solar-why__eyebrow">Why Eco Planet Solar</p>
            <h2 className="solar-why__title">Trusted by thousands of Australians</h2>
          </div>
          <div className="solar-why__grid">
            {WHY_ITEMS.map((item) => (
              <div key={item.title} className="solar-why-item">
                <div className="solar-why-item__icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. Testimonial ───────────────────────────── */}
      <div className="solar-container">
        <SolariseTestimonial />
      </div>

      {/* ── 7. Latest News ───────────────────────────── */}
      <section className="solar-container solar-home-news">
        <SolariseSectionHeader
          eyebrow="NEWS"
          title="Latest from Eco Planet Solar"
          buttonHref="/news"
          buttonLabel="See All"
        />
        <div className="solar-home-news__grid">
          <SolariseNewsTile title={newsCards[0].title} href={newsCards[0].href} image={newsCards[0].image} />
          <SolariseNewsTile title={newsCards[1].title} href={newsCards[1].href} image={newsCards[1].image} />
          <SolariseNewsTile title={newsCards[2].title} href={newsCards[2].href} image={newsCards[2].image} />
        </div>
      </section>

      {/* ── 8. Join CTA ──────────────────────────────── */}
      <div className="solar-container">
        <SolariseJoinBanner />
      </div>
    </SolariseShell>
  );
}
