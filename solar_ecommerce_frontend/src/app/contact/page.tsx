'use client';

import { useState } from 'react';
import { SolariseButton, SolariseShell } from '@/components/SolariseSite';

export default function ContactPage() {
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'err'>('idle');
  const [errMsg, setErrMsg] = useState('');

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrMsg('');
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || '';
      const res = await fetch(`${apiBase}/api/contacts/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${form.first_name} ${form.last_name}`.trim(),
          email: form.email,
          phone: form.phone,
          subject: 'Contact Form Enquiry',
          message: form.message,
        }),
      });
      if (res.ok) {
        setStatus('ok');
        setForm({ first_name: '', last_name: '', email: '', phone: '', message: '' });
      } else {
        const data = await res.json().catch(() => ({}));
        setErrMsg((data as { detail?: string })?.detail || 'Something went wrong. Please try again.');
        setStatus('err');
      }
    } catch {
      setErrMsg('Network error. Please check your connection.');
      setStatus('err');
    }
  };

  return (
    <SolariseShell footerEmail="info@ecoplanet.eco">
      <section className="solar-contact-hero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1581092162384-8987c1d64718?w=1600&q=80"
          alt=""
          aria-hidden="true"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.22 }}
        />
        <div className="solar-container solar-contact-hero__inner">
          <div className="solar-contact-heading">
            <p className="solar-eyebrow solar-eyebrow--light solar-eyebrow--center">CONTACT US</p>
            <h1>We&apos;d love to hear from you.</h1>
          </div>
        </div>
      </section>

      <section className="solar-container solar-contact-shell">
        <div className="solar-contact-card">
          {status === 'ok' ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
              <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>Message Sent!</h2>
              <p style={{ color: '#64748b' }}>Thank you for reaching out. We will get back to you shortly.</p>
              <button
                type="button"
                onClick={() => setStatus('idle')}
                style={{ marginTop: 20, padding: '10px 24px', background: '#166534', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}
              >
                Send Another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="solar-contact-form-grid">
              <label className="solar-contact-field">
                <span>First Name</span>
                <input placeholder="Type here..." value={form.first_name} onChange={set('first_name')} required />
              </label>
              <label className="solar-contact-field">
                <span>Last Name</span>
                <input placeholder="Type here..." value={form.last_name} onChange={set('last_name')} required />
              </label>
              <label className="solar-contact-field">
                <span>Your Email</span>
                <input type="email" placeholder="Type here..." value={form.email} onChange={set('email')} required />
              </label>
              <label className="solar-contact-field">
                <span>Your Phone Number</span>
                <input placeholder="Type here..." value={form.phone} onChange={set('phone')} />
              </label>
              <label className="solar-contact-field solar-contact-message">
                <span>Message</span>
                <textarea placeholder="Type here..." value={form.message} onChange={set('message')} required />
              </label>

              {status === 'err' && (
                <p style={{ color: '#ef4444', fontSize: 14, gridColumn: '1/-1', margin: 0 }}>{errMsg}</p>
              )}

              <div className="solar-contact-submit" style={{ gridColumn: '1/-1' }}>
                <SolariseButton tone="navy" type="submit" disabled={status === 'loading'}>
                  {status === 'loading' ? 'Sending…' : 'Send Message'}
                </SolariseButton>
              </div>
            </form>
          )}
        </div>

        <div className="solar-office-card">
          <div className="solar-office-item">
            <div className="solar-office-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
            </div>
            <div>
              <p className="solar-office-label">Visit Us</p>
              <p className="solar-office-value">1/30 Chancellor Village Blvd<br />Sippy Downs QLD 4556<br />Australia</p>
            </div>
          </div>
          <div className="solar-office-item">
            <div className="solar-office-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            </div>
            <div>
              <p className="solar-office-label">Email Us</p>
              <a href="mailto:info@ecoplanet.eco" className="solar-office-value solar-office-link">info@ecoplanet.eco</a>
            </div>
          </div>
          <div className="solar-office-item">
            <div className="solar-office-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12 19.79 19.79 0 0 1 1.07 3.38 2 2 0 0 1 3 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16l.92.92z"/></svg>
            </div>
            <div>
              <p className="solar-office-label">Call Us</p>
              <a href="tel:0734226150" className="solar-office-value solar-office-link">07 3422 6150</a>
            </div>
          </div>
        </div>

        <div className="solar-contact-map">
          <iframe
            src="https://maps.google.com/maps?q=1%2F30+Chancellor+Village+Blvd%2C+Sippy+Downs%2C+4556%2C+QLD%2C+Australia&output=embed&z=15"
            width="100%"
            height="100%"
            style={{ border: 0, borderRadius: 'inherit' }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Eco Planet Solar Office Location"
          />
        </div>
      </section>
    </SolariseShell>
  );
}
