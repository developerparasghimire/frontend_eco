'use client';

export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { formatApiError } from '@/lib/errors';
import { authApi } from '@/services/api';

const schema = z
  .object({
    new_password: z.string().min(8, 'Min 8 characters'),
    confirm: z.string(),
  })
  .refine((d) => d.new_password === d.confirm, {
    message: 'Passwords do not match',
    path: ['confirm'],
  });

type FormValues = z.infer<typeof schema>;

function ResetPasswordForm() {
  const router = useRouter();
  const search = useSearchParams();
  const uid = search.get('uid') ?? '';
  const token = search.get('token') ?? '';
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  // Auto-redirect to login after a successful reset.
  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => router.replace('/login'), 2500);
    return () => clearTimeout(t);
  }, [success, router]);

  const onSubmit = handleSubmit(async ({ new_password }) => {
    setSubmitError(null);
    try {
      await authApi.resetPassword({ uid, token, new_password });
      setSuccess(true);
    } catch (err) {
      setSubmitError(formatApiError(err, 'Reset link is invalid or expired.'));
    }
  });

  if (!uid || !token) {
    return (
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold text-slate-900">Invalid link</h1>
        <p className="text-sm text-slate-600">
          This password reset link is missing required parameters.
        </p>
        <Link href="/forgot-password" className="text-sm text-brand-600 hover:underline">
          Request a new link
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold text-slate-900">Password updated</h1>
        <p className="text-sm text-slate-600">
          Redirecting you to sign in…
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Choose a new password</h1>
        <p className="mt-1 text-sm text-slate-500">
          Pick something you don&apos;t use elsewhere.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <FormField label="New password" htmlFor="new_password" error={errors.new_password?.message}>
          <Input
            id="new_password"
            type="password"
            autoComplete="new-password"
            {...register('new_password')}
          />
        </FormField>
        <FormField label="Confirm" htmlFor="confirm" error={errors.confirm?.message}>
          <Input
            id="confirm"
            type="password"
            autoComplete="new-password"
            {...register('confirm')}
          />
        </FormField>

        {submitError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {submitError}
          </div>
        ) : null}

        <Button type="submit" block loading={isSubmitting}>
          Reset password
        </Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
