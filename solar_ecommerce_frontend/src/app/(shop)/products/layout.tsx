import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Solar Shop — Panels, Inverters & Batteries',
  description:
    "Browse Eco Planet Solar's full range of high-efficiency solar panels, inverters, batteries and accessories. Free shipping on qualifying orders across Australia.",
  keywords: [
    'buy solar panels', 'solar inverter', 'solar battery', 'solar accessories',
    'best solar panels Australia', 'solar shop online', 'rooftop solar kit',
  ],
  alternates: { canonical: '/products' },
  openGraph: {
    title: 'Solar Shop — Panels, Inverters & Batteries | Eco Planet Solar',
    description:
      'High-efficiency solar panels, inverters and batteries for home and business. Shop online with fast delivery across Australia.',
    url: '/products',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Solar Shop — Eco Planet Solar',
    description: 'High-efficiency solar panels, inverters and batteries. Fast delivery across Australia.',
  },
};

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
