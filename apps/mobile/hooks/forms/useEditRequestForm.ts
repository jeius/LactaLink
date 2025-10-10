import { FormProps } from '@/components/contexts/FormProvider';
import { useFetchById } from '@/hooks/collections/useFetchById';
import {
  transformToDeliveryPreferenceSchema,
  transformToImageSchema,
} from '@/lib/utils/transformData';
import { zodResolver } from '@hookform/resolvers/zod';
import { PREFERRED_STORAGE_TYPES } from '@lactalink/enums';
import { requestUpdateSchema, UpdateRequestSchema } from '@lactalink/form-schemas';
import { Request } from '@lactalink/types/payload-generated-types';
import { extractCollection, extractID } from '@lactalink/utilities/extractors';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMeUser } from '../auth/useAuth';

export function useEditRequestForm(
  id: Request['id']
): Omit<FormProps<UpdateRequestSchema>, 'children'> {
  const { data: meUser } = useMeUser();

  const { data: request, ...fetchQuery } = useFetchById(Boolean(meUser && id), {
    collection: 'requests',
    id,
  });

  const form = useForm({
    resolver: zodResolver(requestUpdateSchema),
    mode: 'onTouched',
    defaultValues: {
      deliveryPreferences: [],
      details: { notes: '', reason: '' },
    },
  });

  const getValues = form.getValues;
  const reset = form.reset;

  useEffect(() => {
    if (!request) return;

    const data = getValues();

    data.id = request.id;
    data.volumeNeeded = request.initialVolumeNeeded;

    // Map delivery preferences
    const prefs = extractCollection(request.deliveryPreferences) || [];
    data.deliveryPreferences = prefs.map((pref) => transformToDeliveryPreferenceSchema(pref));

    // Map recipient
    const recipient = request.recipient;
    data.recipient = recipient && { ...recipient, value: extractID(recipient.value) };

    // Map request details
    const { bags, image, ...details } = request.details;
    const extractedImage = extractCollection(image);
    data.details = {
      ...details,
      storagePreference: details.storagePreference || PREFERRED_STORAGE_TYPES.EITHER.value,
      notes: details.notes || '',
      reason: details.reason || '',
      bags: extractCollection(bags)?.map((bag) => ({ id: bag.id })),
      image: extractedImage && transformToImageSchema(extractedImage),
    };

    reset(data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request]);

  return {
    ...form,
    onRefresh: fetchQuery.refetch,
    refreshing: fetchQuery.isRefetching,
    fetchError: fetchQuery.error,
    isLoading: fetchQuery.isLoading,
    isFetching: fetchQuery.isFetching,
    extraData: request,
  };
}
