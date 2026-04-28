'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { formatApiError } from '@/lib/errors';
import { authApi } from '@/services/api';
import { useAuthStore } from '@/store/auth';

const schema = z
  .object({
    old_password: z.string().min(1, 'Required'),
    new_password: z.string().min(8, 'Min 8 characters'),
    confirm: z.string(),
  })
  .refine((d) => d.new_password === d.confirm, {
    message: 'Passwords do not match',
    path: ['confirm'],
  });

type FormValues = z.infer<typeof schema>;

function ChangePasswordForm() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async ({ old_password, new_password }) => {
    setSubmitError(null);
    try {
      await authApi.changePassword({ old_password, new_password });
      // Force re-auth so the user picks up a fresh token under the new password.
      await logout();
      router.replace('/login');
    } catch (err) {
      setSubmitError(formatApiError(err));
    }
  });

  return (
    <div className="container max-w-lg py-12">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Change password</h1>
        <p className="mt-1 text-sm text-slate-500">
          You&apos;ll be signed out after a successful change.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
        <FormField label="Current password" htmlFor="old" error={errors.old_password?.message}>
          <Input
            id="old"
            type="password"
            autoComplete="current-password"
            {...register('old_password')}
          />
        </FormField>
        <FormField label="New password" htmlFor="new" error={errors.new_password?.message}>
          <Input
            id="new"
            type="password"
            autoComplete="new-password"
            {...register('new_password')}
          />
        </FormField>
        <FormField label="Confirm new password" htmlFor="confirm" error={errors.confirm?.message}>
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

        <Button type="submit" loading={isSubmitting}>
          Update password
        </Button>
      </form>
    </div>
  );
}

export default function ChangePasswordPage() {
  return (
    <ProtectedRoute>
      <ChangePasswordForm />
    </ProtectedRoute>
  );
}
