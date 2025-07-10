import MatchedRequestCard from '@/components/cards/MatchedRequestCard';
import { FormField } from '@/components/FormField';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { COLLECTION_MODES, STORAGE_TYPES } from '@/lib/constants';
import { DeliveryPreferenceSchema, DonationSchema, MatchedRequestSchema } from '@lactalink/types';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { DeliveryPreferencesForm } from '../../DeliveryPreferencesForm';
import MilkBagsField from './milkbags';

interface DonationDetailsFormProps {
  isLoading?: boolean;
  matchedRequest?: MatchedRequestSchema;
}

export function DonationDetailsForm({
  isLoading: isLoadingProp,
  matchedRequest,
}: DonationDetailsFormProps) {
  const hasMatchedRequest = Boolean(matchedRequest);
  const isLoading = hasMatchedRequest && isLoadingProp;

  const form = useFormContext<DonationSchema>();

  function handleMatchedRequestChange(
    request: MatchedRequestSchema,
    preference?: DeliveryPreferenceSchema | null
  ) {
    form.setValue('matchedRequest', request);
    form.setValue('deliveryPreferences', preference ? [preference] : []);
  }

  return (
    <VStack space="xl">
      {matchedRequest && (
        <Box className="m-5">
          <Text className="font-JakartaSemiBold mb-1">Selected Request</Text>
          <MatchedRequestCard
            id={matchedRequest.id}
            isLoading={true}
            onChange={handleMatchedRequestChange}
          />
        </Box>
      )}

      <Text size="lg" className="font-JakartaSemiBold mx-5">
        Milk Details
      </Text>
      <VStack space="lg" className="mx-5">
        <FormField
          key={'details.storageType'}
          name="details.storageType"
          label="Select the type of milk you are donating."
          fieldType="button-group"
          options={Object.values(STORAGE_TYPES)}
          isLoading={isLoading}
        />

        <FormField
          key={'details.collectionMode'}
          name="details.collectionMode"
          label="How did you collect the milk?"
          fieldType="button-group"
          options={Object.values(COLLECTION_MODES)}
          isLoading={isLoading}
        />
      </VStack>

      <MilkBagsField isLoading={isLoading} />

      <Box className="mx-5">
        <FormField
          name="details.milkSample"
          label="Milk Samples"
          fieldType="image"
          allowsMultipleSelection
          selectionLimit={5}
          showCount
          helperText="Upload up to 5 images of the milk."
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

      {!hasMatchedRequest && (
        <DeliveryPreferencesForm name="deliveryPreferences" isLoading={isLoading} />
      )}
    </VStack>
  );
}
