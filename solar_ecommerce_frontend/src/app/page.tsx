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

export default function HomePage() {
  return (
    <SolariseShell footerEmail="info@ecoplanet.com">
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

        <div aria-hidden="true" />
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
        <div />

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
          <SolariseMedia className="solar-media--lg" />
          <SolariseProjectCard
            filled
            title={projectCards[0].title}
            meta={projectCards[0].meta}
            href={projectCards[0].href}
          />
          <SolariseProjectCard
            filled
            title={projectCards[1].title}
            meta={projectCards[1].meta}
            href={projectCards[1].href}
          />
          <SolariseMedia />
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
          <SolariseNewsTile title={newsCards[0].title} href={newsCards[0].href} />
          <SolariseNewsTile title={newsCards[1].title} href={newsCards[1].href} />
          <SolariseNewsTile title="A Step-by-Step Guide to Installation" href={newsCards[2].href} />
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
