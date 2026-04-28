'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { formatApiError } from '@/lib/errors';
import { authApi } from '@/services/api';

const schema = z.object({ email: z.string().email('Enter a valid email') });
type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      await authApi.forgotPassword(values.email);
      setSubmitted(true);
    } catch (err) {
      setSubmitError(formatApiError(err));
    }
  });

  if (submitted) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-slate-900">Check your email</h1>
        <p className="text-sm text-slate-600">
          If an account exists for that address, we&apos;ve sent a reset link. The link
          expires in a couple of hours.
        </p>
        <Link href="/login" className="text-sm text-brand-600 hover:underline">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Forgot password?</h1>
        <p className="mt-1 text-sm text-slate-500">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <FormField label="Email" htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" autoComplete="email" {...register('email')} />
        </FormField>

        {submitError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {submitError}
          </div>
        ) : null}

        <Button type="submit" block loading={isSubmitting}>
          Send reset link
        </Button>
      </form>

      <Link href="/login" className="block text-sm text-slate-600 hover:text-slate-900">
        ← Back to sign in
      </Link>
    </div>
  );
}
