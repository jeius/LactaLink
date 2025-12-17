import { RequestListCard } from '@/components/cards';
import ProfileCard from '@/components/cards/ProfileCard';
import { useForm } from '@/components/contexts/FormProvider';
import { DeliveryPreferencesField } from '@/components/fields';
import { DeliveryField } from '@/components/fields/DeliveryField';
import { ImageField } from '@/components/form-fields/ImageField';
import { SelectInputField } from '@/components/form-fields/SelectInputField';
import { TextAreaField } from '@/components/form-fields/TextAreaField';
import { ProfileTag } from '@/components/ProfileTag';
import { Box } from '@/components/ui/box';
import { Divider } from '@/components/ui/divider';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useRequest } from '@/features/donation&request/hooks/queries';
import { COLLECTION_MODES, STORAGE_TYPES } from '@lactalink/enums';
import { DeliveryCreateSchema, DonationCreateSchema } from '@lactalink/form-schemas';
import { extractCollection } from '@lactalink/utilities/extractors';
import { ClipboardPenIcon } from 'lucide-react-native';
import React, { useMemo } from 'react';
import CreateMilkBagsField from './CreateMilkBagsField';

interface DonationDetailsFormProps {
  disableFields?: boolean;
  matchedRequest?: string | null;
}

export function DonationDetailsForm({
  disableFields: disableProp,
  matchedRequest,
}: DonationDetailsFormProps) {
  const isMatched = !!matchedRequest;
  const { data: matchedRequestDoc, ...requestQuery } = useRequest(matchedRequest ?? undefined);

  const { getValues, additionalState, watch, control, formState, setValue } =
    useForm<DonationCreateSchema>();

  const recipient = useMemo(() => {
    const values = getValues();
    if (values.type === 'DIRECT') {
      return values.recipient;
    }
    return null;
  }, [getValues]);

  const donationType = watch('type');
  const requesterDP = extractCollection(matchedRequestDoc?.deliveryPreferences);

  const isLoading = additionalState.isLoading;
  const disableFields = disableProp || formState.isSubmitting;

  function handleOnDeliveryChange(data: DeliveryCreateSchema) {
    setValue('deliveryPreferences', data.deliveryPreference ? [data.deliveryPreference] : [], {
      shouldDirty: true,
      shouldTouch: true,
    });
  }

  return (
    <VStack space="2xl" className="py-5">
      {(donationType === 'MATCHED' || isMatched) && (
        <Box className="mx-5 mb-4">
          <Text className="mb-1 font-JakartaSemiBold">Selected Request</Text>
          <RequestListCard
            isLoading={requestQuery.isLoading}
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
          <Text className="mb-1 font-JakartaSemiBold">Selected Recipient</Text>
          <ProfileCard profile={recipient} variant="elevated" />
        </Box>
      )}

      {donationType !== 'OPEN' && <Divider />}

      <VStack space="lg" className="mx-5">
        <HStack space="md" className="items-center">
          <Text size="lg" className="flex-1 font-JakartaSemiBold">
            Milk Details
          </Text>
          <Icon as={ClipboardPenIcon} />
        </HStack>

        <SelectInputField
          control={control}
          name="details.storageType"
          label="How are you storing/preserving the milk?"
          selectInputProps={{ placeholder: 'Select storage type' }}
          items={Object.values(STORAGE_TYPES)}
          isDisabled={isLoading || disableFields}
        />

        <SelectInputField
          control={control}
          name="details.collectionMode"
          label="How did you collect the milk?"
          selectInputProps={{ placeholder: 'Select collection method' }}
          items={Object.values(COLLECTION_MODES)}
          isDisabled={isLoading || disableFields}
        />
      </VStack>

      <Box className="mx-5">
        <TextAreaField
          control={control}
          name="details.notes"
          label="Additional Notes"
          helperText="This information will be shared with the recipient."
          isDisabled={isLoading || disableFields}
          textareaProps={{
            placeholder:
              'Any additional information about the milk, such as health conditions, medications, etc.',
          }}
        />
      </Box>

      <Box className="mx-5">
        <ImageField
          control={control}
          name="details.image"
          label="Cover Image"
          helperText="Upload a cover image to feature your donation."
          isDisabled={isLoading || disableFields}
          options={{ allowsMultipleSelection: false }}
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
        <DeliveryField
          //@ts-expect-error typescript cant infer this properly
          control={control}
          isLoading={isLoading}
          isDisabled={disableFields}
          deliveryPreferences={requesterDP}
          onChange={handleOnDeliveryChange}
        />
      ) : (
        <DeliveryPreferencesField isLoading={isLoading} isDisabled={disableFields} />
      )}
    </VStack>
  );
}
