import { FormPreventBack } from '@/components/buttons/FormPreventBack';
import ProfileCard from '@/components/cards/ProfileCard';
import { useForm } from '@/components/contexts/FormProvider';
import { DeliveryField } from '@/components/fields/DeliveryField';
import { DeliveryPreferencesField } from '@/components/fields/DeliveryPreferencesField';
import KeyboardAvoidingScrollView from '@/components/KeyboardAvoider';
import SafeArea from '@/components/SafeArea';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import { Text } from '@/components/ui/text';
import DonationDetailsFields from '@/features/donation&request/components/forms/DonationDetailsFields';
import { MatchedRequestField } from '@/features/donation&request/components/forms/MatchedListingFields';
import MilkBagsField from '@/features/donation&request/components/forms/MilkBagsField';
import { useDonationFormExtraData } from '@/features/donation&request/hooks/useCreateDonationForm';
import { DeliveryCreateSchema, DonationCreateSchema } from '@lactalink/form-schemas';
import { extractCollection } from '@lactalink/utilities/extractors';
import { Stack } from 'expo-router';
import { useMemo } from 'react';
import { useWatch } from 'react-hook-form';
import { toast } from 'sonner-native';

export default function DetailsStep({ onNextPress }: { onNextPress?: () => void }) {
  const { getValues, additionalState, control, formState, setValue, trigger } =
    useForm<DonationCreateSchema>();

  const { isMatched, requestQuery } = useDonationFormExtraData();

  const matchedRequest = requestQuery.data;
  const requesterDP = extractCollection(matchedRequest?.deliveryPreferences);

  const recipient = useMemo(() => {
    const values = getValues();
    if (values.type === 'DIRECT') {
      return values.recipient;
    }
    return null;
  }, [getValues]);

  const donationType = useWatch({ control, name: 'type' });

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
    const isValid = await trigger();
    if (!isValid) {
      toast.error('Please fix the errors in the form before proceeding.');
      return;
    }
    onNextPress?.();
  }

  return (
    <>
      <Stack.Screen options={{ headerTitle: 'Create Donation' }} />

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

          <MilkBagsField className="mx-4" isLoading={isLoading} isDisabled={disableFields} />

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

          <Button onPress={handleNextPress} isDisabled={disableFields} className="mx-4 mt-4">
            <ButtonText>Proceed</ButtonText>
          </Button>
        </KeyboardAvoidingScrollView>
      </SafeArea>
    </>
  );
}
