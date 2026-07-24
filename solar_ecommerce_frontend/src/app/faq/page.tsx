'use client';

import type { Metadata } from 'next';
import Link from 'next/link';
import { useState } from 'react';
import { SolariseShell } from '@/components/SolariseSite';

const FAQS = [
  {
    category: 'Getting Started',
    items: [
      {
        q: 'How does solar energy work?',
        a: 'Solar panels convert sunlight into direct current (DC) electricity using photovoltaic (PV) cells. An inverter then converts this DC power into alternating current (AC) electricity that your home can use. Excess energy can be stored in a battery or fed back into the grid.',
      },
      {
        q: 'Is my home suitable for solar?',
        a: 'Most homes are suitable for solar. The key factors are roof orientation (north-facing is ideal in Australia), roof angle, shading, and available roof space. Our team offers free site assessments to determine the best system for your home.',
      },
      {
        q: 'How long does installation take?',
        a: 'A standard residential installation takes 1–2 days. Larger commercial systems may take 3–5 days. We handle all permits and grid connection paperwork on your behalf.',
      },
      {
        q: 'What size system do I need?',
        a: 'System size depends on your electricity consumption and roof space. On average, Australian homes use 18–20 kWh per day, and a 6.6 kW system is the most popular choice. We\'ll analyse your electricity bills and recommend the optimal system size.',
      },
    ],
  },
  {
    category: 'Products & Equipment',
    items: [
      {
        q: 'What brands of solar panels do you sell?',
        a: 'We stock only Tier-1 solar panels from globally recognised manufacturers. All panels sold through our store carry full manufacturer warranties and meet Australian standards (AS/NZS 5033).',
      },
      {
        q: 'What is the difference between a solar panel and a solar generator?',
        a: 'A solar panel generates electricity from sunlight. A solar generator combines solar panels, a battery, and an inverter into a portable all-in-one unit. Solar generators are ideal for camping, caravanning, and off-grid use.',
      },
      {
        q: 'Do I need a battery with my solar system?',
        a: 'A battery is optional but highly recommended. Without a battery, excess solar energy is exported to the grid (at a lower feed-in tariff). With a battery, you can store that energy and use it at night, significantly reducing your electricity bill.',
      },
      {
        q: 'How long do solar panels last?',
        a: 'Quality solar panels typically last 25–30 years. Most manufacturer warranties guarantee at least 80% output performance after 25 years. Inverters typically last 10–15 years.',
      },
    ],
  },
  {
    category: 'Pricing & Finance',
    items: [
      {
        q: 'How much does a solar system cost?',
        a: 'A 6.6 kW system typically costs between $5,000–$9,000 after government rebates (STC). Prices vary based on panel brand, inverter type, and installation complexity. Contact us for a free quote tailored to your property.',
      },
      {
        q: 'What government rebates are available?',
        a: 'The Australian government offers Small-scale Technology Certificates (STCs) that significantly reduce the upfront cost of solar. The amount depends on your system size, location, and installation date. We automatically apply this discount at point of sale.',
      },
      {
        q: 'Do you offer finance options?',
        a: 'Yes. We work with several finance partners to offer interest-free and low-rate finance options. This means you can start saving on electricity immediately with $0 upfront in many cases.',
      },
      {
        q: 'How much will I save on electricity bills?',
        a: 'Most customers save 50–90% on their electricity bills. Savings depend on your energy usage, system size, tariff rates, and how much energy you self-consume versus export. Our team will provide a detailed savings estimate for your specific situation.',
      },
    ],
  },
  {
    category: 'Warranty & Support',
    items: [
      {
        q: 'What warranty do you offer on installation?',
        a: 'We provide a 5-year workmanship warranty on all installations carried out by our CEC-accredited installers. This covers any defects in installation workmanship.',
      },
      {
        q: 'What happens if my solar system stops working?',
        a: 'Contact our support team at info@ecoplanet.eco or call 07 3422 6150. We offer remote monitoring diagnostics and can usually identify issues without a site visit. If a site visit is required, we typically attend within 2–3 business days.',
      },
      {
        q: 'How do I monitor my solar system performance?',
        a: 'All our systems come with monitoring capability through the manufacturer\'s app. You can track real-time generation, consumption, and export data from your smartphone.',
      },
      {
        q: 'Are products returnable?',
        a: 'Yes. We offer a 30-day return policy on all unused, unopened products. Installed systems follow our warranty process. See our Returns Policy for full details.',
      },
    ],
  },
  {
    category: 'Shipping & Orders',
    items: [
      {
        q: 'Do you offer free shipping?',
        a: 'Yes — free standard shipping on all orders over $500 Australia-wide. Orders under $500 attract a flat $15 shipping fee.',
      },
      {
        q: 'How long does delivery take?',
        a: 'Metro areas: 2–5 business days. Regional areas: 5–10 business days. Express shipping is available at checkout for an additional fee.',
      },
      {
        q: 'Can I track my order?',
        a: 'Yes. Once your order ships, you\'ll receive a tracking number via email. You can also track orders from your account dashboard at any time.',
      },
    ],
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="faq-item">
      <button
        type="button"
        className="faq-item__btn"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="faq-item__q">{q}</span>
        <span className={`faq-item__icon${open ? ' faq-item__icon--open' : ''}`} aria-hidden="true">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>
      {open && <div className="faq-item__a">{a}</div>}
    </div>
  );
}

export default function FAQPage() {
  return (
    <SolariseShell footerEmail="info@ecoplanet.eco" footerPhone="07 3422 6150">
      {/* Hero */}
      <div className="policy-hero">
        <div className="policy-hero__inner">
          <p className="policy-hero__eyebrow">Support</p>
          <h1 className="policy-hero__title">Frequently Asked Questions</h1>
          <p className="policy-hero__sub">Everything you need to know about solar with Eco Planet Solar.</p>
        </div>
      </div>

      {/* Search hint */}
      <div className="faq-search-hint">
        <div className="faq-search-hint__inner">
          <p>Can&apos;t find your answer?</p>
          <Link href="/contact" className="faq-search-hint__link">Contact our team →</Link>
        </div>
      </div>

      {/* FAQ Sections */}
      <div className="faq-shell">
        {FAQS.map((section) => (
          <section key={section.category} className="faq-section">
            <h2 className="faq-section__title">{section.category}</h2>
            <div className="faq-list">
              {section.items.map((item) => (
                <FAQItem key={item.q} q={item.q} a={item.a} />
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* CTA */}
      <div className="policy-cta">
        <div className="policy-cta__inner">
          <h2>Still have questions?</h2>
          <p>Our solar experts are here to help. Get in touch for a free consultation.</p>
          <div className="policy-cta__btns">
            <Link href="/contact" className="solar-hero-v2__btn-primary" style={{ textDecoration: 'none' }}>Get Free Quote</Link>
            <a href="tel:0734226150" className="solar-hero-v2__btn-outline" style={{ textDecoration: 'none', borderColor: 'var(--solar-navy)', color: 'var(--solar-navy)' }}>07 3422 6150</a>
          </div>
        </div>
      </div>
    </SolariseShell>
  );
}
