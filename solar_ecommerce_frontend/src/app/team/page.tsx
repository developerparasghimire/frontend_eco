import { SolariseMedia, SolariseShell, SolariseTeamCard } from '@/components/SolariseSite';
import { teamMembers } from '@/data/solariseContent';

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
