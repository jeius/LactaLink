import MatchedRequestCard from '@/components/cards/MatchedRequestCard';
import { DeliveryPreferencesField } from '@/components/fields';
import { FormField } from '@/components/FormField';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { COLLECTION_MODES, STORAGE_TYPES } from '@/lib/constants';
import { DonationSchema, MatchedRequestSchema } from '@lactalink/types';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import MilkBagsField from './milkbags';

interface DonationDetailsFormProps {
  isLoading?: boolean;
  matchedRequest?: string;
  disableFields?: boolean;
}

export function DonationDetailsForm({
  isLoading: isLoadingProp,
  matchedRequest,
  disableFields,
}: DonationDetailsFormProps) {
  const hasMatchedRequest = Boolean(matchedRequest);
  const isLoading = hasMatchedRequest && isLoadingProp;

  const form = useFormContext<DonationSchema>();

  function handleMatchedRequestChange(request: MatchedRequestSchema, preferenceID?: string | null) {
    form.setValue('matchedRequest', request);
    form.setValue('deliveryPreferences', preferenceID ? [preferenceID] : []);
  }

  return (
    <VStack space="xl" className="py-5">
      {matchedRequest && (
        <Box className="mx-5 mb-4">
          <Text className="font-JakartaSemiBold mb-1">Selected Request</Text>
          <MatchedRequestCard
            request={matchedRequest}
            isLoading={isLoading}
            onChange={handleMatchedRequestChange}
          />
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
          isLoading={isLoading}
          isDisabled={disableFields}
        />

        <FormField
          control={form.control}
          key={'details.collectionMode'}
          name="details.collectionMode"
          label="How did you collect the milk?"
          fieldType="button-group"
          options={Object.values(COLLECTION_MODES)}
          isLoading={isLoading}
          isDisabled={disableFields}
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
          isLoading={isLoading}
          isDisabled={disableFields}
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
          isLoading={isLoading}
          isDisabled={disableFields}
        />
      </Box>

      {!hasMatchedRequest && (
        <DeliveryPreferencesField
          control={form.control}
          name="deliveryPreferences"
          isLoading={isLoading}
          label="Delivery Preferences"
          isDisabled={disableFields}
        />
      )}
    </VStack>
  );
}
