'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useRef, Suspense } from 'react';

import { Button } from '@/components/ui/Button';
import { authApi } from '@/services/api/auth';
import { formatApiError } from '@/lib/errors';

function VerifyEmailInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') ?? '';

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [email, setEmail] = useState(emailParam);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [resendMsg, setResendMsg] = useState<string | null>(null);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const fullCode = code.join('');

  const handleDigit = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...code];
    next[index] = digit;
    setCode(next);
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setCode(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fullCode.length !== 6) {
      setError('Please enter the full 6-digit code.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await authApi.verifyEmail(email, fullCode);
      setSuccess(true);
      setTimeout(() => router.push('/login?verified=1'), 2000);
    } catch (err) {
      setError(formatApiError(err, 'Invalid or expired code. Try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendMsg(null);
    try {
      await authApi.resendActivation(email);
      setResendMsg('A new code has been sent to your email.');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch {
      setResendMsg('Could not resend. Please wait a moment and try again.');
    }
  };

  if (success) {
    return (
      <div className="space-y-4 text-center">
        <div className="text-5xl">✅</div>
        <h1 className="text-2xl font-semibold text-slate-900">Email verified!</h1>
        <p className="text-sm text-slate-500">Redirecting you to login…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Verify your email</h1>
        <p className="mt-1 text-sm text-slate-500">
          We sent a 6-digit code to{' '}
          <span className="font-medium text-slate-800">{email || 'your email'}</span>.
          Enter it below to activate your account.
        </p>
      </div>

      {!emailParam && (
        <div className="space-y-1">
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
            placeholder="you@example.com"
          />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Activation code</label>
          <div className="flex gap-2" onPaste={handlePaste}>
            {code.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigit(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="h-14 w-12 rounded-xl border border-slate-300 bg-white text-center text-xl font-bold text-slate-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
              />
            ))}
          </div>
          <p className="mt-1.5 text-xs text-slate-400">Code expires in 10 minutes.</p>
        </div>

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <Button type="submit" block loading={loading} disabled={fullCode.length !== 6}>
          Verify & activate account
        </Button>
      </form>

      <div className="text-center">
        <p className="text-sm text-slate-500">
          Didn&apos;t receive a code?{' '}
          <button
            type="button"
            onClick={handleResend}
            className="text-brand-600 hover:underline"
          >
            Resend code
          </button>
        </p>
        {resendMsg ? <p className="mt-1 text-xs text-slate-600">{resendMsg}</p> : null}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailInner />
    </Suspense>
  );
}
