import { redirect } from 'next/navigation';

interface SearchPageProps {
  searchParams: { q?: string };
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  const q = searchParams.q?.trim();
  if (q) redirect(`/products?search=${encodeURIComponent(q)}`);
  redirect('/products');
}
