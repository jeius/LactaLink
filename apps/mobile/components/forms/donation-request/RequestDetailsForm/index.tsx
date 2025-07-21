import { MatchedDonationCard } from '@/components/cards/MatchedDonationCard';
import { FormField } from '@/components/FormField';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { STORAGE_TYPES, URGENCY_LEVELS } from '@/lib/constants';
import { DeliveryPreferenceSchema, MatchedDonationSchema, RequestSchema } from '@lactalink/types';

import { ClockIcon } from 'lucide-react-native';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { DeliveryPreferencesForm } from '../../DeliveryPreferencesForm';
import { VolumeField } from './VolumeField';

interface RequestDetailsFormProps {
  isLoading?: boolean;
  matchedDonation?: string;
}

export function RequestDetailsForm({
  isLoading: isLoadingProp,
  matchedDonation,
}: RequestDetailsFormProps) {
  const hasMatchedDonation = Boolean(matchedDonation);
  const isLoading = hasMatchedDonation && isLoadingProp;

  const form = useFormContext<RequestSchema>();

  function handleMatchedDonationChange(
    donation: MatchedDonationSchema,
    preference?: DeliveryPreferenceSchema | null
  ) {
    form.setValue('matchedDonation', donation);
    form.setValue('deliveryPreferences', preference ? [preference] : []);
  }

  return (
    <VStack space="xl" className="py-5">
      {matchedDonation && (
        <Box className="mx-5 mb-4">
          <Text className="font-JakartaSemiBold mb-1">Selected Donation</Text>
          <MatchedDonationCard
            donation={matchedDonation}
            isLoading={isLoading}
            onChange={handleMatchedDonationChange}
          />
        </Box>
      )}

      <Text size="lg" className="font-JakartaSemiBold mx-5">
        Milk Details
      </Text>

      <VStack space="lg" className="mx-5">
        {!matchedDonation && (
          <FormField
            name="details.storagePreference"
            label="Select the type of milk you are requesting."
            fieldType="button-group"
            options={[...Object.values(STORAGE_TYPES), { label: 'Either', value: 'EITHER' }]}
            isLoading={isLoading}
          />
        )}

        <FormField
          name="details.urgency"
          label="How urgently do you need the milk?"
          fieldType="button-group"
          options={Object.values(URGENCY_LEVELS)}
          isLoading={isLoading}
        />
      </VStack>

      <VStack space="sm" className="mx-5">
        <Text className="font-JakartaMedium">When do you need the milk?</Text>
        <VStack className="flex-col gap-4">
          <FormField
            name="details.neededAt"
            fieldType="date"
            mode="date"
            helperText="Select a date when you need the milk."
            datePickerOptions={{ minimumDate: new Date() }}
            showSetNowButton
            placeholder="Select date..."
            isLoading={isLoading}
          />

          <FormField
            name="details.neededAt"
            fieldType="date"
            mode="time"
            helperText="Specify the time when you need the milk."
            placeholder="Select time..."
            inputIcon={ClockIcon}
            showSetNowButton
            datePickerOptions={{ minimumDate: new Date() }}
            isLoading={isLoading}
          />
        </VStack>
      </VStack>

      <VolumeField donationID={matchedDonation} />

      <Box className="mx-5">
        <FormField
          name="details.image"
          label="Image of Recipient"
          fieldType="image"
          allowsMultipleSelection={false}
          helperText="Optional, but may encourage donors to fulfill your request."
          isLoading={isLoading}
        />
      </Box>

      <Box className="mx-5">
        <FormField
          name="details.reason"
          label="Reason for Request"
          fieldType="textarea"
          placeholder="Please provide a brief reason for your request."
          helperText="Optional, but helps the donor understand your needs."
          isLoading={isLoading}
        />
      </Box>

      <Box className="mx-5">
        <FormField
          name="details.notes"
          label="Additional Notes (If any)"
          fieldType="textarea"
          placeholder="Any additional information about the milk, such as health conditions, medications, etc."
          helperText="This information will be shared with the recipient."
          isLoading={isLoading}
        />
      </Box>

      {!hasMatchedDonation && (
        <DeliveryPreferencesForm name="deliveryPreferences" isLoading={isLoading} />
      )}
    </VStack>
  );
}
