import type { Metadata } from 'next';

import { SolariseNewsTile, SolarisePageHero, SolariseSearchBar, SolariseShell } from '@/components/SolariseSite';
import { newsCards } from '@/data/solariseContent';

export const metadata: Metadata = {
  title: 'Solar Energy News & Insights',
  description:
    'Stay up to date with the latest solar energy news, industry trends, installation guides, and sustainability insights from Eco Planet Solar.',
  alternates: { canonical: '/news' },
  openGraph: {
    title: 'Solar Energy News & Insights — Eco Planet Solar',
    description: 'Latest solar energy news, trends and installation guides from Eco Planet Solar.',
    url: '/news',
  },
};

export default function NewsPage() {
  return (
    <SolariseShell footerEmail="info@ecoplanet.eco">
      <SolarisePageHero
        eyebrow="NEWS & INSIGHTS"
        title="Stay ahead with the latest in solar energy"
        subtitle="Industry trends, installation guides, and sustainability insights — all in one place."
        image="https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=1600&q=80"
        height="sm"
      />

      <section className="solar-container">
        <SolariseSearchBar placeholder="Search News Title..." actionText="Find News" />
      </section>

      <section className="solar-container solar-news-list">
        <SolariseNewsTile featured title={newsCards[0].title} href={newsCards[0].href} image={newsCards[0].image} />

        <div className="solar-news-grid">
          {newsCards.slice(1).map((item) => (
            <SolariseNewsTile key={item.title} title={item.title} href={item.href} image={item.image} />
          ))}
        </div>
      </section>
    </SolariseShell>
  );
}
