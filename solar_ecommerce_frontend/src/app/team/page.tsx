import type { Metadata } from 'next';

import { SolariseMedia, SolarisePageHero, SolariseShell, SolariseTeamCard } from '@/components/SolariseSite';
import { teamMembers } from '@/data/solariseContent';

export const metadata: Metadata = {
  title: 'Our Team',
  description:
    'Meet the experts behind Eco Planet Solar — a passionate team of engineers, energy consultants and sustainability advocates dedicated to clean energy.',
  alternates: { canonical: '/team' },
  openGraph: {
    title: 'Our Team — Eco Planet Solar',
    description: 'Meet the engineers and energy experts powering Eco Planet Solar.',
    url: '/team',
  },
};

export default function TeamPage() {
  return (
    <SolariseShell footerEmail="info@ecoplanet.eco">
      <SolarisePageHero
        eyebrow="OUR TEAM"
        title="The people behind Eco Planet Solar"
        subtitle="A passionate team of engineers, energy consultants, and sustainability advocates working together to power a cleaner future."
        image="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600&q=80"
        height="md"
      />

      <section className="solar-container solar-team-grid">
        {teamMembers.map(([name, role, active, image]) => (
          <div key={name} className="solar-team-slot">
            <SolariseMedia
              src={image}
              alt={`${name} — ${role}`}
            />
            <SolariseTeamCard name={name} role={role} active={Boolean(active)} />
          </div>
        ))}
      </section>
    </SolariseShell>
  );
}
