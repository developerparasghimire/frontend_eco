import type { Metadata } from 'next';

import { ProductDetailView } from '@/components/products/ProductDetailView';
import { env } from '@/lib/env';
import type { ProductDetail } from '@/types/product';

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function fetchProduct(slug: string): Promise<ProductDetail | null> {
  try {
    const res = await fetch(`${env.apiUrl}/api/products/${slug}/`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return (await res.json()) as ProductDetail;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProduct(slug);
  if (!product) {
    return {
      title: 'Product not found',
      description: 'The product you are looking for is not available.',
    };
  }

  const title = `${product.name} – ${product.brand || 'EcoPlanet'}`;
  const description =
    product.description?.slice(0, 160) ||
    `Buy ${product.name} from EcoPlanet. ${product.warranty_years}-year warranty, ${product.delivery_days}-day delivery.`;
  const image = product.images?.[0]?.image ?? product.primary_image ?? undefined;
  const keywords = [
    product.name,
    product.brand,
    product.category_name,
    product.capacity,
    'solar',
    'renewable energy',
    ...(product.tags ? product.tags.split(',').map((t) => t.trim()) : []),
  ]
    .filter(Boolean)
    .join(', ');

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      type: 'website',
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : undefined,
    },
    alternates: {
      canonical: `/products/${product.slug}`,
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await fetchProduct(slug);

  const jsonLd = product
    ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.description,
        sku: product.sku,
        brand: { '@type': 'Brand', name: product.brand || 'EcoPlanet' },
        category: product.category_name,
        image: (product.images ?? []).map((i) => i.image).filter(Boolean),
        offers: {
          '@type': 'Offer',
          priceCurrency: 'AUD',
          price: product.discounted_price || product.price,
          availability: product.in_stock
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
          url: `/products/${product.slug}`,
        },
        ...(product.review_count > 0
          ? {
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: product.average_rating,
                reviewCount: product.review_count,
              },
            }
          : {}),
      }
    : null;

  const breadcrumbLd = product
    ? {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: '/' },
          { '@type': 'ListItem', position: 2, name: 'Shop', item: '/products' },
          {
            '@type': 'ListItem',
            position: 3,
            name: product.category_name,
            item: `/products?category=${product.category.slug}`,
          },
          {
            '@type': 'ListItem',
            position: 4,
            name: product.name,
            item: `/products/${product.slug}`,
          },
        ],
      }
    : null;

  return (
    <>
      {jsonLd ? (
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ) : null}
      {breadcrumbLd ? (
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
        />
      ) : null}
      <ProductDetailView slug={slug} />
    </>
  );
}
