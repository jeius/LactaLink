import { useForm } from '@/components/contexts/FormProvider';
import { FormField } from '@/components/FormField';
import { RefreshControl } from '@/components/RefreshControl';
import SafeArea from '@/components/SafeArea';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { ID_TYPES } from '@lactalink/enums';
import { IdentitySchema } from '@lactalink/form-schemas';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { IdCardIcon, ListChecksIcon } from 'lucide-react-native';
import React from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

export default function IDVerificationDetails() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const {
    control,
    trigger,
    getValues,
    additionalState: { isLoading, refreshing = false, onRefresh },
  } = useForm<IdentitySchema>();
  const idType = getValues('details.idType');

  async function handleNext() {
    const validations = await Promise.all([trigger('details'), trigger('idImage')]);

    const allValid = validations.every((v) => v);

    if (allValid) {
      router.push({ pathname: '/id-verification/review', params });
    }
  }

  return (
    <SafeArea safeTop={false} className="items-stretch">
      <KeyboardAwareScrollView
        className="flex-1"
        contentContainerClassName="flex-col grow gap-4 p-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 8 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <VStack space="xs">
          <Text bold size="xl">
            ID Document Details
          </Text>
          <Text>Please provide the ID details as it appears on your government-issued ID.</Text>
        </VStack>

        <HStack space="sm" className="items-center">
          <Icon size="2xl" as={IdCardIcon} className="text-info-600" />
          <Text size="lg" className="font-JakartaSemiBold text-info-600 capitalize">
            {ID_TYPES[idType].label}
          </Text>
        </HStack>

        <FormField
          control={control}
          name="details.idNumber"
          label="ID Number"
          fieldType="text"
          placeholder="Enter your registered ID number."
          helperText="This can be either your Driver's License No., Passport No., Registration No. or State ID No."
          autoCapitalize="none"
          autoComplete="off"
          textContentType="none"
          autoCorrect={false}
          isLoading={isLoading}
        />

        <FormField
          control={control}
          name="details.issueDate"
          label="Date of Issue (Optional)"
          fieldType="date"
          datePickerOptions={{ maximumDate: new Date(), minimumDate: new Date('1990-01-01') }}
          placeholder="Select the date of issue."
          helperText="This is the date your ID was issued/registered. This can usually be found on the front or back of your ID."
          isLoading={isLoading}
        />

        <FormField
          control={control}
          name="details.expiryDate"
          label="Date of Expiry (Optional)"
          fieldType="date"
          datePickerOptions={{
            maximumDate: new Date('2299-12-31'),
            minimumDate: new Date('1990-01-01'),
          }}
          placeholder="Select the date of expiry."
          helperText="This is the date your ID expires. This can usually be found on the front or back of your ID."
          isLoading={isLoading}
        />

        <FormField
          control={control}
          name="idImage"
          label="Upload ID Image"
          fieldType="image"
          placeholder="Upload a clear image of your ID."
          helperText="Upload an image of your ID where your face is visible. Make sure the image is clear and all details are visible."
          allowsMultipleSelection={false}
          allowsEditing={true}
          isLoading={isLoading}
        />

        <Box className="mt-4 flex-1 justify-end">
          <Button isDisabled={isLoading} onPress={handleNext}>
            <ButtonIcon as={ListChecksIcon} />
            <ButtonText>Review Information</ButtonText>
          </Button>
        </Box>
      </KeyboardAwareScrollView>
    </SafeArea>
  );
}
