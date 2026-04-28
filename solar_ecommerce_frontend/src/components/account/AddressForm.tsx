'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { useCreateAddress, useUpdateAddress } from '@/hooks/useAddresses';
import { formatApiError } from '@/lib/errors';
import type { Address, AddressInput } from '@/types/auth';
import { useState } from 'react';

const schema = z.object({
  label: z.string().min(1, 'Required').max(50),
  address_type: z.enum(['shipping', 'billing']),
  full_name: z.string().min(1, 'Required').max(120),
  phone: z.string().min(5, 'Required').max(15),
  address_line1: z.string().min(1, 'Required'),
  address_line2: z.string(),
  city: z.string().min(1, 'Required'),
  state: z.string().min(1, 'Required'),
  postal_code: z.string().min(1, 'Required'),
  country: z.string().min(1, 'Required'),
  is_default: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  initial?: Address;
  onSuccess?: (address: Address) => void;
  onCancel?: () => void;
}

export function AddressForm({ initial, onSuccess, onCancel }: Props) {
  const create = useCreateAddress();
  const update = useUpdateAddress();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      label: 'Home',
      address_type: 'shipping',
      country: 'India',
      address_line2: '',
      is_default: false,
      full_name: '',
      phone: '',
      address_line1: '',
      city: '',
      state: '',
      postal_code: '',
    },
  });

  useEffect(() => {
    if (initial) {
      reset({
        label: initial.label,
        address_type: initial.address_type,
        full_name: initial.full_name,
        phone: initial.phone,
        address_line1: initial.address_line1,
        address_line2: initial.address_line2 ?? '',
        city: initial.city,
        state: initial.state,
        postal_code: initial.postal_code,
        country: initial.country,
        is_default: initial.is_default,
      });
    }
  }, [initial, reset]);

  const onSubmit = async (values: FormValues) => {
    setError(null);
    try {
      const data = values as AddressInput;
      const result = initial
        ? await update.mutateAsync({ id: initial.id, data })
        : await create.mutateAsync(data);
      onSuccess?.(result);
    } catch (err) {
      setError(formatApiError(err, 'Could not save address.'));
    }
  };

  const pending = create.isPending || update.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Label" htmlFor="label" error={errors.label?.message}>
          <Input id="label" {...register('label')} placeholder="Home, Office…" />
        </FormField>
        <FormField label="Type" htmlFor="address_type">
          <select
            id="address_type"
            {...register('address_type')}
            className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"
          >
            <option value="shipping">Shipping</option>
            <option value="billing">Billing</option>
          </select>
        </FormField>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Full name" htmlFor="full_name" error={errors.full_name?.message}>
          <Input id="full_name" {...register('full_name')} />
        </FormField>
        <FormField label="Phone" htmlFor="phone" error={errors.phone?.message}>
          <Input id="phone" {...register('phone')} />
        </FormField>
      </div>
      <FormField label="Address line 1" htmlFor="address_line1" error={errors.address_line1?.message}>
        <Input id="address_line1" {...register('address_line1')} />
      </FormField>
      <FormField label="Address line 2" htmlFor="address_line2">
        <Input id="address_line2" {...register('address_line2')} />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-3">
        <FormField label="City" htmlFor="city" error={errors.city?.message}>
          <Input id="city" {...register('city')} />
        </FormField>
        <FormField label="State" htmlFor="state" error={errors.state?.message}>
          <Input id="state" {...register('state')} />
        </FormField>
        <FormField label="Postal code" htmlFor="postal_code" error={errors.postal_code?.message}>
          <Input id="postal_code" {...register('postal_code')} />
        </FormField>
      </div>
      <FormField label="Country" htmlFor="country" error={errors.country?.message}>
        <Input id="country" {...register('country')} />
      </FormField>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          {...register('is_default')}
          className="h-4 w-4 rounded border-slate-300 text-brand-600"
        />
        Make this my default address
      </label>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="flex justify-end gap-2 pt-2">
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel} disabled={pending}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" loading={pending}>
          {initial ? 'Save changes' : 'Add address'}
        </Button>
      </div>
    </form>
  );
}
