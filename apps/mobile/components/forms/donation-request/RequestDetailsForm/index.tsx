import { FormField } from '@/components/FormField';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { PRIORITY_LEVELS, STORAGE_TYPES } from '@/lib/constants';
import { VOLUME_PRESET } from '@/lib/constants/donationRequest';

import { ClockIcon } from 'lucide-react-native';
import React, { useState } from 'react';

export function RequestDetailsForm() {
  const [isCustomVolume, setIsCustomVolume] = useState(false);

  console.log('RequestDetailsForm rendered');

  function handleToggleCustomVolume() {
    setIsCustomVolume((prev) => !prev);
  }

  return (
    <VStack space="xl">
      <Text size="lg" className="font-JakartaSemiBold mx-5 mt-5">
        Milk Details
      </Text>

      <VStack space="lg" className="mx-5">
        <FormField
          name="details.storagePreference"
          label="Select the type of milk you are requesting."
          fieldType="button-group"
          options={[...Object.values(STORAGE_TYPES), { label: 'Either', value: 'EITHER' }]}
        />

        <FormField
          name="details.urgency"
          label="How urgently do you need the milk?"
          fieldType="button-group"
          options={Object.values(PRIORITY_LEVELS)}
        />
      </VStack>

      <VStack space="sm" className="mx-5">
        <Text className="font-JakartaMedium">When do you need the milk?</Text>
        <Card className="flex-col gap-4">
          <FormField
            name="details.neededAt"
            label="Date"
            fieldType="date"
            mode="date"
            datePickerOptions={{ minimumDate: new Date() }}
          />

          <FormField
            name="details.neededAt"
            label="Time"
            fieldType="date"
            mode="time"
            placeholder="Select time..."
            inputIcon={ClockIcon}
            showSetNowButton
            datePickerOptions={{ minimumDate: new Date() }}
          />
        </Card>
      </VStack>

      <VStack space="sm" className="mx-5">
        <Text className="font-JakartaMedium">How much do you need?</Text>
        <Card className="flex-col gap-5">
          <FormField
            name="volumeNeeded"
            label="Select one"
            fieldType="button-group"
            options={Object.values(VOLUME_PRESET)}
            isDisabled={isCustomVolume}
          />

          <HStack space="sm" className="items-start">
            <Button
              size="sm"
              variant={isCustomVolume ? 'solid' : 'outline'}
              onPress={handleToggleCustomVolume}
            >
              <ButtonText>Custom</ButtonText>
            </Button>

            {isCustomVolume && (
              <FormField
                name="volumeNeeded"
                fieldType="number"
                placeholder="Enter volume in mL"
                variant="underlined"
                className="w-full max-w-48"
                containerClassName="flex-1"
              />
            )}
          </HStack>
        </Card>
      </VStack>

      <Box className="mx-5">
        <FormField
          name="details.image"
          label="Image of Recipient"
          fieldType="image"
          allowsMultipleSelection={false}
          helperText="Optional, but may encourage donors to fulfill your request."
        />
      </Box>

      <Box className="mx-5">
        <FormField
          name="details.reason"
          label="Reason for Request"
          fieldType="textarea"
          placeholder="Please provide a brief reason for your request."
          helperText="Optional, but helps the donor understand your needs."
        />
      </Box>

      <Box className="mx-5">
        <FormField
          name="details.notes"
          label="Additional Notes (If any)"
          fieldType="textarea"
          placeholder="Any additional information about the milk, such as health conditions, medications, etc."
          helperText="This information will be shared with the recipient."
        />
      </Box>
    </VStack>
  );
}
