import type { Metadata } from 'next';
import { SolariseShell } from '@/components/SolariseSite';

export const metadata: Metadata = {
  title: 'Privacy Policy | Eco Planet Solar',
  description: 'Eco Planet Solar privacy policy — how we collect, use, and protect your personal information.',
  alternates: { canonical: '/privacy' },
};

const SECTIONS = [
  {
    title: '1. Information We Collect',
    body: `We collect personal information that you voluntarily provide when you:

• Create an account or place an order (name, email, phone, address)
• Contact us for a quote or support
• Subscribe to our newsletter
• Submit a review or enquiry

We also automatically collect certain technical information when you visit our website, including your IP address, browser type, and pages visited, through the use of cookies and analytics tools.`,
  },
  {
    title: '2. How We Use Your Information',
    body: `We use your personal information to:

• Process and fulfil your orders
• Communicate about your orders, warranties, and support requests
• Send you promotional offers and news (you can unsubscribe at any time)
• Improve our website and products through analytics
• Comply with legal obligations under Australian Consumer Law`,
  },
  {
    title: '3. Sharing Your Information',
    body: `We do not sell or trade your personal information to third parties. We may share information with:

• Shipping and logistics partners (to deliver your orders)
• Payment processors (Stripe, PayPal — these operate under their own privacy policies)
• Installers and technicians engaged to complete your installation
• Marketing platforms (for promotional emails — only with your consent)
• Government or regulatory bodies where legally required`,
  },
  {
    title: '4. Data Security',
    body: `We take data security seriously. We implement industry-standard security measures including:

• SSL encryption on all data transmitted through our website
• Secure payment processing via PCI-DSS compliant providers
• Access controls limiting who can view your personal data
• Regular security audits and updates

No method of electronic transmission or storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.`,
  },
  {
    title: '5. Cookies',
    body: `Our website uses cookies to enhance your browsing experience. Cookies are small text files stored on your device. We use:

• Essential cookies — required for the website to function
• Analytics cookies — to understand how visitors use our site (e.g. Google Analytics)
• Marketing cookies — for relevant advertising (only with your consent)

You can disable cookies in your browser settings. Note that disabling certain cookies may affect website functionality.`,
  },
  {
    title: '6. Your Rights',
    body: `Under the Privacy Act 1988 (Australia), you have the right to:

• Request access to the personal information we hold about you
• Request correction of inaccurate or incomplete information
• Request deletion of your personal information (subject to legal obligations)
• Withdraw consent to marketing communications at any time

To exercise these rights, contact us at info@ecoplanet.eco.`,
  },
  {
    title: '7. Retention',
    body: `We retain your personal information for as long as necessary to provide our services and meet legal obligations. Order records are typically retained for 7 years in accordance with Australian tax and consumer law requirements. You may request deletion of your account at any time; however, some records may need to be retained for legal compliance.`,
  },
  {
    title: '8. Third-Party Links',
    body: `Our website may contain links to third-party websites. We are not responsible for the privacy practices of those websites. We encourage you to read their privacy policies before providing any personal information.`,
  },
  {
    title: '9. Changes to This Policy',
    body: `We may update this Privacy Policy from time to time. We will notify you of significant changes by email or by posting a notice on our website. The "Last updated" date below reflects the most recent revision.`,
  },
  {
    title: '10. Contact Us',
    body: `For privacy-related enquiries or to exercise your rights, contact our Privacy Officer:

Email: info@ecoplanet.eco
Phone: 07 3422 6150
Address: 1/30 Chancellor Village Blvd, Sippy Downs QLD 4556`,
  },
];

export default function PrivacyPage() {
  return (
    <SolariseShell footerEmail="info@ecoplanet.eco" footerPhone="07 3422 6150">
      {/* Hero */}
      <div className="policy-hero">
        <div className="policy-hero__inner">
          <p className="policy-hero__eyebrow">Legal</p>
          <h1 className="policy-hero__title">Privacy Policy</h1>
          <p className="policy-hero__sub">Last updated: July 2026</p>
        </div>
      </div>

      <div className="policy-shell policy-shell--narrow">
        <div className="policy-intro">
          <p>Eco Planet Solar Pty Ltd (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) is committed to protecting your personal information in accordance with the Privacy Act 1988 (Cth) and the Australian Privacy Principles. This policy explains how we collect, use, store, and disclose your personal information.</p>
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
