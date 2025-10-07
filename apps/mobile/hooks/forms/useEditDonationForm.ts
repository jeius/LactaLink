import { useFetchById } from '@/hooks/collections/useFetchById';
import { transformToDeliveryPreferenceSchema } from '@/lib/utils/transformData';
import { zodResolver } from '@hookform/resolvers/zod';
import { donationUpdateSchema } from '@lactalink/form-schemas';
import { Donation } from '@lactalink/types/payload-generated-types';
import { extractCollection } from '@lactalink/utilities/extractors';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMeUser } from '../auth/useAuth';

export function useEditDonationForm(id: Donation['id']) {
  const { data: meUser } = useMeUser();

  const { data: donation, ...fetchQuery } = useFetchById(Boolean(meUser && id), {
    collection: 'donations',
    id,
  });

  const form = useForm({
    resolver: zodResolver(donationUpdateSchema),
    mode: 'onTouched',
  });

  const getValues = form.getValues;
  const reset = form.reset;

  useEffect(() => {
    if (!donation) return;

    const data = getValues();

    if (donation.deliveryPreferences) {
      const prefs = extractCollection(donation.deliveryPreferences);
      data.deliveryPreferences =
        prefs?.map((pref) => transformToDeliveryPreferenceSchema(pref)) || [];
    }

    reset(data);
  }, [donation, getValues, reset]);

  return { form, ...fetchQuery };
}
