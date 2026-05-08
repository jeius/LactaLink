import { FormProps } from '@/components/contexts/FormProvider';

import { zodResolver } from '@hookform/resolvers/zod';
import { donationUpdateSchema, DonationUpdateSchema } from '@lactalink/form-schemas/listings';
import { Donation } from '@lactalink/types/payload-generated-types';
import { extractCollection } from '@lactalink/utilities/extractors';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  transformToDeliveryPreferenceSchema,
  transformToImageSchema,
  transformToMilkBagSchema,
} from '../lib/transformData';
import { useDonation } from './queries';

export function useEditDonationForm(
  id: Donation['id']
): Omit<FormProps<DonationUpdateSchema>, 'children'> {
  const { data: donation, ...query } = useDonation(id);

  const methods = useForm({
    resolver: zodResolver(donationUpdateSchema),
    defaultValues: {
      deliveryPreferences: [],
      details: { notes: '', bags: [] },
    },
  });

  const { getValues, reset } = methods;

  useEffect(() => {
    if (!donation) return;

    const data = getValues();

    data.id = donation.id;

    // Map delivery preferences
    const prefs = extractCollection(donation.deliveryPreferences) || [];
    data.deliveryPreferences = prefs.map((pref) => transformToDeliveryPreferenceSchema(pref));

    // Map donation details
    const details = donation.details;
    const milkSample = extractCollection(details.milkSample)?.[0];
    data.details = {
      collectionMode: details.collectionMode,
      storageType: details.storageType,
      notes: details.notes || '',
      image: milkSample && transformToImageSchema(milkSample),
      bags: extractCollection(details.bags).map((bag) => transformToMilkBagSchema(bag)),
    };

    reset(data);
  }, [donation, getValues, reset]);

  return {
    ...methods,
    onRefresh: query.refetch,
    refreshing: query.isRefetching,
    fetchError: query.error,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    extraData: { donation },
  };
}
