import { Outfit } from 'next/font/google';
import './globals.css';
import type { Metadata } from 'next';

import { Providers } from '@/components/providers/Providers';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'Eco Planet Solar',
  description: 'Solar energy company website frontend',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={outfit.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
