'use client';

import { useRef, useState } from 'react';

export function NewsletterForm() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = inputRef.current?.value.trim();
    if (!email) return;
    setState('loading');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/contacts/newsletter/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error('Failed');
      setState('ok');
      if (inputRef.current) inputRef.current.value = '';
    } catch {
      setState('error');
    }
  };

  if (state === 'ok') {
    return <p className="solar-loyalty-card__success">Thanks! You&apos;re subscribed.</p>;
  }

  return (
    <form className="solar-loyalty-card__form" onSubmit={handleSubmit}>
      <input
        ref={inputRef}
        type="email"
        required
        placeholder="Your email address"
        className="solar-loyalty-card__input"
        aria-label="Email address"
        disabled={state === 'loading'}
      />
      <button type="submit" className="solar-loyalty-card__btn" disabled={state === 'loading'}>
        {state === 'loading' ? 'Subscribing…' : 'Subscribe'}
      </button>
      {state === 'error' && (
        <p className="solar-loyalty-card__error">Something went wrong. Try again.</p>
      )}
    </form>
  );
}
