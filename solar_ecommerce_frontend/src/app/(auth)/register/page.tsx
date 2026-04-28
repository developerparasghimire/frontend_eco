'use client';

import Link from 'next/link';
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

const schema = z
  .object({
    email: z.string().email('Enter a valid email'),
    username: z.string().min(3, 'Min 3 characters').max(150),
    phone_number: z.string().max(15).optional(),
    password: z.string().min(8, 'Min 8 characters'),
    password2: z.string(),
  })
  .refine((d) => d.password === d.password2, {
    message: 'Passwords do not match',
    path: ['password2'],
  });

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const registerUser = useAuthStore((s) => s.register);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      await registerUser(values);
      router.replace('/dashboard');
    } catch (err) {
      setSubmitError(formatApiError(err, 'Registration failed.'));
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Create your account</h1>
        <p className="mt-1 text-sm text-slate-500">
          Start shopping solar in minutes.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <FormField label="Email" htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" autoComplete="email" {...register('email')} />
        </FormField>
        <FormField label="Username" htmlFor="username" error={errors.username?.message}>
          <Input id="username" autoComplete="username" {...register('username')} />
        </FormField>
        <FormField label="Phone (optional)" htmlFor="phone" error={errors.phone_number?.message}>
          <Input id="phone" autoComplete="tel" {...register('phone_number')} />
        </FormField>
        <FormField label="Password" htmlFor="password" error={errors.password?.message}>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            {...register('password')}
          />
        </FormField>
        <FormField label="Confirm password" htmlFor="password2" error={errors.password2?.message}>
          <Input
            id="password2"
            type="password"
            autoComplete="new-password"
            {...register('password2')}
          />
        </FormField>

        {submitError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {submitError}
          </div>
        ) : null}

        <Button type="submit" block loading={isSubmitting}>
          Create account
        </Button>
      </form>

      <p className="text-sm text-slate-600">
        Already have an account?{' '}
        <Link href="/login" className="text-brand-600 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
