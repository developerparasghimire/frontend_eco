import { SolariseShell } from '@/components/SolariseSite';

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <SolariseShell footerEmail="info@ecoplanet.eco" footerPhone="07 3422 6150">
      {children}
    </SolariseShell>
  );
}
