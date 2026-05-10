import { FormPreventBack } from '@/components/buttons/FormPreventBack';
import ProfileCard from '@/components/cards/ProfileCard';
import { useForm } from '@/components/contexts/FormProvider';
import KeyboardAvoidingScrollView from '@/components/KeyboardAvoider';
import SafeArea from '@/components/SafeArea';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import { Text } from '@/components/ui/text';
import DeliveryField from '@/features/donation&request/components/forms/fields/DeliveryField';
import DeliveryPreferencesField from '@/features/donation&request/components/forms/fields/DeliveryPreferencesField';
import DonationDetailsFields from '@/features/donation&request/components/forms/fields/DonationDetailsFields';
import { MatchedRequestField } from '@/features/donation&request/components/forms/fields/MatchedListingFields';
import MilkBagsField from '@/features/donation&request/components/forms/fields/MilkBagsField';
import { useDonationFormExtraData } from '@/features/donation&request/hooks/useCreateDonationForm';
import { DeliveryCreateSchema } from '@lactalink/form-schemas/delivery-preference';
import { DonationCreateSchema } from '@lactalink/form-schemas/listings';
import { extractCollection } from '@lactalink/utilities/extractors';
import { useWatch } from 'react-hook-form';
import { toast } from 'sonner-native';

export default function DetailsStep({ onNextPress }: { onNextPress?: () => void }) {
  const { additionalState, control, formState, setValue, handleSubmit } =
    useForm<DonationCreateSchema>();

  const { isMatched, requestQuery } = useDonationFormExtraData();

  const matchedRequest = requestQuery.data;
  const requesterDP = extractCollection(matchedRequest?.deliveryPreferences);

  const recipient = useWatch({ control, name: 'recipient' });
  const donationType = useWatch({ control, name: 'type' });
  const isOrgRecipient = recipient?.relationTo !== 'individuals';

  const { isLoading } = additionalState;
  const disableFields = isLoading || formState.isSubmitting;
  const refreshing = requestQuery.isRefetching || additionalState.refreshing;

  function onRefresh() {
    if (isMatched) requestQuery.refetch();
    additionalState.onRefresh();
  }

  function handleOnDeliveryChange(data: DeliveryCreateSchema) {
    setValue('deliveryPreferences', data.deliveryPreference ? [data.deliveryPreference] : [], {
      shouldDirty: true,
      shouldTouch: true,
    });
  }

  async function handleNextPress() {
    handleSubmit(
      () => {
        onNextPress?.();
      },
      () => {
        toast.error('Please fix the errors in the form before proceeding.');
      }
    )();
  }

  return (
    <>
      <FormPreventBack />

      <SafeArea safeTop={false} className="items-stretch">
        <KeyboardAvoidingScrollView
          refreshing={refreshing}
          onRefresh={onRefresh}
          className="flex-1"
          contentContainerClassName="grow gap-6 py-5"
        >
          {(donationType === 'MATCHED' || isMatched) && (
            <MatchedRequestField
              className="mx-4"
              isLoading={requestQuery.isLoading}
              request={matchedRequest}
            />
          )}

          {recipient && (
            <Box className="mx-4 mb-4">
              <Text className="mb-1 font-JakartaSemiBold">Selected Recipient</Text>
              <ProfileCard profile={recipient} variant="elevated" />
            </Box>
          )}

          {donationType !== 'OPEN' && <Divider />}

          <DonationDetailsFields className="mx-4" control={control} disableFields={disableFields} />

          <Divider />

          <MilkBagsField
            control={control}
            className="mx-4"
            isLoading={isLoading}
            isDisabled={disableFields}
          />

          <Divider />

          {donationType === 'MATCHED' || (donationType === 'DIRECT' && isOrgRecipient) ? (
            <DeliveryField
              control={control}
              isLoading={isLoading}
              isDisabled={disableFields}
              deliveryPreferences={requesterDP}
              recipient={recipient}
              listingType="donation"
              onChange={handleOnDeliveryChange}
            />
          ) : (
            <DeliveryPreferencesField
              control={control}
              isLoading={isLoading}
              isDisabled={disableFields}
            />
          )}

          <Button onPress={handleNextPress} isDisabled={disableFields} className="mx-4 mt-4">
            <ButtonText>Proceed</ButtonText>
          </Button>
        </KeyboardAvoidingScrollView>
      </SafeArea>
    </>
  );
}
