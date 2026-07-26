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
    href: '/products',
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

const SPOTLIGHT_FEATURES = [
  'Up to 13.5 kWh usable storage capacity',
  'AI-powered energy management via app',
  'Seamless solar + grid integration',
  '10-year product warranty included',
];

const POWER_COMPARE = [
  {
    tag: 'Most Popular',
    title: 'Whole-Home Solar System',
    desc: 'A complete rooftop solar installation with battery backup — generate your own clean energy and slash your electricity bills permanently.',
    bullets: [
      'Custom 6–15 kW solar array',
      'Home battery storage optional',
      'Full professional installation',
      '5-year labour + product warranty',
    ],
    cta: 'Explore Home Systems',
    href: '/products',
    icon: (
      <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    tag: 'Flexible',
    title: 'Essential Backup Power',
    desc: 'Portable power stations and battery packs that keep your essential devices running during outages — no installation required.',
    bullets: [
      'Plug-and-play, no installation',
      'Solar-rechargeable options',
      'Portable & compact designs',
      '30-day hassle-free returns',
    ],
    cta: 'Shop Battery Backup',
    href: '/products?category=battery-storage',
    icon: (
      <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="7" width="16" height="11" rx="2" /><path d="M22 11v3" /><path d="M6 7V4" /><path d="M10 7V4" />
      </svg>
    ),
  },
];

const HOW_STEPS = [
  {
    num: '01',
    title: 'Choose Your System',
    desc: 'Browse our curated range of solar panels, batteries, and inverters. Use our free consultation to design the right system for your home.',
    icon: (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
      </svg>
    ),
  },
  {
    num: '02',
    title: 'Professional Installation',
    desc: 'Our CEC-certified installers handle everything — from design and permits to panels-on-roof. Usually completed in a single day.',
    icon: (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
  },
  {
    num: '03',
    title: 'Monitor & Save',
    desc: 'Track your solar production, battery charge, and energy savings in real time via our smart app. Watch your electricity bills disappear.',
    icon: (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
];

const TRUST_ITEMS = [
  {
    label: '5-Year Warranty',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    label: 'Free Shipping',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
  },
  {
    label: 'CEC Certified',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="8" r="6" /><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
      </svg>
    ),
  },
  {
    label: '30-Day Returns',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-3.51" />
      </svg>
    ),
  },
  {
    label: 'Interest-Free Finance',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  },
  {
    label: '24/7 Support',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
];

const PRESS_OUTLETS = [
  'ABC News', 'The Guardian', 'Choice', 'SBS', 'RenewEconomy', 'Solar Choice',
];

const EXPLORE_CARDS = [
  {
    title: 'Our Story',
    desc: 'Learn about our mission to make clean solar energy accessible for every Australian home and business.',
    href: '/about',
    image: 'https://images.unsplash.com/photo-1497440001374-f26997328c1b?w=600&q=80',
    cta: 'About Us',
  },
  {
    title: 'Solar Learning Hub',
    desc: 'Expert guides, installation tips, government rebate info and the latest news from the solar industry.',
    href: '/news',
    image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=600&q=80',
    cta: 'Read the Blog',
  },
  {
    title: 'Our Sustainability Pledge',
    desc: 'Every system we install helps reduce Australia\'s carbon footprint. Here\'s how we measure our impact.',
    href: '/about',
    image: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=600&q=80',
    cta: 'Learn More',
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

      {/* ── 3. Featured Product Spotlight ────────────── */}
      <section className="solar-spotlight" aria-label="Featured product">
        <div className="solar-container solar-spotlight__inner">
          <div className="solar-spotlight__copy">
            <p className="solar-spotlight__eyebrow">Featured System</p>
            <h2 className="solar-spotlight__title">
              Go beyond backup.<br />Go zero on bills.
            </h2>
            <p className="solar-spotlight__sub">
              Our flagship home solar + battery bundle gives you complete energy independence — generate, store, and monitor your own clean power.
            </p>
            <ul className="solar-spotlight__features">
              {SPOTLIGHT_FEATURES.map((f) => (
                <li key={f} className="solar-spotlight__feature">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <div className="solar-spotlight__ctas">
              <Link href="/products" className="solar-spotlight__btn-primary">Shop Now</Link>
              <Link href="/contact" className="solar-spotlight__btn-ghost">Get Free Quote →</Link>
            </div>
          </div>
          <div className="solar-spotlight__media">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1548337138-e87d889cc369?w=800&q=80"
              alt="Home battery storage system"
              className="solar-spotlight__img"
              loading="lazy"
            />
            <div className="solar-spotlight__badge">
              <span className="solar-spotlight__badge-label">Save up to</span>
              <span className="solar-spotlight__badge-value">$4,500</span>
              <span className="solar-spotlight__badge-sub">on your electricity bills yearly</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Top Picks (Tabbed Products) ───────────── */}
      <TabbedProductsSection />

      {/* ── 5. Power Solutions Comparison ────────────── */}
      <section className="solar-compare" aria-label="Power solutions">
        <div className="solar-container">
          <div className="solar-compare__header">
            <p className="solar-compare__eyebrow">Find Your Fit</p>
            <h2 className="solar-compare__title">Which solution is right for you?</h2>
          </div>
          <div className="solar-compare__grid">
            {POWER_COMPARE.map((card) => (
              <div key={card.title} className="solar-compare-card">
                <div className="solar-compare-card__top">
                  <span className="solar-compare-card__tag">{card.tag}</span>
                  <div className="solar-compare-card__icon">{card.icon}</div>
                  <h3 className="solar-compare-card__title">{card.title}</h3>
                  <p className="solar-compare-card__desc">{card.desc}</p>
                </div>
                <ul className="solar-compare-card__list">
                  {card.bullets.map((b) => (
                    <li key={b}>
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {b}
                    </li>
                  ))}
                </ul>
                <Link href={card.href} className="solar-compare-card__btn">{card.cta}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. Solution Scene Cards ───────────────────── */}
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

      {/* ── 7. How It Works ──────────────────────────── */}
      <section className="solar-how" aria-label="How it works">
        <div className="solar-container">
          <div className="solar-how__header">
            <p className="solar-how__eyebrow">Simple Process</p>
            <h2 className="solar-how__title">Solar made simple, from start to finish</h2>
          </div>
          <div className="solar-how__steps">
            {HOW_STEPS.map((step, i) => (
              <div key={step.num} className="solar-how__step">
                <div className="solar-how__step-num">{step.num}</div>
                <div className="solar-how__step-icon">{step.icon}</div>
                <h3 className="solar-how__step-title">{step.title}</h3>
                <p className="solar-how__step-desc">{step.desc}</p>
                {i < HOW_STEPS.length - 1 && (
                  <div className="solar-how__connector" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="solar-how__cta">
            <Link href="/contact" className="solar-btn solar-btn--primary">Book Free Consultation</Link>
          </div>
        </div>
      </section>

      {/* ── 8. Why Choose Us ─────────────────────────── */}
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

      {/* ── 9. Trust / Shop Benefits Strip ───────────── */}
      <div className="solar-trust-strip">
        <div className="solar-container solar-trust-strip__inner">
          {TRUST_ITEMS.map((t) => (
            <div key={t.label} className="solar-trust-strip__item">
              <span className="solar-trust-strip__icon">{t.icon}</span>
              <span className="solar-trust-strip__label">{t.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── 10. As Seen In / Press Bar ────────────────── */}
      <div className="solar-press-bar">
        <div className="solar-container solar-press-bar__inner">
          <span className="solar-press-bar__heading">As seen in</span>
          <div className="solar-press-bar__logos">
            {PRESS_OUTLETS.map((name) => (
              <span key={name} className="solar-press-bar__logo">{name}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── 11. Customer Testimonial ─────────────────── */}
      <div className="solar-container">
        <SolariseTestimonial />
      </div>

      {/* ── 12. Loyalty / Newsletter Cards ───────────── */}
      <section className="solar-loyalty" aria-label="Newsletter and referral">
        <div className="solar-container solar-loyalty__grid">
          {/* Card 1 — Newsletter */}
          <div className="solar-loyalty-card solar-loyalty-card--dark">
            <p className="solar-loyalty-card__eyebrow">Members Only</p>
            <h3 className="solar-loyalty-card__title">Get 5% off your first order</h3>
            <p className="solar-loyalty-card__desc">
              Join thousands of Australians saving on clean energy. Subscribe for exclusive deals, rebate news, and installation tips.
            </p>
            <form className="solar-loyalty-card__form" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Your email address" className="solar-loyalty-card__input" aria-label="Email address" />
              <button type="submit" className="solar-loyalty-card__btn">Subscribe</button>
            </form>
            <p className="solar-loyalty-card__fine">No spam. Unsubscribe any time.</p>
          </div>
          {/* Card 2 — Refer a Friend */}
          <div className="solar-loyalty-card solar-loyalty-card--light">
            <p className="solar-loyalty-card__eyebrow">Referral Program</p>
            <h3 className="solar-loyalty-card__title">Refer a friend,<br />earn cash rewards</h3>
            <p className="solar-loyalty-card__desc">
              Know someone who wants solar? Refer them to Eco Planet Solar and earn up to $250 cash for every successful installation.
            </p>
            <ul className="solar-loyalty-card__perks">
              <li>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
                Up to $250 per successful referral
              </li>
              <li>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
                No limit on referrals
              </li>
              <li>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
                Paid within 30 days of installation
              </li>
            </ul>
            <Link href="/contact" className="solar-loyalty-card__link-btn">Start Referring →</Link>
          </div>
        </div>
      </section>

      {/* ── 13. Brand Explore Cards ───────────────────── */}
      <section className="solar-explore-cards" aria-label="About and resources">
        <div className="solar-container">
          <div className="solar-explore-cards__header">
            <p className="solar-explore-cards__eyebrow">Discover More</p>
            <h2 className="solar-explore-cards__title">Learn about Eco Planet Solar</h2>
          </div>
          <div className="solar-explore-cards__grid">
            {EXPLORE_CARDS.map((card) => (
              <Link key={card.title} href={card.href} className="solar-explore-card">
                <div className="solar-explore-card__img-wrap">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={card.image} alt={card.title} loading="lazy" />
                </div>
                <div className="solar-explore-card__body">
                  <h3 className="solar-explore-card__title">{card.title}</h3>
                  <p className="solar-explore-card__desc">{card.desc}</p>
                  <span className="solar-explore-card__cta">{card.cta} →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 14. Latest News ───────────────────────────── */}
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

      {/* ── 15. Join / Email Capture CTA ─────────────── */}
      <div className="solar-container">
        <SolariseJoinBanner />
      </div>
    </SolariseShell>
  );
}
