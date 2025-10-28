import { useForm } from '@/components/contexts/FormProvider';
import { DeliveryPreferencesField } from '@/components/fields';
import { FormField } from '@/components/FormField';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

import { STORAGE_TYPES, URGENCY_LEVELS } from '@lactalink/enums';
import { DeliveryCreateSchema, RequestCreateSchema } from '@lactalink/form-schemas';
import { extractCollection } from '@lactalink/utilities/extractors';

import { DonationListCard } from '@/components/cards/DonationListCard';
import ProfileCard from '@/components/cards/ProfileCard';
import { DeliveryField } from '@/components/fields/DeliveryField';
import { DateInputField } from '@/components/form-fields/DateInputField';
import { SelectInputField } from '@/components/form-fields/SelectInputField';
import { TextAreaField } from '@/components/form-fields/TextAreaField';
import { ProfileTag } from '@/components/ProfileTag';
import { Divider } from '@/components/ui/divider';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { RequestCreateFormExtraData } from '@/hooks/forms/useCreateRequestForm';
import { CalendarDaysIcon, ClipboardPenIcon, ClockIcon } from 'lucide-react-native';
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
  const { getValues, additionalState, watch, control, formState, setValue } =
    useForm<RequestCreateSchema>();
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

  const isLoading = additionalState.isLoading;
  const disableFields = disableProp || formState.isSubmitting;

  function handleOnDeliveryChange(data: DeliveryCreateSchema) {
    setValue('deliveryPreferences', data.deliveryPreference ? [data.deliveryPreference] : [], {
      shouldDirty: true,
      shouldTouch: true,
    });
  }

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

      <VStack space="lg" className="mx-5">
        <HStack space="md" className="items-center">
          <Text size="lg" className="font-JakartaSemiBold flex-1">
            Milk Details
          </Text>
          <Icon as={ClipboardPenIcon} />
        </HStack>

        {requestType !== 'MATCHED' && (
          <SelectInputField
            control={control}
            name="details.storagePreference"
            label="Select how you would like the milk to be stored/preserved."
            selectInputProps={{ placeholder: 'Select storage type' }}
            items={[...Object.values(STORAGE_TYPES), { label: 'Either', value: 'EITHER' }]}
            isDisabled={isLoading || disableFields}
          />
        )}

        <SelectInputField
          control={control}
          name="details.urgency"
          label="How urgently do you need the milk?"
          selectInputProps={{ placeholder: 'Select an urgency level' }}
          items={Object.values(URGENCY_LEVELS)}
          isDisabled={isLoading || disableFields}
        />
      </VStack>

      <VStack space="sm" className="mx-5">
        <Text className="font-JakartaMedium">When do you need the milk?</Text>

        <DateInputField
          control={control}
          name="details.neededAt"
          label="Date"
          helperText="Select a date when you need the milk."
          contentPosition="first"
          datePickerProps={{
            mode: 'date',
            options: { display: 'calendar', minimumDate: new Date() },
            icon: CalendarDaysIcon,
            placeholder: 'Select date...',
          }}
          isDisabled={disableFields}
          isLoading={isLoading}
          className="mt-2"
        />

        <DateInputField
          control={control}
          name="details.neededAt"
          helperText="Specify the time when you need the milk."
          contentPosition="first"
          datePickerProps={{
            mode: 'time',
            options: { display: 'spinner' },
            icon: ClockIcon,
            placeholder: 'Select time...',
          }}
          isDisabled={disableFields}
          isLoading={isLoading}
          className="mt-2"
        />
      </VStack>

      <TextAreaField
        control={control}
        name="details.reason"
        label="Reason for Request"
        helperText="Optional, but helps the donor understand your needs."
        textareaProps={{
          keyboardType: 'default',
          placeholder: 'Please provide a brief reason for your request.',
        }}
        isDisabled={disableFields}
        isLoading={isLoading}
        className="mx-5"
      />

      <TextAreaField
        control={control}
        name="details.notes"
        label="Additional Notes (If any)"
        helperText="This information will be shared with the recipient."
        textareaProps={{
          keyboardType: 'default',
          placeholder:
            'Any additional information about the milk, such as health conditions, medications, etc.',
        }}
        isDisabled={disableFields}
        isLoading={isLoading}
        className="mx-5"
      />

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
        <DeliveryField
          //@ts-expect-error typescript cant infer this properly
          control={control}
          isLoading={isLoading}
          isDisabled={disableFields}
          deliveryPreferences={donorDP}
          onChange={handleOnDeliveryChange}
        />
      ) : (
        <DeliveryPreferencesField isLoading={isLoading} isDisabled={disableFields} />
      )}
    </VStack>
  );
}
