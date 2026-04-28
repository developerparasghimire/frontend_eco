import { SolariseButton, SolariseShell } from '@/components/SolariseSite';

export default function ContactPage() {
  return (
    <SolariseShell footerEmail="info@ecoplanet.com">
      <section className="solar-contact-hero">
        <div className="solar-container solar-contact-hero__inner">
          <div className="solar-contact-heading">
            <p className="solar-eyebrow solar-eyebrow--light solar-eyebrow--center">CONTACT US</p>
            <h1>We&apos;d love to hear from you.</h1>
          </div>
        </div>
      </section>

      <section className="solar-container solar-contact-shell">
        <div className="solar-contact-card">
          <div className="solar-contact-form-grid">
            <label className="solar-contact-field">
              <span>First Name</span>
              <input placeholder="Type here..." />
            </label>

            <label className="solar-contact-field">
              <span>Last Name</span>
              <input placeholder="Type here..." />
            </label>

            <label className="solar-contact-field">
              <span>Your Email</span>
              <input placeholder="Type here..." />
            </label>

            <label className="solar-contact-field">
              <span>Your Phone Number</span>
              <input placeholder="Type here..." />
            </label>

            <label className="solar-contact-field solar-contact-message">
              <span>Message</span>
              <textarea placeholder="Type here..." />
            </label>
          </div>

          <div className="solar-contact-submit">
            <SolariseButton tone="navy">Send Message</SolariseButton>
          </div>
        </div>

        <div className="solar-office-card">
          <div>Solarise Office</div>
          <div>29423 Wehner Ridge Suite 906, Mount Pleasant</div>
          <div>info@solarise.com</div>
          <div>(+62) 1234 5678</div>
        </div>

        <div className="solar-contact-map" aria-hidden="true" />
      </section>
    </SolariseShell>
  );
}
