import { useForm } from '@/components/contexts/FormProvider';
import { DeliveryPreferencesField } from '@/components/fields';
import { FormField } from '@/components/FormField';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

import { STORAGE_TYPES, URGENCY_LEVELS } from '@lactalink/enums';
import { RequestCreateSchema } from '@lactalink/form-schemas';
import { extractCollection } from '@lactalink/utilities/extractors';

import { DonationListCard } from '@/components/cards/DonationListCard';
import ProfileCard from '@/components/cards/ProfileCard';
import DeliveryField from '@/components/fields/DeliveryField';
import { ProfileTag } from '@/components/ProfileTag';
import { Divider } from '@/components/ui/divider';
import { useMeUser } from '@/hooks/auth/useAuth';
import { RequestCreateFormExtraData } from '@/hooks/forms/useCreateRequestForm';
import { ClockIcon } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { VolumeField } from './VolumeField';

interface RequestDetailsFormProps {
  isMatched?: boolean;
  disableFields?: boolean;
}

export function RequestDetailsForm({
  isMatched,
  disableFields: disableProp,
}: RequestDetailsFormProps) {
  const { data: meUser } = useMeUser();
  const { getValues, additionalState, watch, control, formState } = useForm<RequestCreateSchema>();
  const { matchedDonation: matchedDonationDoc }: RequestCreateFormExtraData =
    additionalState.extraData;

  const recipient = useMemo(() => {
    const values = getValues();
    if (values.type === 'DIRECT') {
      return values.recipient;
    }
    return null;
  }, [getValues]);

  const requestType = watch('type');
  const donorDP = extractCollection(matchedDonationDoc?.deliveryPreferences) || [];
  const meUserDP = extractCollection(meUser?.deliveryPreferences?.docs) || [];

  const isLoading = additionalState.isLoading;
  const disableFields = disableProp || formState.isSubmitting;

  return (
    <VStack space="xl" className="py-5">
      {(requestType === 'MATCHED' || isMatched) && (
        <Box className="mx-5 mb-4">
          <Text className="font-JakartaSemiBold mb-1">Selected Donation</Text>
          <DonationListCard
            isLoading={isLoading}
            data={matchedDonationDoc}
            footerAction={
              matchedDonationDoc && (
                <ProfileTag
                  label="Donor"
                  profile={{ relationTo: 'individuals', value: matchedDonationDoc.donor }}
                />
              )
            }
          />
        </Box>
      )}

      {recipient && (
        <Box className="mx-5 mb-4">
          <Text className="font-JakartaSemiBold mb-1">Selected Donor</Text>
          <ProfileCard profile={recipient} variant="elevated" />
        </Box>
      )}

      {requestType !== 'OPEN' && <Divider />}

      <Text size="lg" className="font-JakartaSemiBold mx-5">
        Milk Details
      </Text>

      <VStack space="lg" className="mx-5">
        {requestType !== 'MATCHED' && (
          <FormField
            control={control}
            name="details.storagePreference"
            label="Select how you would like the milk to be stored/preserved."
            fieldType="button-group"
            options={[...Object.values(STORAGE_TYPES), { label: 'Either', value: 'EITHER' }]}
            isLoading={isLoading}
          />
        )}

        <FormField
          control={control}
          name="details.urgency"
          label="How urgently do you need the milk?"
          fieldType="button-group"
          options={Object.values(URGENCY_LEVELS)}
          isDisabled={isLoading || disableFields}
        />
      </VStack>

      <VStack space="sm" className="mx-5">
        <Text className="font-JakartaMedium">When do you need the milk?</Text>
        <VStack className="flex-col gap-4">
          <FormField
            control={control}
            name="details.neededAt"
            fieldType="date"
            mode="date"
            helperText="Select a date when you need the milk."
            datePickerOptions={{ minimumDate: new Date() }}
            placeholder="Select date..."
            style={{ maxWidth: 200 }}
            isDisabled={isLoading || disableFields}
          />

          <FormField
            control={control}
            name="details.neededAt"
            fieldType="date"
            mode="time"
            helperText="Specify the time when you need the milk."
            placeholder="Select time..."
            inputIcon={ClockIcon}
            style={{ maxWidth: 200 }}
            showSetNowButton
            datePickerOptions={{ minimumDate: new Date() }}
            isDisabled={isLoading || disableFields}
          />
        </VStack>
      </VStack>

      <Box className="mx-5">
        <FormField
          control={control}
          name="details.reason"
          label="Reason for Request"
          fieldType="textarea"
          placeholder="Please provide a brief reason for your request."
          helperText="Optional, but helps the donor understand your needs."
          isDisabled={isLoading || disableFields}
        />
      </Box>

      <Box className="mx-5">
        <FormField
          control={control}
          name="details.notes"
          label="Additional Notes (If any)"
          fieldType="textarea"
          placeholder="Any additional information about the milk, such as health conditions, medications, etc."
          helperText="This information will be shared with the recipient."
          isDisabled={isLoading || disableFields}
        />
      </Box>

      <Box className="mx-5">
        <FormField
          control={control}
          name="details.image"
          label="Image of Recipient"
          fieldType="image"
          allowsMultipleSelection={false}
          helperText="Optional, but may encourage donors to fulfill your request."
          isDisabled={isLoading || disableFields}
        />
      </Box>

      <Divider />

      <VolumeField
        matchedDonation={matchedDonationDoc}
        isLoading={isLoading}
        isDisabled={isLoading || disableFields}
      />

      <Divider />

      {requestType === 'MATCHED' ? (
        <DeliveryField type="donation" deliveryPreferences={donorDP.concat(meUserDP)} />
      ) : (
        <DeliveryPreferencesField isLoading={isLoading} isDisabled={disableFields} />
      )}
    </VStack>
  );
}
