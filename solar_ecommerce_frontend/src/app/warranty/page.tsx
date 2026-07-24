import type { Metadata } from 'next';
import Link from 'next/link';
import { SolariseShell } from '@/components/SolariseSite';

export const metadata: Metadata = {
  title: 'Warranty | Eco Planet Solar',
  description: 'Learn about Eco Planet Solar\'s 5-year installation warranty and product warranty terms.',
  alternates: { canonical: '/warranty' },
};

const SECTIONS = [
  {
    title: '5-Year Installation Warranty',
    body: `All installations carried out by Eco Planet Solar's CEC-accredited technicians are covered by a comprehensive 5-year workmanship warranty from the date of installation.

This warranty covers:
• All labour and workmanship related to the physical installation of your solar system
• Roof penetrations, mounting hardware, and cabling carried out by our team
• System commissioning and grid connection

This warranty does not cover damage caused by events outside our control, including storms, hail, falling objects, vermin, or modifications made by third parties.`,
  },
  {
    title: 'Product Warranties',
    body: `All products sold by Eco Planet Solar carry manufacturer warranties. Warranty periods vary by product type:

Solar Panels — 10–12 year product warranty + 25-year performance guarantee (minimum 80% output)
Inverters — 5–10 years (brand dependent)
Battery Storage — 10 years or rated cycle count, whichever comes first
Mounting Systems — 10 years
Cables & Connectors — 5 years

Refer to your product documentation for the specific terms applicable to your equipment.`,
  },
  {
    title: 'How to Make a Warranty Claim',
    body: `To submit a warranty claim:

1. Contact our support team at info@ecoplanet.eco or call 07 3422 6150
2. Provide your name, address, order number, and a description of the issue
3. Our team will assess the claim and schedule a diagnostic visit if required
4. Defective products will be repaired or replaced at no charge within the warranty period

We aim to respond to all warranty enquiries within 1 business day.`,
  },
  {
    title: 'Exclusions',
    body: `The following are not covered under warranty:

• Damage caused by misuse, neglect, or failure to maintain the system
• Damage caused by natural disasters, lightning, floods, or acts of God
• Modifications made to the system by parties other than Eco Planet Solar
• Normal wear and tear
• Cosmetic damage that does not affect performance
• Consumable parts (fuses, connectors) outside the warranty period`,
  },
  {
    title: 'Product Returns',
    body: `For products purchased but not yet installed, please see our Returns & Refunds Policy. Unused products in original condition may be returned within 30 days of receipt.`,
  },
];

export default function WarrantyPage() {
  return (
    <SolariseShell footerEmail="info@ecoplanet.eco" footerPhone="07 3422 6150">
      {/* Hero */}
      <div className="policy-hero">
        <div className="policy-hero__inner">
          <p className="policy-hero__eyebrow">Support</p>
          <h1 className="policy-hero__title">Warranty Information</h1>
          <p className="policy-hero__sub">We stand behind every installation and every product we sell.</p>
        </div>
      </div>

      {/* Warranty cards */}
      <div className="policy-shell">
        <div className="warranty-badges">
          <div className="warranty-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="32" height="32" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <strong>5-Year</strong>
            <span>Workmanship Warranty</span>
          </div>
          <div className="warranty-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="32" height="32" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <strong>25-Year</strong>
            <span>Panel Performance Guarantee</span>
          </div>
          <div className="warranty-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="32" height="32" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
            <strong>CEC</strong>
            <span>Approved Installer</span>
          </div>
          <div className="warranty-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="32" height="32" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            <strong>24-hr</strong>
            <span>Support Response</span>
          </div>
        </div>

        {SECTIONS.map((s) => (
          <div key={s.title} className="policy-section">
            <h2 className="policy-section__title">{s.title}</h2>
            <div className="policy-section__body">
              {s.body.split('\n\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>
        ))}

        <div className="policy-contact-box">
          <h3>Need to make a warranty claim?</h3>
          <p>Our support team is available Monday–Friday, 8am–5pm AEST.</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 16 }}>
            <Link href="/contact" className="solar-hero-v2__btn-primary" style={{ textDecoration: 'none' }}>Contact Support</Link>
            <a href="mailto:info@ecoplanet.eco" className="solar-hero-v2__btn-outline" style={{ textDecoration: 'none', borderColor: 'var(--solar-navy)', color: 'var(--solar-navy)' }}>info@ecoplanet.eco</a>
          </div>
        </div>
      </div>
    </SolariseShell>
  );
}
