import type { Metadata } from 'next';
import Link from 'next/link';
import { SolariseShell } from '@/components/SolariseSite';

export const metadata: Metadata = {
  title: 'Shipping Information | Eco Planet Solar',
  description: 'Free shipping on orders over $500. Learn about delivery times, tracking, and shipping options.',
  alternates: { canonical: '/shipping' },
};

export default function ShippingPage() {
  return (
    <SolariseShell footerEmail="info@ecoplanet.eco" footerPhone="07 3422 6150">
      {/* Hero */}
      <div className="policy-hero">
        <div className="policy-hero__inner">
          <p className="policy-hero__eyebrow">Orders & Delivery</p>
          <h1 className="policy-hero__title">Shipping Information</h1>
          <p className="policy-hero__sub">Fast, reliable delivery to anywhere in Australia.</p>
        </div>
      </div>

      <div className="policy-shell">
        {/* Shipping highlights */}
        <div className="shipping-cards">
          <div className="shipping-card">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="28" height="28" aria-hidden="true"><rect x="1" y="3" width="15" height="13" rx="2"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
            <strong>Free Shipping</strong>
            <span>On all orders over $500</span>
          </div>
          <div className="shipping-card">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="28" height="28" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <strong>2–5 Business Days</strong>
            <span>Metro delivery</span>
          </div>
          <div className="shipping-card">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="28" height="28" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <strong>Australia-Wide</strong>
            <span>We deliver everywhere</span>
          </div>
          <div className="shipping-card">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="28" height="28" aria-hidden="true"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
            <strong>Tracked Delivery</strong>
            <span>Real-time order tracking</span>
          </div>
        </div>

        <div className="policy-section">
          <h2 className="policy-section__title">Shipping Rates</h2>
          <div className="policy-section__body">
            <div className="shipping-table">
              <div className="shipping-table__row shipping-table__row--head">
                <span>Order Value</span>
                <span>Standard</span>
                <span>Express</span>
              </div>
              <div className="shipping-table__row">
                <span>Under $500</span>
                <span>$15 flat rate</span>
                <span>$29 flat rate</span>
              </div>
              <div className="shipping-table__row">
                <span>$500 and over</span>
                <span className="text-green">FREE</span>
                <span>$19 flat rate</span>
              </div>
            </div>
            <p style={{ marginTop: 16, fontSize: 14, color: '#64748b' }}>
              Large items (heavy panels, batteries &gt; 50kg) may require a freight quote. We will contact you if this applies to your order.
            </p>
          </div>
        </div>

        <div className="policy-section">
          <h2 className="policy-section__title">Estimated Delivery Times</h2>
          <div className="policy-section__body">
            <div className="shipping-table">
              <div className="shipping-table__row shipping-table__row--head">
                <span>Location</span>
                <span>Standard</span>
                <span>Express</span>
              </div>
              <div className="shipping-table__row">
                <span>Sydney / Melbourne / Brisbane</span>
                <span>2–3 business days</span>
                <span>Next business day</span>
              </div>
              <div className="shipping-table__row">
                <span>Adelaide / Perth / Hobart</span>
                <span>3–5 business days</span>
                <span>2–3 business days</span>
              </div>
              <div className="shipping-table__row">
                <span>Regional / Rural</span>
                <span>5–10 business days</span>
                <span>3–6 business days</span>
              </div>
              <div className="shipping-table__row">
                <span>Remote Areas</span>
                <span>10–15 business days</span>
                <span>Quote required</span>
              </div>
            </div>
            <p style={{ marginTop: 16, fontSize: 14, color: '#64748b' }}>
              All delivery estimates are from the date of dispatch, not order placement. Orders placed before 12pm AEST are typically dispatched the same business day.
            </p>
          </div>
        </div>

        <div className="policy-section">
          <h2 className="policy-section__title">Order Tracking</h2>
          <div className="policy-section__body">
            <p>Once your order has shipped, you will receive a confirmation email with your tracking number. You can track your order at any time:</p>
            <ul style={{ marginTop: 12, paddingLeft: 20, display: 'grid', gap: 6 }}>
              <li>Via the link in your shipping confirmation email</li>
              <li>Through your <Link href="/dashboard/orders" style={{ color: 'var(--solar-green)', fontWeight: 600 }}>account order history</Link></li>
              <li>By contacting our team with your order number</li>
            </ul>
          </div>
        </div>

        <div className="policy-section">
          <h2 className="policy-section__title">Delivery Conditions</h2>
          <div className="policy-section__body">
            <p>Our couriers require a signature on delivery for orders over $200. If no one is available to sign, the driver will leave a card and the item will be held at your nearest collection point.</p>
            <p style={{ marginTop: 12 }}>Please ensure your delivery address is correct at checkout. We cannot be held responsible for delays caused by incorrect addresses. Address changes after an order is dispatched may incur a redirection fee.</p>
          </div>
        </div>

        <div className="policy-contact-box">
          <h3>Questions about your delivery?</h3>
          <p>Contact our customer service team with your order number and we&apos;ll help straight away.</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 16 }}>
            <Link href="/contact" className="solar-hero-v2__btn-primary" style={{ textDecoration: 'none' }}>Contact Us</Link>
            <a href="tel:0734226150" className="solar-hero-v2__btn-outline" style={{ textDecoration: 'none', borderColor: 'var(--solar-navy)', color: 'var(--solar-navy)' }}>07 3422 6150</a>
          </div>
        </div>
      </div>
    </SolariseShell>
  );
}
