import type { MetadataRoute } from 'next';

import { productsApi } from '@/services/api/products';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://ecoplanet.eco';

export const revalidate = 3600;

// Only list routes that actually exist — a sitemap entry that 404s is
// reported as a crawl error in Search Console.
const STATIC_ROUTES: Array<{ path: string; priority: number; freq: MetadataRoute.Sitemap[number]['changeFrequency'] }> = [
  { path: '',                             priority: 1.0, freq: 'weekly'  },
  { path: '/products',                    priority: 0.9, freq: 'daily'   },
  { path: '/about',                       priority: 0.7, freq: 'monthly' },
  { path: '/contact',                     priority: 0.8, freq: 'monthly' },
  { path: '/news',                        priority: 0.7, freq: 'weekly'  },
  { path: '/news/future-of-solar-energy', priority: 0.6, freq: 'monthly' },
  { path: '/faq',                         priority: 0.6, freq: 'monthly' },
  { path: '/shipping',                    priority: 0.5, freq: 'monthly' },
  { path: '/returns',                     priority: 0.5, freq: 'monthly' },
  { path: '/warranty',                    priority: 0.5, freq: 'monthly' },
  { path: '/terms',                       priority: 0.3, freq: 'yearly'  },
  { path: '/privacy',                     priority: 0.3, freq: 'yearly'  },
];

async function fetchAllProducts(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];
  let page = 1;
  try {
    while (true) {
      const result = await productsApi.list({ page });
      for (const p of result.results) {
        entries.push({
          url: `${SITE}/products/${p.slug}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.9,
        });
      }
      if (!result.next) break;
      page++;
      // Safety cap at 50 pages to avoid runaway fetches.
      if (page > 50) break;
    }
  } catch {
    // Sitemap should never break the build if the API is briefly unavailable.
  }
  return entries;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticUrls: MetadataRoute.Sitemap = STATIC_ROUTES.map(({ path, priority, freq }) => ({
    url: `${SITE}${path}`,
    lastModified: new Date(),
    changeFrequency: freq,
    priority,
  }));

  const productEntries = await fetchAllProducts();

  return [...staticUrls, ...productEntries];
}
