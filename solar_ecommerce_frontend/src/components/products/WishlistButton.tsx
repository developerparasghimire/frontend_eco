'use client';

import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { useAddToWishlist, useRemoveFromWishlist, useWishlist } from '@/hooks/useWishlist';
import { cn } from '@/lib/cn';
import { useAuthStatus } from '@/store/auth';

interface WishlistButtonProps {
  productId: string;
  variant?: 'button' | 'icon';
  className?: string;
  redirectPath?: string;
}

/**
 * Toggles wishlist membership for a product. In `icon` mode it renders a small
 * heart for use inside product cards; in `button` mode it renders a labelled
 * outlined button for the detail page.
 */
export function WishlistButton({
  productId,
  variant = 'button',
  className,
  redirectPath,
}: WishlistButtonProps) {
  const router = useRouter();
  const status = useAuthStatus();
  const wishlist = useWishlist();
  const add = useAddToWishlist();
  const remove = useRemoveFromWishlist();

  const items = wishlist.data?.results ?? [];
  const existing = items.find((i) => i.product === productId);
  const isWished = Boolean(existing);
  const pending = add.isPending || remove.isPending;

  const onClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (status !== 'authenticated') {
      router.push(`/login${redirectPath ? `?next=${encodeURIComponent(redirectPath)}` : ''}`);
      return;
    }
    try {
      if (existing) await remove.mutateAsync(existing.id);
      else await add.mutateAsync(productId);
    } catch {
      /* surfaced via wishlist query state if needed */
    }
  };

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        aria-label={isWished ? 'Remove from wishlist' : 'Add to wishlist'}
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white/95 shadow-sm backdrop-blur transition',
          'hover:border-brand-300 hover:text-brand-600 disabled:opacity-50',
          isWished ? 'text-brand-600' : 'text-slate-500',
          className,
        )}
      >
        <Heart size={16} className={isWished ? 'fill-brand-500' : ''} />
      </button>
    );
  }

  return (
    <Button
      variant="outline"
      size="lg"
      onClick={onClick}
      loading={pending}
      className={className}
    >
      <Heart size={16} className={cn('mr-1.5', isWished && 'fill-brand-500 text-brand-600')} />
      {isWished ? 'Wishlisted' : 'Add to wishlist'}
    </Button>
  );
}
