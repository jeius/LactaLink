import { RequestListCard } from '@/components/cards';
import ProfileCard from '@/components/cards/ProfileCard';
import { useForm } from '@/components/contexts/FormProvider';
import { DeliveryPreferencesField } from '@/components/fields';
import CreateMilkBagsField from '@/components/fields/CreateMilkBagsField';
import DeliveryField from '@/components/fields/DeliveryField';
import { FormField } from '@/components/FormField';
import { ProfileTag } from '@/components/ProfileTag';
import { Box } from '@/components/ui/box';
import { Divider } from '@/components/ui/divider';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useMeUser } from '@/hooks/auth/useAuth';
import { DonationCreateFormExtraData } from '@/hooks/forms/useCreateDonationForm';
import { COLLECTION_MODES, STORAGE_TYPES } from '@lactalink/enums';
import { DonationCreateSchema } from '@lactalink/form-schemas';
import { extractCollection } from '@lactalink/utilities/extractors';
import React, { useMemo } from 'react';

interface DonationDetailsFormProps {
  hasMatchedRequest?: boolean;
  disableFields?: boolean;
}

export function DonationDetailsForm({
  hasMatchedRequest,
  disableFields: disableProp,
}: DonationDetailsFormProps) {
  const { data: meUser } = useMeUser();
  const { getValues, reset, setValue, additionalState, watch, ...form } =
    useForm<DonationCreateSchema>();

  const { matchedRequest: matchedRequestDoc }: DonationCreateFormExtraData =
    additionalState.extraData;

  const recipient = useMemo(() => {
    const values = getValues();
    if (values.type === 'DIRECT') {
      return values.recipient;
    }
    return null;
  }, [getValues]);

  const donationType = watch('type');
  const requesterDP = extractCollection(matchedRequestDoc?.deliveryPreferences) || [];
  const meUserDP = extractCollection(meUser?.deliveryPreferences?.docs) || [];

  const isLoading = additionalState.isLoading;
  const disableFields = disableProp || form.formState.isSubmitting;

  return (
    <VStack space="2xl" className="py-5">
      {donationType === 'MATCHED' && (
        <Box className="mx-5 mb-4">
          <Text className="font-JakartaSemiBold mb-1">Selected Request</Text>
          <RequestListCard
            isLoading={isLoading}
            data={matchedRequestDoc}
            footerAction={
              matchedRequestDoc && (
                <ProfileTag
                  label="Requester"
                  profile={{ relationTo: 'individuals', value: matchedRequestDoc.requester }}
                />
              )
            }
          />
        </Box>
      )}

      {recipient && (
        <Box className="mx-5 mb-4">
          <Text className="font-JakartaSemiBold mb-1">Selected Recipient</Text>
          <ProfileCard profile={recipient} variant="elevated" />
        </Box>
      )}

      {donationType !== 'OPEN' && <Divider />}

      <VStack space="lg" className="mx-5">
        <Text size="lg" className="font-JakartaSemiBold">
          Milk Details
        </Text>

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

      <Divider />

      <CreateMilkBagsField
        isLoading={isLoading}
        isDisabled={isLoading || disableFields}
        className="mx-5"
      />

      <Divider />

      {donationType === 'MATCHED' ? (
        <DeliveryField type="donation" deliveryPreferences={requesterDP.concat(meUserDP)} />
      ) : (
        <DeliveryPreferencesField isLoading={isLoading} isDisabled={disableFields} />
      )}
    </VStack>
  );
}
