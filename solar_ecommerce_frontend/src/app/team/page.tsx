import type { Metadata } from 'next';

import { SolariseMedia, SolariseShell, SolariseTeamCard } from '@/components/SolariseSite';
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
    <SolariseShell footerEmail="info@solarise.com">
      <section className="solar-container solar-spacer solar-spacer--xl" />

      <section className="solar-container solar-team-grid">
        {teamMembers.map(([name, role, active]) => (
          <div key={name} className="solar-team-slot">
            <SolariseMedia />
            <SolariseTeamCard name={name} role={role} active={Boolean(active)} />
          </div>
        ))}
      </section>
    </SolariseShell>
  );
}
