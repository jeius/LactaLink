import { FormField } from '@/components/FormField';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { COLLECTION_MODES, STORAGE_TYPES } from '@lactalink/types';
import React from 'react';
import MilkBagsField from './milkbags';

export function DonationDetailsForm() {
  return (
    <Card>
      <VStack space="xl">
        <Text size="lg" className="font-JakartaSemiBold">
          Milk Details
        </Text>

        <FormField
          key={'details.storageType'}
          name="details.storageType"
          label="Select the type of milk you are donating."
          fieldType="button-group"
          options={Object.values(STORAGE_TYPES)}
        />

        <FormField
          key={'details.collectionMode'}
          name="details.collectionMode"
          label="How did you collect the milk?"
          fieldType="button-group"
          options={Object.values(COLLECTION_MODES)}
        />

        <MilkBagsField />

        <FormField
          name="details.milkSample"
          label="Milk Images"
          fieldType="image"
          allowsMultipleSelection
          selectionLimit={5}
          showCount
          helperText="Upload up to 5 images of the milk."
        />

        <FormField
          name="details.notes"
          label="Additional Notes (If any)"
          fieldType="textarea"
          placeholder="Any additional information about the milk, such as health conditions, medications, etc."
          helperText="This information will be shared with the recipient."
        />
      </VStack>
    </Card>
  );
}
