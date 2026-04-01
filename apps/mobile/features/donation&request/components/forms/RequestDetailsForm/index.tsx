import ProfileCard from '@/components/cards/ProfileCard';
import { useForm } from '@/components/contexts/FormProvider';
import { DeliveryPreferencesField } from '@/components/fields';
import { DeliveryField } from '@/components/fields/DeliveryField';
import { DateInputField } from '@/components/form-fields/DateInputField';
import { ImageField } from '@/components/form-fields/ImageField';
import { SelectInputField } from '@/components/form-fields/SelectInputField';
import { TextAreaField } from '@/components/form-fields/TextAreaField';
import { Box } from '@/components/ui/box';
import { Divider } from '@/components/ui/divider';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useRequestFormExtraData } from '@/features/donation&request/hooks/useCreateRequestForm';
import { STORAGE_TYPES, URGENCY_LEVELS } from '@lactalink/enums';
import { DeliveryCreateSchema, RequestCreateSchema } from '@lactalink/form-schemas';
import { extractCollection } from '@lactalink/utilities/extractors';
import { CalendarDaysIcon, ClipboardPenIcon, ClockIcon } from 'lucide-react-native';
import { useWatch } from 'react-hook-form';
import { MatchedDonationField } from '../MatchedListingFields';
import RequestMilkbagsField from '../RequestMilkbagsField';
import { VolumeField } from './VolumeField';

interface RequestDetailsFormProps {
  disableFields?: boolean;
  matchedDonation?: string;
}

export function RequestDetailsForm({ disableFields: disableProp }: RequestDetailsFormProps) {
  const { additionalState, control, formState, setValue } = useForm<RequestCreateSchema>();

  const { isMatched, donationQuery } = useRequestFormExtraData();

  const { data: matchedDonationDoc } = donationQuery;
  const donorDP = extractCollection(matchedDonationDoc?.deliveryPreferences) || [];

  const requestType = useWatch({ control, name: 'type' });
  const recipient = useWatch({ control, name: 'recipient' });

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
        <MatchedDonationField donation={matchedDonationDoc} isLoading={donationQuery.isLoading} />
      )}

      {requestType === 'DIRECT' && recipient && (
        <Box className="mx-5 mb-4">
          <Text className="mb-1 font-JakartaSemiBold">Selected Donor</Text>
          <ProfileCard profile={recipient} variant="elevated" />
        </Box>
      )}

      {['MATCHED', 'DIRECT'].includes(requestType) && <Divider />}

      <VStack space="lg" className="mx-5">
        <HStack space="md" className="items-center">
          <Text size="lg" className="flex-1 font-JakartaSemiBold">
            Milk Details
          </Text>
          <Icon as={ClipboardPenIcon} />
        </HStack>

        {requestType !== 'MATCHED' && (
          <SelectInputField
            control={control}
            name="details.storagePreference"
            label="Select how you would like the milk to be stored/preserved."
            triggerInputProps={{ placeholder: 'Select storage type' }}
            items={[...Object.values(STORAGE_TYPES), { label: 'Any method', value: 'EITHER' }]}
            transformItem={(item) => item}
            isDisabled={isLoading || disableFields}
          />
        )}

        <SelectInputField
          control={control}
          name="details.urgency"
          label="How urgently do you need the milk?"
          triggerInputProps={{ placeholder: 'Select an urgency level' }}
          items={Object.values(URGENCY_LEVELS)}
          transformItem={(item) => item}
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
        <ImageField
          control={control}
          name="details.image"
          label="Image of Recipient"
          helperText="Optional, but may encourage donors to fulfill your request."
          isDisabled={isLoading || disableFields}
          options={{ allowsMultipleSelection: false }}
        />
      </Box>

      <Divider />

      {isMatched ? (
        <RequestMilkbagsField
          control={control}
          matchedDonation={matchedDonationDoc}
          isLoading={isLoading}
          isDisabled={isLoading || disableFields}
        />
      ) : (
        <VolumeField
          control={control}
          isLoading={isLoading}
          isDisabled={isLoading || disableFields}
        />
      )}

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
