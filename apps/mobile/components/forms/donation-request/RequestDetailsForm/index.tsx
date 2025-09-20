import { MatchedDonationCard } from '@/components/cards/MatchedDonationCard';
import { useForm } from '@/components/contexts/FormProvider';
import { DeliveryPreferencesField } from '@/components/fields';
import { FormField } from '@/components/FormField';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

import { STORAGE_TYPES, URGENCY_LEVELS } from '@lactalink/enums';
import { RequestSchema } from '@lactalink/form-schemas';
import { DeliveryPreference, Donation } from '@lactalink/types/payload-generated-types';
import { extractCollection, extractID } from '@lactalink/utilities/extractors';

import ProfileCard from '@/components/cards/ProfileCard';
import { useFetchById } from '@/hooks/collections/useFetchById';
import { extractMilkBagSchema } from '@/lib/utils/extractMilkBagShema';
import { getNearestDeliveryPreference } from '@/lib/utils/getNearestDeliveryPreference';
import { ClockIcon } from 'lucide-react-native';
import React, { useEffect, useMemo } from 'react';
import { VolumeField } from './VolumeField';

interface RequestDetailsFormProps {
  matchedDonation?: string;
}

export function RequestDetailsForm({ matchedDonation }: RequestDetailsFormProps) {
  const { data: matchedDonationDoc, ...restOfQuery } = useFetchById(Boolean(matchedDonation), {
    collection: 'donations',
    id: matchedDonation || '',
    populate: { users: { profile: true, profileType: true, role: true } },
  });

  const form = useForm<RequestSchema>();
  const selectedDPID = form.watch('deliveryPreferences')?.[0] || null;
  const recipient = form.watch('recipient');

  const selectedPref = useMemo(() => {
    const deliveryPreferences = matchedDonationDoc?.deliveryPreferences || [];
    const selectedPref = deliveryPreferences?.find((dp) => extractID(dp) === selectedDPID);
    return extractCollection(selectedPref);
  }, [matchedDonationDoc, selectedDPID]);

  const getValues = form.getValues;
  const reset = form.reset;

  const isLoading = restOfQuery.isLoading;
  const isSubmitting = form.formState.isSubmitting;

  // When matched donation data is fetched, update the form values.
  useEffect(() => {
    const data = getValues();
    const updatedData = updateDataOnMatchedDonation(data, matchedDonationDoc);
    reset(updatedData);

    return () => {
      if (matchedDonationDoc) {
        reset({ ...getValues(), deliveryPreferences: [] });
      }
    };
  }, [getValues, matchedDonationDoc, reset]);

  function handleDPChange(preference?: DeliveryPreference | null) {
    const preferenceID = extractID(preference);
    form.setValue('deliveryPreferences', preferenceID ? [preferenceID] : []);
  }

  return (
    <VStack space="xl" className="py-5">
      {matchedDonation && (
        <Box className="mx-5 mb-4">
          <Text className="font-JakartaSemiBold mb-1">Selected Donation</Text>
          <MatchedDonationCard
            donation={matchedDonationDoc}
            isLoading={isLoading}
            onSelect={handleDPChange}
            selected={selectedPref}
          />
        </Box>
      )}

      {recipient && (
        <Box className="mx-5 mb-4">
          <Text className="font-JakartaSemiBold mb-1">Selected Donor</Text>
          <ProfileCard profile={recipient} variant="elevated" />
        </Box>
      )}

      <Text size="lg" className="font-JakartaSemiBold mx-5">
        Milk Details
      </Text>

      <VStack space="lg" className="mx-5">
        {!matchedDonation && (
          <FormField
            control={form.control}
            name="details.storagePreference"
            label="Select how you would like the milk to be stored/preserved."
            fieldType="button-group"
            options={[...Object.values(STORAGE_TYPES), { label: 'Either', value: 'EITHER' }]}
            isLoading={isLoading}
          />
        )}

        <FormField
          control={form.control}
          name="details.urgency"
          label="How urgently do you need the milk?"
          fieldType="button-group"
          options={Object.values(URGENCY_LEVELS)}
          isDisabled={isLoading || isSubmitting}
        />
      </VStack>

      <VStack space="sm" className="mx-5">
        <Text className="font-JakartaMedium">When do you need the milk?</Text>
        <VStack className="flex-col gap-4">
          <FormField
            control={form.control}
            name="details.neededAt"
            fieldType="date"
            mode="date"
            helperText="Select a date when you need the milk."
            datePickerOptions={{ minimumDate: new Date() }}
            placeholder="Select date..."
            style={{ maxWidth: 200 }}
            isDisabled={isLoading || isSubmitting}
          />

          <FormField
            control={form.control}
            name="details.neededAt"
            fieldType="date"
            mode="time"
            helperText="Specify the time when you need the milk."
            placeholder="Select time..."
            inputIcon={ClockIcon}
            style={{ maxWidth: 200 }}
            showSetNowButton
            datePickerOptions={{ minimumDate: new Date() }}
            isDisabled={isLoading || isSubmitting}
          />
        </VStack>
      </VStack>

      <VolumeField
        matchedDonation={matchedDonationDoc}
        isLoading={isLoading}
        isDisabled={isLoading || isSubmitting}
      />

      <Box className="mx-5">
        <FormField
          control={form.control}
          name="details.image"
          label="Image of Recipient"
          fieldType="image"
          allowsMultipleSelection={false}
          helperText="Optional, but may encourage donors to fulfill your request."
          isDisabled={isLoading || isSubmitting}
        />
      </Box>

      <Box className="mx-5">
        <FormField
          control={form.control}
          name="details.reason"
          label="Reason for Request"
          fieldType="textarea"
          placeholder="Please provide a brief reason for your request."
          helperText="Optional, but helps the donor understand your needs."
          isDisabled={isLoading || isSubmitting}
        />
      </Box>

      <Box className="mx-5">
        <FormField
          control={form.control}
          name="details.notes"
          label="Additional Notes (If any)"
          fieldType="textarea"
          placeholder="Any additional information about the milk, such as health conditions, medications, etc."
          helperText="This information will be shared with the recipient."
          isDisabled={isLoading || isSubmitting}
        />
      </Box>

      {!matchedDonation && (
        <DeliveryPreferencesField
          control={form.control}
          name="deliveryPreferences"
          label="Delivery Preferences"
          isDisabled={isSubmitting}
        />
      )}
    </VStack>
  );
}

function updateDataOnMatchedDonation(data: RequestSchema, matchedDonationDoc?: Donation) {
  if (!matchedDonationDoc) {
    data.matchedDonation = undefined;
    return data;
  }

  const storagePreference = matchedDonationDoc.details.storageType;
  const bags = extractCollection(matchedDonationDoc.details.bags);
  const preferences = matchedDonationDoc.deliveryPreferences || [];

  data.matchedDonation = {
    id: matchedDonationDoc.id,
    donor: extractID(matchedDonationDoc.donor),
    storageType: storagePreference,
    bags: bags.map((bag) => extractMilkBagSchema(bag)),
  };

  if (preferences?.length) {
    const nearestPref = getNearestDeliveryPreference(extractCollection(preferences));
    const prefID = extractID(nearestPref?.deliveryPreference);
    data.deliveryPreferences = prefID ? [prefID] : data.deliveryPreferences;
  }

  data.details.storagePreference = storagePreference;

  return data;
}
