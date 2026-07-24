import type { Metadata } from 'next';
import Link from 'next/link';
import { SolariseShell } from '@/components/SolariseSite';

export const metadata: Metadata = {
  title: 'Returns & Refunds | Eco Planet Solar',
  description: '30-day returns on unused products. Learn about our hassle-free returns and refunds policy.',
  alternates: { canonical: '/returns' },
};

export default function ReturnsPage() {
  return (
    <SolariseShell footerEmail="info@ecoplanet.eco" footerPhone="07 3422 6150">
      {/* Hero */}
      <div className="policy-hero">
        <div className="policy-hero__inner">
          <p className="policy-hero__eyebrow">Support</p>
          <h1 className="policy-hero__title">Returns &amp; Refunds</h1>
          <p className="policy-hero__sub">Shop with confidence. We make returns simple and hassle-free.</p>
        </div>
      </div>

      <div className="policy-shell">
        <div className="shipping-cards">
          <div className="shipping-card">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="28" height="28" aria-hidden="true"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
            <strong>30-Day Returns</strong>
            <span>On unused products</span>
          </div>
          <div className="shipping-card">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="28" height="28" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <strong>Full Refund</strong>
            <span>Returned in original condition</span>
          </div>
          <div className="shipping-card">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="28" height="28" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
            <strong>Easy Process</strong>
            <span>Simple online returns</span>
          </div>
          <div className="shipping-card">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="28" height="28" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
            <strong>Fast Refunds</strong>
            <span>Processed within 5 business days</span>
          </div>
        </div>

        <div className="policy-section">
          <h2 className="policy-section__title">Return Eligibility</h2>
          <div className="policy-section__body">
            <p>We accept returns on products that meet all of the following conditions:</p>
            <ul style={{ marginTop: 12, paddingLeft: 20, display: 'grid', gap: 8 }}>
              <li>Returned within <strong>30 days</strong> of the original delivery date</li>
              <li>In <strong>original, unused condition</strong> — not installed, assembled, or activated</li>
              <li>In <strong>original packaging</strong> with all accessories, manuals, and documentation included</li>
              <li>Accompanied by <strong>proof of purchase</strong> (order number or receipt)</li>
            </ul>
            <p style={{ marginTop: 16 }}>Items that have been installed, activated, or used cannot be returned under our standard returns policy. Please refer to the Warranty section for post-installation issues.</p>
          </div>
        </div>

        <div className="policy-section">
          <h2 className="policy-section__title">Non-Returnable Items</h2>
          <div className="policy-section__body">
            <p>The following items cannot be returned unless they are faulty:</p>
            <ul style={{ marginTop: 12, paddingLeft: 20, display: 'grid', gap: 8 }}>
              <li>Installed or activated solar panels and inverters</li>
              <li>Installed or activated battery systems</li>
              <li>Custom-ordered or special-order items</li>
              <li>Items damaged by the customer after delivery</li>
              <li>Items returned without original packaging</li>
            </ul>
          </div>
        </div>

        <div className="policy-section">
          <h2 className="policy-section__title">How to Return an Item</h2>
          <div className="policy-section__body">
            <div style={{ display: 'grid', gap: 20, marginTop: 4 }}>
              {[
                { step: '1', title: 'Contact us', body: 'Email info@ecoplanet.eco or call 07 3422 6150 with your order number and reason for return. We will respond within 1 business day.' },
                { step: '2', title: 'Receive return authorisation', body: 'We will send you a Return Merchandise Authorisation (RMA) number and return shipping label if eligible.' },
                { step: '3', title: 'Ship the item back', body: 'Pack the item securely in its original packaging and attach the RMA label. Drop it off at your nearest courier drop point.' },
                { step: '4', title: 'Receive your refund', body: 'Once we receive and inspect the item (usually 2–3 business days), your refund will be processed within 5 business days to your original payment method.' },
              ].map((s) => (
                <div key={s.step} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--solar-navy)', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 14, flexShrink: 0 }}>{s.step}</div>
                  <div>
                    <strong style={{ color: 'var(--solar-navy)', display: 'block', marginBottom: 4 }}>{s.title}</strong>
                    <p style={{ margin: 0, color: '#475569', fontSize: 15 }}>{s.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="policy-section">
          <h2 className="policy-section__title">Faulty or Damaged Items</h2>
          <div className="policy-section__body">
            <p>If your item arrives damaged or is faulty, please contact us within <strong>48 hours</strong> of delivery with photos of the damage. We will arrange a replacement or full refund at no cost to you, including return shipping.</p>
          </div>
        </div>

        <div className="policy-section">
          <h2 className="policy-section__title">Refund Processing</h2>
          <div className="policy-section__body">
            <p>Refunds are issued to the original payment method. Processing times:</p>
            <ul style={{ marginTop: 12, paddingLeft: 20, display: 'grid', gap: 8 }}>
              <li>Credit/Debit card: 5–10 business days after we process the refund</li>
              <li>PayPal: 1–3 business days</li>
              <li>Afterpay: 3–5 business days</li>
              <li>Bank transfer: 3–5 business days</li>
            </ul>
            <p style={{ marginTop: 12 }}>Original shipping costs are non-refundable unless the return is due to our error or a faulty product.</p>
          </div>
        </div>

        <div className="policy-contact-box">
          <h3>Ready to return or have a question?</h3>
          <p>Our support team will guide you through every step of the process.</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 16 }}>
            <Link href="/contact" className="solar-hero-v2__btn-primary" style={{ textDecoration: 'none' }}>Contact Us</Link>
            <a href="mailto:info@ecoplanet.eco" className="solar-hero-v2__btn-outline" style={{ textDecoration: 'none', borderColor: 'var(--solar-navy)', color: 'var(--solar-navy)' }}>Email Support</a>
          </div>
        </div>
      </div>
    </SolariseShell>
  );
}
