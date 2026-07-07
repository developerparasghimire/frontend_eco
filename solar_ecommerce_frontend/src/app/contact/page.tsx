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
          <div>EcoPlanet Solar Office</div>
          <div>Kathmandu, Nepal</div>
          <div>info@ecoplanet.eco</div>
          <div>(+977) 9800000000</div>
        </div>

        <div className="solar-contact-map" aria-hidden="true" />
      </section>
    </SolariseShell>
  );
}
