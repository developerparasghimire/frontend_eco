import { ShopHeader } from '@/components/shop/ShopHeader';

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <ShopHeader />
      {children}
    </div>
  );
}
