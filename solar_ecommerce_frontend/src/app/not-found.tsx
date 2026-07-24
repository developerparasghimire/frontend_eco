import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="notfound-shell">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1600&q=80"
        alt=""
        className="notfound-bg"
        aria-hidden="true"
      />
      <div className="notfound-overlay" aria-hidden="true" />
      <div className="notfound-content">
        <p className="notfound-code">404</p>
        <h1 className="notfound-title">Page not found</h1>
        <p className="notfound-sub">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="notfound-ctas">
          <Link href="/" className="solar-hero-v2__btn-primary">
            Back to Home
          </Link>
          <Link href="/products" className="solar-hero-v2__btn-outline">
            Browse Products
          </Link>
        </div>
        <div className="notfound-links">
          <Link href="/faq">FAQ</Link>
          <Link href="/contact">Contact Us</Link>
          <Link href="/about">About Us</Link>
        </div>
      </div>
    </div>
  );
}
