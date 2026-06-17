import type { MetadataRoute } from 'next';

import { productsApi } from '@/services/api/products';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';

export const revalidate = 3600;

const STATIC_ROUTES: Array<{ path: string; priority: number; freq: MetadataRoute.Sitemap[number]['changeFrequency'] }> = [
  { path: '',                           priority: 1.0, freq: 'weekly'  },
  { path: '/products',                  priority: 0.9, freq: 'daily'   },
  { path: '/services',                  priority: 0.8, freq: 'monthly' },
  { path: '/services/consultation-assessment', priority: 0.7, freq: 'monthly' },
  { path: '/about',                     priority: 0.7, freq: 'monthly' },
  { path: '/projects',                  priority: 0.7, freq: 'monthly' },
  { path: '/projects/sunset-valley-solar-farm', priority: 0.6, freq: 'monthly' },
  { path: '/news',                      priority: 0.7, freq: 'weekly'  },
  { path: '/news/future-of-solar-energy', priority: 0.6, freq: 'monthly' },
  { path: '/team',                      priority: 0.6, freq: 'monthly' },
  { path: '/contact',                   priority: 0.8, freq: 'monthly' },
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
