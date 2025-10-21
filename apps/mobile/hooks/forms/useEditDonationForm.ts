import { FormProps } from '@/components/contexts/FormProvider';
import { useFetchById } from '@/hooks/collections/useFetchById';
import {
  transformToDeliveryPreferenceSchema,
  transformToImageSchema,
} from '@/lib/utils/transformData';
import { zodResolver } from '@hookform/resolvers/zod';
import { donationUpdateSchema, DonationUpdateSchema } from '@lactalink/form-schemas';
import { Donation } from '@lactalink/types/payload-generated-types';
import { extractCollection, extractID } from '@lactalink/utilities/extractors';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMeUser } from '../auth/useAuth';

export function useEditDonationForm(
  id: Donation['id']
): Omit<FormProps<DonationUpdateSchema>, 'children'> {
  const { data: meUser } = useMeUser();

  const { data: donation, ...fetchQuery } = useFetchById(Boolean(meUser && id), {
    collection: 'donations',
    id,
  });

  const form = useForm({
    resolver: zodResolver(donationUpdateSchema),
    defaultValues: {
      deliveryPreferences: [],
      details: { notes: '' },
    },
    mode: 'onTouched',
  });

  const getValues = form.getValues;
  const reset = form.reset;

  useEffect(() => {
    if (!donation) return;

    const data = getValues();

    data.id = donation.id;

    // Map delivery preferences
    const prefs = extractCollection(donation.deliveryPreferences) || [];
    data.deliveryPreferences = prefs.map((pref) => transformToDeliveryPreferenceSchema(pref));

    // Map recipient
    const recipient = donation.recipient;
    data.recipient = recipient && { ...recipient, value: extractID(recipient.value) };

    // Map donation details
    const details = donation.details;
    const milkSample = extractCollection(details.milkSample)?.[0];
    data.details = {
      collectionMode: details.collectionMode,
      storageType: details.storageType,
      notes: details.notes || '',
      image: milkSample && transformToImageSchema(milkSample),
    };

    reset(data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [donation]);

  return {
    ...form,
    onRefresh: fetchQuery.refetch,
    refreshing: fetchQuery.isRefetching,
    fetchError: fetchQuery.error,
    isLoading: fetchQuery.isLoading,
    isFetching: fetchQuery.isFetching,
    extraData: donation,
  };
}
