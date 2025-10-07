import MatchedRequestCard from '@/components/cards/MatchedRequestCard';
import ProfileCard from '@/components/cards/ProfileCard';
import { useForm } from '@/components/contexts/FormProvider';
import { DeliveryPreferencesField } from '@/components/fields';
import { FormField } from '@/components/FormField';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useFetchById } from '@/hooks/collections/useFetchById';
import { getNearestDeliveryPreference } from '@/lib/utils/getNearestDeliveryPreference';
import { transformToDeliveryPreferenceSchema } from '@/lib/utils/transformData';
import { COLLECTION_MODES, STORAGE_TYPES } from '@lactalink/enums';
import { DonationSchema } from '@lactalink/form-schemas';
import { DeliveryPreference, Request } from '@lactalink/types/payload-generated-types';
import { extractCollection, extractID } from '@lactalink/utilities/extractors';
import { randomUUID } from 'expo-crypto';
import React, { useEffect, useMemo } from 'react';
import MilkBagsField from './milkbags';

interface DonationDetailsFormProps {
  matchedRequest?: string;
  disableFields?: boolean;
}

export function DonationDetailsForm({
  matchedRequest,
  disableFields: disableProp,
}: DonationDetailsFormProps) {
  const hasMatchedRequest = Boolean(matchedRequest);
  const { data: matchedRequestDoc, ...restQuery } = useFetchById(hasMatchedRequest, {
    collection: 'requests',
    id: matchedRequest || '',
    populate: { users: { profile: true, profileType: true, role: true } },
  });

  const { getValues, reset, setValue, ...form } = useForm<DonationSchema>();
  const selectedDPID = form.watch('deliveryPreferences')?.[0] || null;
  const recipient = form.watch('recipient');

  const selectedPref = useMemo(() => {
    const deliveryPreferences = matchedRequestDoc?.deliveryPreferences || [];
    const selectedPref = deliveryPreferences?.find(
      (dp) => extractID(dp) === extractID(selectedDPID)
    );
    return extractCollection(selectedPref);
  }, [matchedRequestDoc, selectedDPID]);

  const isLoading = restQuery.isLoading;
  const disableFields = disableProp || form.formState.isSubmitting;

  // When matched request data is fetched, update the form values.
  useEffect(() => {
    const data = getValues();
    const updatedData = updateDataOnMatchedRequest(data, matchedRequestDoc);
    reset(updatedData);

    return () => {
      if (matchedRequestDoc) {
        reset({ ...getValues(), deliveryPreferences: [] });
      }
    };
  }, [matchedRequestDoc, getValues, reset]);

  function handleDPChange(preference?: DeliveryPreference | null) {
    if (!preference) {
      setValue('deliveryPreferences', []);
    } else {
      setValue('deliveryPreferences', [transformToDeliveryPreferenceSchema(preference)]);
    }
  }

  return (
    <VStack space="xl" className="py-5">
      {matchedRequest && (
        <Box className="mx-5 mb-4">
          <Text className="font-JakartaSemiBold mb-1">Selected Request</Text>
          <MatchedRequestCard
            request={matchedRequestDoc}
            isLoading={isLoading}
            selected={selectedPref}
            onSelect={handleDPChange}
          />
        </Box>
      )}

      {recipient && (
        <Box className="mx-5 mb-4">
          <Text className="font-JakartaSemiBold mb-1">Selected Recipient</Text>
          <ProfileCard profile={recipient} variant="elevated" />
        </Box>
      )}

      <Text size="lg" className="font-JakartaSemiBold mx-5">
        Milk Details
      </Text>
      <VStack space="lg" className="mx-5">
        <FormField
          control={form.control}
          key={'details.storageType'}
          name="details.storageType"
          label="How are you storing/preserving the milk?"
          fieldType="button-group"
          options={Object.values(STORAGE_TYPES)}
          isDisabled={isLoading || disableFields}
        />

        <FormField
          control={form.control}
          key={'details.collectionMode'}
          name="details.collectionMode"
          label="How did you collect the milk?"
          fieldType="button-group"
          options={Object.values(COLLECTION_MODES)}
          isDisabled={isLoading || disableFields}
        />
      </VStack>

      <MilkBagsField isLoading={isLoading} isDisabled={disableFields} />

      <Box className="mx-5">
        <FormField
          control={form.control}
          name="details.image"
          label="Cover Image"
          fieldType="image"
          helperText="Upload a cover image to feature your donation."
          isDisabled={isLoading || disableFields}
          allowsMultipleSelection={false}
        />
      </Box>

      <Box className="mx-5">
        <FormField
          control={form.control}
          name="details.notes"
          label="Additional Notes"
          fieldType="textarea"
          placeholder="Any additional information about the milk, such as health conditions, medications, etc."
          helperText="This information will be shared with the recipient."
          isDisabled={isLoading || disableFields}
        />
      </Box>

      {!hasMatchedRequest && (
        <DeliveryPreferencesField isLoading={isLoading} isDisabled={disableFields} />
      )}
    </VStack>
  );
}

function updateDataOnMatchedRequest(
  data: DonationSchema,
  matchedRequest?: Request
): DonationSchema {
  if (!matchedRequest) {
    data.matchedRequest = undefined;
    return data;
  }

  const storagePreference = matchedRequest.details.storagePreference || 'EITHER';
  const volumeNeeded = matchedRequest.volumeNeeded;
  const requesterID = extractID(matchedRequest.requester);
  const deliveryPreferences = matchedRequest.deliveryPreferences || [];

  const { deliveryPreference: nearestPref } = getNearestDeliveryPreference(
    extractCollection(deliveryPreferences)
  );

  data.matchedRequest = {
    id: matchedRequest.id,
    requester: requesterID,
    volumeNeeded,
    storagePreference,
  };

  data.details.storageType = storagePreference === 'EITHER' ? 'FRESH' : storagePreference;
  data.details.bags = [
    {
      collectedAt: new Date().toISOString(),
      volume: volumeNeeded,
      quantity: 1,
      donor: data.donor,
      groupID: randomUUID(),
    },
  ];

  data.deliveryPreferences = nearestPref
    ? [
        {
          ...nearestPref,
          address: extractID(nearestPref.address),
        },
      ]
    : [];

  return data;
}
