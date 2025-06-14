import { donationStorage } from '@/lib/localStorage';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  Address,
  createDonationSchema,
  CreateDonationSchema,
  DAYS,
  Hospital,
  Individual,
  MilkBank,
  User,
} from '@lactalink/types';
import { useDebouncedCallback } from '@lactalink/utilities';
import { useEffect } from 'react';
import { DeepPartial, useForm } from 'react-hook-form';

const storageKeyPrefix = 'create-donation-form';

type Params = {
  recipientId?: string;
  user: User | null;
  profile: Individual | Hospital | MilkBank | null;
};

function getInitialData({ user, recipientId, profile }: Params): CreateDonationSchema | undefined {
  if (!user) return undefined;

  const id = user.id;
  const storageKey = `${storageKeyPrefix}-${id}`;
  const raw = donationStorage.getString(storageKey);

  const initialData: DeepPartial<CreateDonationSchema> | undefined = raw && JSON.parse(raw);
  const donor = profile?.id;
  const defaultAddressId = (
    profile?.addresses.find((address) => (address as Address)?.default) as Address | undefined
  )?.id;

  return {
    donor: initialData?.donor || donor,
    recipient: initialData?.recipient || recipientId,
    details: {
      notes: initialData?.details?.notes || '',
      collectionMode: initialData?.details?.collectionMode,
      storageType: initialData?.details?.storageType || 'FROZEN',
      milkSample: initialData?.details?.milkSample,
      bags: initialData?.details?.bags || [
        { donor, volume: 20, quantity: 1, collectedAt: new Date().toISOString() },
      ],
    },
    deliveryDetails: {
      prefferedModes: initialData?.deliveryDetails?.prefferedModes || ['PICKUP'],
      address: initialData?.deliveryDetails?.address || defaultAddressId || '',
      availableDays:
        initialData?.deliveryDetails?.availableDays || Object.values(DAYS).map((day) => day.value),
    },
  } as CreateDonationSchema;
}

export const useCreateDonationForm = ({ recipientId, user, profile }: Params) => {
  const initialData = user && getInitialData({ recipientId, user, profile });

  const form = useForm({
    resolver: zodResolver(createDonationSchema),
    mode: 'onTouched',
    defaultValues: initialData || undefined,
  });

  const storageKey = `${storageKeyPrefix}-${user?.id || ''}`;
  const isSubmitSuccessful = form.formState.isSubmitSuccessful;
  const getValues = form.getValues;

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

  /**
   * When the form is successfully submitted, clear the local storage
   * and save the user preference to local storage.
   */
  useEffect(() => {
    if (isSubmitSuccessful) {
      donationStorage.delete(storageKey);

      // Pick the preffered values from the form
      const {
        details: { notes, collectionMode, storageType },
        deliveryDetails: { prefferedModes, availableDays },
      } = getValues();

      const values: DeepPartial<CreateDonationSchema> = {
        details: { notes, collectionMode, storageType },
        deliveryDetails: { prefferedModes, availableDays },
      };

      // Save the preffered values to local storage
      donationStorage.set(storageKey, JSON.stringify(values));
    }
  }, [isSubmitSuccessful, getValues, storageKey]);

  return form;
};
