import { MatchedDonationCard } from '@/components/cards/MatchedDonationCard';
import { useForm } from '@/components/contexts/FormProvider';
import { DeliveryPreferencesField } from '@/components/fields';
import { FormField } from '@/components/FormField';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

import { STORAGE_TYPES, URGENCY_LEVELS } from '@lactalink/enums';
import { RequestSchema } from '@lactalink/form-schemas';
import { DeliveryPreference } from '@lactalink/types/payload-generated-types';
import { extractCollection, extractID } from '@lactalink/utilities/extractors';

import ProfileCard from '@/components/cards/ProfileCard';
import { RequestCreateFormExtraData } from '@/hooks/forms/useCreateRequestForm';
import { transformToDeliveryPreferenceSchema } from '@/lib/utils/transformData';
import { ClockIcon } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { VolumeField } from './VolumeField';

interface RequestDetailsFormProps {
  matchedDonation?: string;
}

export function RequestDetailsForm({ matchedDonation }: RequestDetailsFormProps) {
  const { getValues, reset, setValue, additionalState, ...form } = useForm<RequestSchema>();
  const { matchedDonation: matchedDonationDoc }: RequestCreateFormExtraData =
    additionalState.extraData;
  const selectedDPID = form.watch('deliveryPreferences')?.[0] || null;
  const recipient = form.watch('recipient');

  const selectedPref = useMemo(() => {
    const deliveryPreferences = matchedDonationDoc?.deliveryPreferences || [];
    const selectedPref = deliveryPreferences?.find(
      (dp) => extractID(dp) === extractID(selectedDPID)
    );
    return extractCollection(selectedPref);
  }, [matchedDonationDoc, selectedDPID]);

  const isLoading = additionalState.isLoading;
  const isSubmitting = form.formState.isSubmitting;

  function handleDPChange(preference?: DeliveryPreference | null) {
    if (!preference) {
      setValue('deliveryPreferences', []);
    } else {
      setValue('deliveryPreferences', [transformToDeliveryPreferenceSchema(preference)]);
    }
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

      <VolumeField
        matchedDonation={matchedDonationDoc}
        isLoading={isLoading}
        isDisabled={isLoading || isSubmitting}
      />

      {!matchedDonation && (
        <DeliveryPreferencesField isLoading={isLoading} isDisabled={isSubmitting} />
      )}

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
    </VStack>
  );
}
