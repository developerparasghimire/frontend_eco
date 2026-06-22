import { Outfit } from 'next/font/google';
import './globals.css';
import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import { Providers } from '@/components/providers/Providers';
import { CookieBanner } from '@/components/ui/CookieBanner';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';

export const metadata: Metadata = {
  title: {
    default: 'Eco Planet Solar — Premium Solar Panels & Installation',
    template: '%s | Eco Planet Solar',
  },
  description:
    'Shop high-efficiency solar panels, inverters and complete home installation packages from Eco Planet Solar. Trusted by thousands across India.',
  metadataBase: new URL(SITE_URL),
  keywords: [
    'solar panels', 'solar energy', 'solar installation', 'inverter',
    'home solar system', 'rooftop solar', 'renewable energy India', 'Eco Planet Solar',
  ],
  authors: [{ name: 'Eco Planet Solar', url: SITE_URL }],
  creator: 'Eco Planet Solar',
  publisher: 'Eco Planet Solar',
  openGraph: {
    siteName: 'Eco Planet Solar',
    type: 'website',
    locale: 'en_IN',
    url: SITE_URL,
    title: 'Eco Planet Solar — Premium Solar Panels & Installation',
    description:
      'Shop high-efficiency solar panels, inverters and complete home installation packages from Eco Planet Solar.',
    images: [
      {
        url: '/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'Eco Planet Solar',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@EcoPlanetSolar',
    creator: '@EcoPlanetSolar',
    title: 'Eco Planet Solar — Premium Solar Panels & Installation',
    description:
      'Shop high-efficiency solar panels, inverters and complete home installation packages from Eco Planet Solar.',
    images: ['/og-default.jpg'],
  },
  alternates: {
    canonical: SITE_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={outfit.className}>
        <Providers>{children}</Providers>
        <Toaster position="bottom-right" richColors closeButton />
        <CookieBanner />
        <a
          href="https://profiles.eco/ecoplanet?ref=tm"
          rel="noopener"
          style={{ position: 'fixed', bottom: '1rem', right: '1rem', zIndex: 9999 }}
          aria-label=".eco profile for ecoplanet.eco"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="eco-trustmark"
            alt=".eco profile for ecoplanet.eco"
            src="https://trust.profiles.eco/ecoplanet/eco-button.svg?color=%239F1744"
            style={{ maxWidth: '4rem' }}
          />
        </a>
      </body>
    </html>
  );
}
