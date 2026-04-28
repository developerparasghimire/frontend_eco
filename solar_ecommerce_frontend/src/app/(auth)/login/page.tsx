'use client';

export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
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

function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get('next') ?? '/dashboard';
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
      router.replace(next);
    } catch (err) {
      setSubmitError(formatApiError(err, 'Invalid email or password.'));
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-500">Sign in to your Solar account.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <FormField label="Email" htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" autoComplete="email" {...register('email')} />
        </FormField>

        <FormField label="Password" htmlFor="password" error={errors.password?.message}>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            {...register('password')}
          />
        </FormField>

        {submitError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {submitError}
          </div>
        ) : null}

        <Button type="submit" block loading={isSubmitting}>
          Sign in
        </Button>
      </form>

      <div className="flex items-center justify-between text-sm">
        <Link href="/forgot-password" className="text-brand-600 hover:underline">
          Forgot password?
        </Link>
        <Link href="/register" className="text-slate-600 hover:text-slate-900">
          Create an account
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
