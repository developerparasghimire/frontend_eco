import { SolariseNewsTile, SolariseSearchBar, SolariseShell } from '@/components/SolariseSite';
import { newsCards } from '@/data/solariseContent';

export default function NewsPage() {
  return (
    <SolariseShell footerEmail="info@ecoplanet.com">
      <section className="solar-container solar-spacer solar-spacer--lg" />

      <section className="solar-container">
        <SolariseSearchBar placeholder="Search News Title..." actionText="Find News" />
      </section>

      <section className="solar-container solar-news-list">
        <SolariseNewsTile featured title={newsCards[0].title} href={newsCards[0].href} />

        <div className="solar-news-grid">
          {newsCards.slice(1).map((item) => (
            <SolariseNewsTile key={item.title} title={item.title} href={item.href} />
          ))}
        </div>
      </section>
    </SolariseShell>
  );
}
