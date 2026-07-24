import type { Metadata } from 'next';
import { SolariseShell } from '@/components/SolariseSite';

export const metadata: Metadata = {
  title: 'Terms & Conditions | Eco Planet Solar',
  description: 'Eco Planet Solar terms and conditions for purchases, installations, and use of our website.',
  alternates: { canonical: '/terms' },
};

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    body: `By accessing our website or placing an order, you agree to be bound by these Terms & Conditions and our Privacy Policy. If you do not agree, please do not use our website or services.`,
  },
  {
    title: '2. Products & Pricing',
    body: `All prices are in Australian Dollars (AUD) and are inclusive of GST unless otherwise stated. We reserve the right to correct pricing errors and to change prices without notice. We will notify you of any pricing discrepancy before your order is fulfilled.

Product images are for illustrative purposes only. Actual products may vary slightly from images shown.`,
  },
  {
    title: '3. Orders & Payment',
    body: `By placing an order, you confirm that you are over 18 years of age and are authorised to use the payment method provided.

We accept Visa, Mastercard, American Express, PayPal, Afterpay, and direct bank transfer. Payment is taken at the time of order placement.

We reserve the right to cancel or refuse any order at our discretion. If we cancel an order after payment, you will receive a full refund within 5 business days.`,
  },
  {
    title: '4. Shipping & Delivery',
    body: `Delivery terms are outlined in our Shipping Information page. We are not responsible for delays caused by circumstances outside our control, including courier delays, extreme weather, or natural disasters.

Risk of damage or loss passes to you upon delivery. Please inspect goods upon delivery and report any damage within 48 hours.`,
  },
  {
    title: '5. Installation Services',
    body: `Where installation services are purchased, they will be performed by our CEC-accredited installers in accordance with all applicable Australian standards and regulations.

You are responsible for ensuring safe and legal access to the installation site. Installation services cannot commence if site conditions are deemed unsafe by our installers.

All installation work is subject to local council approvals and grid connection requirements where applicable.`,
  },
  {
    title: '6. Returns & Refunds',
    body: `Our returns policy is outlined in detail in our Returns & Refunds page. Nothing in these terms limits your rights under Australian Consumer Law (ACL). Where a product has a major fault under the ACL, you are entitled to a refund, replacement, or compensation.`,
  },
  {
    title: '7. Warranties',
    body: `Product warranties are provided by manufacturers. Our installation workmanship warranty is detailed in our Warranty Information page. These warranties are in addition to consumer guarantees provided under the ACL, which cannot be excluded.`,
  },
  {
    title: '8. Limitation of Liability',
    body: `To the fullest extent permitted by law, Eco Planet Solar's liability for any claim arising from these terms or the supply of products or services is limited to:

• The purchase price of the product or service in question; or
• Repair or replacement of the product

We are not liable for indirect, consequential, or incidental damages arising from your use of our products or services.`,
  },
  {
    title: '9. Intellectual Property',
    body: `All content on this website, including text, images, logos, and design, is the property of Eco Planet Solar or its licensors and is protected by Australian and international copyright law. You may not reproduce, distribute, or use our content without written permission.`,
  },
  {
    title: '10. Website Use',
    body: `You agree not to use our website for any unlawful purpose, to transmit any harmful or malicious content, or to attempt to gain unauthorised access to any part of our systems.

We reserve the right to suspend or terminate your account if these terms are breached.`,
  },
  {
    title: '11. Governing Law',
    body: `These Terms & Conditions are governed by the laws of Queensland, Australia. Any disputes will be subject to the exclusive jurisdiction of the courts of Queensland.`,
  },
  {
    title: '12. Changes to Terms',
    body: `We reserve the right to update these Terms & Conditions at any time. Changes will be effective upon posting to our website. Continued use of our website or services after changes are posted constitutes acceptance of the revised terms.`,
  },
  {
    title: '13. Contact',
    body: `For questions about these terms:

Email: info@ecoplanet.eco
Phone: 07 3422 6150
Address: 1/30 Chancellor Village Blvd, Sippy Downs QLD 4556
ABN: 12 345 678 901`,
  },
];

export default function TermsPage() {
  return (
    <SolariseShell footerEmail="info@ecoplanet.eco" footerPhone="07 3422 6150">
      {/* Hero */}
      <div className="policy-hero">
        <div className="policy-hero__inner">
          <p className="policy-hero__eyebrow">Legal</p>
          <h1 className="policy-hero__title">Terms &amp; Conditions</h1>
          <p className="policy-hero__sub">Last updated: July 2026</p>
        </div>
      </div>

      <div className="policy-shell policy-shell--narrow">
        <div className="policy-intro">
          <p>These Terms &amp; Conditions govern the use of the Eco Planet Solar website (ecoplanet.eco) and the purchase of products and services from Eco Planet Solar Pty Ltd (ABN 12 345 678 901), registered in Queensland, Australia.</p>
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
      </div>
    </SolariseShell>
  );
}
