import { FloatingActionButton } from '@/components/buttons/FloatingActionButton';
import ProfileCard from '@/components/cards/ProfileCard';
import { Form } from '@/components/contexts/FormProvider';
import { DeliveryPreferencesField } from '@/components/fields/DeliveryPreferencesField';
import { FormField } from '@/components/FormField';
import SafeArea from '@/components/SafeArea';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useRevalidateCollectionQueries } from '@/hooks/collections/useRevalidateQueries';
import { useEditDonationForm } from '@/hooks/forms/useEditDonationForm';
import { uploadImage } from '@/lib/api/file';
import { getApiClient } from '@lactalink/api';
import { COLLECTION_MODES, STORAGE_TYPES } from '@lactalink/enums';
import { UpdateDonationSchema } from '@lactalink/form-schemas';
import { extractErrorMessage, extractID } from '@lactalink/utilities/extractors';
import { useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { toast } from 'sonner-native';

export default function DonationEditPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [floatingButtonHeight, setFloatingButtonHeight] = useState(0);
  const revalidate = useRevalidateCollectionQueries();

  const form = useEditDonationForm(id);

  const { watch, isLoading, formState, reset } = form;
  const recipient = watch('recipient');

  const disableFields = formState.isSubmitting;
  const isDirty = formState.isDirty;
  const showFloatingButton = isDirty;

  const submit = form.handleSubmit(onSubmit);

  async function onSubmit(data: UpdateDonationSchema) {
    const promise = update(data);

    toast.promise(promise, {
      loading: 'Updating donation...',
      success: (res) => res.message,
      error: (err) => extractErrorMessage(err),
    });

    await promise;
    reset(data);
    revalidate(['donations']);
  }

  function handleReset() {
    reset();
  }

  return (
    <Form {...form}>
      <SafeArea mode="margin" safeTop={false}>
        <KeyboardAwareScrollView
          contentContainerClassName="py-5 gap-8"
          contentContainerStyle={{ paddingBottom: floatingButtonHeight + 20 }}
        >
          {recipient && (
            <Box className="mx-5 mb-4">
              <Text className="font-JakartaSemiBold mb-1">Selected Recipient</Text>
              <ProfileCard isLoading={isLoading} profile={recipient} variant="elevated" />
            </Box>
          )}

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
              isLoading={isLoading}
              isDisabled={isLoading || disableFields}
            />

            <FormField
              control={form.control}
              key={'details.collectionMode'}
              name="details.collectionMode"
              label="How did you collect the milk?"
              fieldType="button-group"
              options={Object.values(COLLECTION_MODES)}
              isLoading={isLoading}
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
              isLoading={isLoading}
              isDisabled={isLoading || disableFields}
            />
          </Box>

          <DeliveryPreferencesField isLoading={isLoading} isDisabled={disableFields} />

          <Box className="mx-5">
            <FormField
              control={form.control}
              name="details.image"
              label="Cover Image"
              fieldType="image"
              helperText="Upload a cover image to feature your donation."
              isLoading={isLoading}
              isDisabled={isLoading || disableFields}
              allowsMultipleSelection={false}
            />
          </Box>
        </KeyboardAwareScrollView>

        <FloatingActionButton
          onConfirm={submit}
          onCancel={handleReset}
          show={showFloatingButton}
          confirmLabel="Save Changes"
          cancelLabel="Reset"
          onLayout={(e) => {
            const { height } = e.nativeEvent.layout;
            setFloatingButtonHeight(height);
          }}
        />
      </SafeArea>
    </Form>
  );
}

async function update({ id, details, ...data }: UpdateDonationSchema) {
  const apiClient = getApiClient();

  const image = details.image;

  const imageID = image ? image.id || (await uploadImage('images', image)).id : undefined;

  const updatedDonation = await apiClient.updateByID({
    collection: 'donations',
    id: id,
    data: {
      ...data,
      details: { ...details, milkSample: imageID ? [imageID] : undefined },
      deliveryPreferences: extractID(data.deliveryPreferences),
    },
  });

  return { message: 'Donation updated successfully!', donation: updatedDonation };
}
