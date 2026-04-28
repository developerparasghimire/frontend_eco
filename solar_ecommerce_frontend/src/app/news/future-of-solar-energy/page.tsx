import { SolariseNewsTile, SolariseShell } from '@/components/SolariseSite';
import { newsCards } from '@/data/solariseContent';

export default function NewsDetailPage() {
  return (
    <SolariseShell footerEmail="info@ecoplanet.com">
      <section className="solar-container solar-news-detail-hero">
        <div className="solar-news-detail-hero__box">
          <h1>The Future of Solar Energy: Innovations and Trends</h1>
          <p>Posted on October 23rd 2023 &nbsp; • &nbsp; Written by Amanda Nithe</p>
        </div>
      </section>

      <section className="solar-container solar-news-detail-layout">
        <aside className="solar-toc">
          <h3>Table of Content</h3>
          <ul>
            <li>Preface</li>
            <li>Advanced Solar Panel Energy</li>
            <li>Energy Storage Solutions</li>
            <li>Solar Integration in Urban Planning</li>
            <li>Solar Accessibility</li>
            <li>Conclusion</li>
          </ul>
        </aside>

        <article className="solar-article">
          <p>
            The sun has been a reliable source of energy for billions of years, and as technology
            advances, we continue to unlock new possibilities in harnessing its power. Solar energy, once
            considered a niche, is now a major player in the global energy landscape. The future of solar
            energy promises even more exciting innovations and trends that will shape the way we power our
            homes, businesses, and communities.
          </p>

          <h2>Advanced Solar Panel Energy</h2>
          <p>
            The heart of any solar system is the solar panel, and innovative technologies are making them
            more efficient and versatile. Bifacial solar panels, which can capture sunlight from both
            sides, are becoming increasingly popular. Additionally, perovskite solar cells hold promise for
            higher efficiency and lower production costs.
          </p>

          <h2>Energy Storage Solutions</h2>
          <p>
            The heart of any solar system is the solar panel, and innovative technologies are making them
            more efficient and versatile. Bifacial solar panels, which can capture sunlight from both
            sides, are becoming increasingly popular. Additionally, perovskite solar cells hold promise for
            higher efficiency and lower production costs.
          </p>

          <div className="solar-article__spacer" />

          <h2>Solar Integration in Urban Planning</h2>
          <p>
            Urban areas are increasingly incorporating solar energy into their infrastructure.
            Solar-integrated buildings and solar roads are becoming more common, allowing cities to harness
            the power of the sun while optimizing land use.
          </p>

          <h2>Solar Accessibility</h2>
          <p>
            Solar is becoming more accessible to a wider range of consumers. Community solar programs and
            innovative financing options make it easier for people from various income levels to invest in
            clean energy solutions.
          </p>

          <p>
            The future of solar energy is bright, driven by a commitment to sustainability, advancements
            in technology, and the increasing demand for clean, renewable power sources. As we look ahead,
            innovation will continue to play a pivotal role in shaping the solar industry, making it an
            increasingly accessible and efficient choice for individuals, businesses, and communities
            worldwide.
          </p>
        </article>
      </section>

      <section className="solar-container solar-related">
        <h2>Related News</h2>

        <div className="solar-related__grid">
          {newsCards.slice(1, 4).map((item) => (
            <SolariseNewsTile key={item.title} title={item.title} href={item.href} />
          ))}
        </div>
      </section>
    </SolariseShell>
  );
}
