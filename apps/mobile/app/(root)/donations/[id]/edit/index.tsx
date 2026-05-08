import { useForm } from '@/components/contexts/FormProvider';
import { ImageField } from '@/components/form-fields/ImageField';
import { SelectInputField } from '@/components/form-fields/SelectInputField';
import { TextAreaField } from '@/components/form-fields/TextAreaField';
import KeyboardAvoidingScrollView from '@/components/KeyboardAvoider';
import SafeArea from '@/components/SafeArea';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { COLLECTION_MODES, STORAGE_TYPES } from '@lactalink/enums';
import { DonationUpdateSchema } from '@lactalink/form-schemas/listings';
import { useRouter } from 'expo-router';

import { Button, ButtonText } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import DeliveryPreferencesField from '@/features/donation&request/components/forms/fields/DeliveryPreferencesField';
import MilkBagsField from '@/features/donation&request/components/forms/fields/MilkBagsField';
import { ClipboardPenIcon } from 'lucide-react-native';
import { useFormState } from 'react-hook-form';

export default function DonationEdit() {
  const router = useRouter();

  const { control, reset, handleSubmit, additionalState } = useForm<DonationUpdateSchema>();
  const { isLoading, refreshing, onRefresh } = additionalState;
  const { isSubmitting } = useFormState({ control });
  const disableFields = isSubmitting;

  async function onSubmit(data: DonationUpdateSchema) {
    reset(data);
    router.push('./milkbag-verification', { relativeToDirectory: true });
  }

  return (
    <SafeArea mode="margin" safeTop={false} className="items-stretch justify-start">
      <KeyboardAvoidingScrollView
        refreshing={refreshing}
        onRefresh={onRefresh}
        contentContainerClassName="py-5 gap-6"
      >
        <VStack space="lg" className="px-4">
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
            triggerInputProps={{ placeholder: 'Select storage type' }}
            items={Object.values(STORAGE_TYPES)}
            transformItem={(item) => item}
            isDisabled={disableFields}
          />

          <SelectInputField
            control={control}
            name="details.collectionMode"
            label="How did you collect the milk?"
            triggerInputProps={{ placeholder: 'Select collection method' }}
            items={Object.values(COLLECTION_MODES)}
            transformItem={(item) => item}
            isDisabled={disableFields}
          />

          <TextAreaField
            control={control}
            name="details.notes"
            label="Additional Notes"
            helperText="This information will be shared with the recipient."
            isDisabled={disableFields}
            textareaProps={{
              placeholder:
                'Any additional information about the milk, such as health conditions, medications, etc.',
            }}
          />

          <ImageField
            control={control}
            name="details.image"
            label="Cover Image"
            helperText="Upload a cover image to feature your donation."
            isDisabled={disableFields}
            options={{ allowsMultipleSelection: false }}
          />
        </VStack>

        <Divider />

        <MilkBagsField
          className="mx-4"
          control={control}
          isLoading={isLoading}
          isDisabled={disableFields}
        />

        <Divider />

        <DeliveryPreferencesField
          control={control}
          isLoading={isLoading}
          isDisabled={disableFields}
        />

        <Button onPress={handleSubmit(onSubmit)} isDisabled={disableFields} className="mx-4 mt-4">
          <ButtonText>Proceed</ButtonText>
        </Button>
      </KeyboardAvoidingScrollView>
    </SafeArea>
  );
}
