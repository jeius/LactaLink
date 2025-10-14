import { useForm } from '@/components/contexts/FormProvider';
import { FormField } from '@/components/FormField';
import { RefreshControl } from '@/components/RefreshControl';
import SafeArea from '@/components/SafeArea';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { IdentitySchema } from '@lactalink/form-schemas';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronRightIcon } from 'lucide-react-native';
import React from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

export default function IDVerificationInfo() {
  const {
    control,
    trigger,
    additionalState: { isLoading, refreshing = false, onRefresh },
  } = useForm<IdentitySchema>();
  const params = useLocalSearchParams();
  const router = useRouter();

  function handleNext() {
    trigger('personalInfo').then((valid) => {
      if (valid) {
        router.push({ pathname: '/id-verification/id-details', params });
      }
    });
  }

  return (
    <SafeArea safeTop={false} className="items-stretch">
      <KeyboardAwareScrollView
        contentContainerClassName="flex-col gap-4 p-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 8 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <VStack space="xs">
          <Text bold size="xl">
            Personal Information
          </Text>
          <Text>
            Please provide your personal information as it appears on your government-issued ID.
          </Text>
        </VStack>

        <FormField
          control={control}
          name="personalInfo.givenName"
          label="Given Name"
          fieldType="text"
          placeholder="Enter your given name."
          autoCapitalize="words"
          autoComplete="name-given"
          textContentType="givenName"
          autoCorrect={true}
          helperText="Enter given name as it appears on your ID (e.g., first name)."
          isLoading={isLoading}
        />

        <FormField
          control={control}
          name="personalInfo.middleName"
          label="Middle Name"
          fieldType="text"
          placeholder="Enter your middle name."
          autoCapitalize="words"
          autoComplete="name-middle"
          textContentType="middleName"
          helperText="Enter middle name if applicable."
          isLoading={isLoading}
        />

        <FormField
          control={control}
          name="personalInfo.familyName"
          label="Family Name"
          fieldType="text"
          placeholder="Enter your family name."
          autoCapitalize="words"
          autoComplete="name-family"
          textContentType="familyName"
          helperText="Enter family name as it appears on your ID (e.g., last name or surname)."
          isLoading={isLoading}
        />

        <FormField
          control={control}
          name="personalInfo.suffix"
          label="Suffix"
          fieldType="text"
          placeholder="Enter your suffix name."
          autoCapitalize="words"
          autoComplete="name-suffix"
          textContentType="nameSuffix"
          helperText="Enter suffix if applicable (e.g., Jr., Sr., III)."
          isLoading={isLoading}
        />

        <FormField
          control={control}
          name="personalInfo.birth"
          label="Date of Birth (Optional)"
          fieldType="date"
          datePickerOptions={{ maximumDate: new Date(), minimumDate: new Date('1900-01-01') }}
          placeholder="Select your date of birth."
          helperText="Provide your birth if it exist on your ID."
          isLoading={isLoading}
        />

        <FormField
          control={control}
          name="personalInfo.address"
          label="Address (Optional)"
          fieldType="text"
          placeholder="Enter your complete address."
          autoCapitalize="none"
          autoComplete="street-address"
          textContentType="fullStreetAddress"
          helperText="Provide your address if it exist on your ID."
          isLoading={isLoading}
        />

        <Button className="mt-4" isDisabled={isLoading} onPress={handleNext}>
          <ButtonText>Continue</ButtonText>
          <ButtonIcon as={ChevronRightIcon} />
        </Button>
      </KeyboardAwareScrollView>
    </SafeArea>
  );
}
