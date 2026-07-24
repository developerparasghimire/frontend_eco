import { SolariseShell } from '@/components/SolariseSite';

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <SolariseShell footerEmail="info@ecoplanet.eco">
      {children}
    </SolariseShell>
  );
}
