'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { formatApiError } from '@/lib/errors';
import { useAuthStore } from '@/store/auth';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});
type FormValues = z.infer<typeof schema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      await login(values);
      const { user } = useAuthStore.getState();
      if (!user?.is_staff) {
        setSubmitError('This account does not have admin access.');
        await useAuthStore.getState().logout();
        return;
      }
      router.replace('/admin-eco');
    } catch (err) {
      setSubmitError(formatApiError(err, 'Invalid email or password.'));
    }
  });

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logoonly.png" alt="Eco Planet Solar" style={{ height: 56, width: 'auto' }} />
          <h1 className="mt-4 text-xl font-semibold text-white">Admin Access</h1>
          <p className="mt-1 text-sm text-slate-400">Sign in with your admin credentials</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-xl">
          <form onSubmit={onSubmit} className="space-y-4">
            <FormField label="Email" htmlFor="admin-email" error={errors.email?.message}>
              <Input
                id="admin-email"
                type="email"
                autoComplete="email"
                placeholder="admin@ecoplanet.eco"
                {...register('email')}
              />
            </FormField>

            <FormField label="Password" htmlFor="admin-password" error={errors.password?.message}>
              <Input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                {...register('password')}
              />
            </FormField>

            {submitError ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {submitError}
              </div>
            ) : null}

            <Button type="submit" block loading={isSubmitting}>
              Sign in to Admin Panel
            </Button>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-slate-500">
          Admin accounts are managed by EcoPlanet Solar.
          <br />Contact your administrator if you need access.
        </p>
      </div>
    </div>
  );
}
