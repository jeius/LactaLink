import { donationStorage } from '@/lib/localStorage';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  createDonationSchema,
  CreateDonationSchema,
  Hospital,
  Individual,
  MilkBank,
  User,
} from '@lactalink/types';
import { useDebouncedCallback } from '@lactalink/utilities';
import { useEffect } from 'react';
import { DeepPartial, useForm } from 'react-hook-form';

const storageKeyPrefix = 'create-donation-form';

function getInitialData(id: string): CreateDonationSchema | undefined {
  const storageKey = `${storageKeyPrefix}-${id}`;
  const raw = donationStorage.getString(storageKey);
  return raw && JSON.parse(raw);
}

type Params = {
  recipientId?: string;
  user: User | null;
  profile: Individual | Hospital | MilkBank | null;
};

export const useCreateDonationForm = ({ recipientId, user, profile }: Params) => {
  donationStorage.clearAll();
  const initialData = user && getInitialData(user.id);

  const donor = profile?.id;

  const form = useForm({
    resolver: zodResolver(createDonationSchema),
    mode: 'onTouched',
    defaultValues: initialData || {
      donor,
      recipient: recipientId,
      details: {
        notes: '',
        bags: [{ donor, volume: 20, quantity: 1, collectedAt: new Date().toISOString() }],
      },
    },
  });

  const storageKey = `${storageKeyPrefix}-${user?.id || ''}`;

  const { debounced: debouncedSave, cancel } = useDebouncedCallback(
    (value: DeepPartial<CreateDonationSchema>) => {
      donationStorage.set(storageKey, JSON.stringify(value));
    }
  );

  useEffect(() => {
    const subscription = form.watch((value) => {
      debouncedSave(value);
    });

    return () => {
      subscription.unsubscribe();
      cancel(); // cancel pending debounced calls
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.watch, debouncedSave, cancel]);

  return form;
};
