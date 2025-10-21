import { FloatingActionButton } from '@/components/buttons/FloatingActionButton';
import ProfileCard from '@/components/cards/ProfileCard';
import { Form } from '@/components/contexts/FormProvider';
import { DeliveryPreferencesField } from '@/components/fields/DeliveryPreferencesField';
import { FormField } from '@/components/FormField';
import { RefreshControl } from '@/components/RefreshControl';
import SafeArea from '@/components/SafeArea';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useRevalidateCollectionQueries } from '@/hooks/collections/useRevalidateQueries';
import { useEditRequestForm } from '@/hooks/forms/useEditRequestForm';
import { uploadImage } from '@/lib/api/file';
import { getApiClient } from '@lactalink/api';
import { STORAGE_TYPES, URGENCY_LEVELS } from '@lactalink/enums';
import { RequestUpdateSchema } from '@lactalink/form-schemas';
import { extractErrorMessage, extractID } from '@lactalink/utilities/extractors';
import { useLocalSearchParams } from 'expo-router';
import { ClockIcon } from 'lucide-react-native';
import React, { useState } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { toast } from 'sonner-native';

export default function RequestEditPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [floatingButtonHeight, setFloatingButtonHeight] = useState(0);
  const revalidate = useRevalidateCollectionQueries();

  const form = useEditRequestForm(id);

  const { watch, isLoading, formState, reset, onRefresh, refreshing = false } = form;
  const recipient = watch('recipient');

  const isSubmitting = formState.isSubmitting;
  const isDirty = formState.isDirty;
  const showFloatingButton = isDirty;

  const submit = form.handleSubmit(onSubmit);

  async function onSubmit(data: RequestUpdateSchema) {
    const promise = update(data);

    toast.promise(promise, {
      loading: 'Updating request...',
      success: (res) => res.message,
      error: (err) => extractErrorMessage(err),
    });

    await promise;
    reset(data);
    revalidate(['requests']);
  }

  function handleReset() {
    reset();
  }

  return (
    <Form {...form}>
      <SafeArea mode="margin" safeTop={false}>
        <KeyboardAwareScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerClassName="py-5 gap-8"
          contentContainerStyle={{ paddingBottom: floatingButtonHeight + 20 }}
        >
          {recipient && (
            <Box className="mx-5 mb-4">
              <Text className="font-JakartaSemiBold mb-1">Selected Donor</Text>
              <ProfileCard profile={recipient} variant="elevated" />
            </Box>
          )}

          <VStack space="xl" className="mx-5">
            <Text size="lg" className="font-JakartaSemiBold">
              Milk Details
            </Text>

            <FormField
              control={form.control}
              name="details.storagePreference"
              label="Select how you would like the milk to be stored/preserved."
              fieldType="button-group"
              options={[...Object.values(STORAGE_TYPES), { label: 'Either', value: 'EITHER' }]}
              isLoading={isLoading}
              isDisabled={isLoading || isSubmitting}
            />

            <FormField
              control={form.control}
              name="details.urgency"
              label="How urgently do you need the milk?"
              fieldType="button-group"
              options={Object.values(URGENCY_LEVELS)}
              isDisabled={isLoading || isSubmitting}
            />
          </VStack>

          <VStack space="sm" className="mx-5">
            <Text className="font-JakartaMedium">When do you need the milk?</Text>
            <VStack className="flex-col gap-4">
              <FormField
                control={form.control}
                name="details.neededAt"
                fieldType="date"
                mode="date"
                helperText="Select a date when you need the milk."
                datePickerOptions={{ minimumDate: new Date() }}
                placeholder="Select date..."
                style={{ maxWidth: 200 }}
                isDisabled={isLoading || isSubmitting}
              />

              <FormField
                control={form.control}
                name="details.neededAt"
                fieldType="date"
                mode="time"
                helperText="Specify the time when you need the milk."
                placeholder="Select time..."
                inputIcon={ClockIcon}
                style={{ maxWidth: 200 }}
                showSetNowButton
                datePickerOptions={{ minimumDate: new Date() }}
                isDisabled={isLoading || isSubmitting}
              />
            </VStack>
          </VStack>

          <Box className="mx-5">
            <FormField
              control={form.control}
              name="details.reason"
              label="Reason for Request"
              fieldType="textarea"
              placeholder="Please provide a brief reason for your request."
              helperText="Optional, but helps the donor understand your needs."
              isDisabled={isLoading || isSubmitting}
            />
          </Box>

          <Box className="mx-5">
            <FormField
              control={form.control}
              name="details.notes"
              label="Additional Notes (If any)"
              fieldType="textarea"
              placeholder="Any additional information about the milk, such as health conditions, medications, etc."
              helperText="This information will be shared with the recipient."
              isDisabled={isLoading || isSubmitting}
            />
          </Box>

          <DeliveryPreferencesField isLoading={isLoading} isDisabled={isSubmitting} />

          <Box className="mx-5">
            <FormField
              control={form.control}
              name="details.image"
              label="Image of Recipient"
              fieldType="image"
              allowsMultipleSelection={false}
              helperText="Optional, but may encourage donors to fulfill your request."
              isDisabled={isLoading || isSubmitting}
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

async function update({ id, details, deliveryPreferences, ...data }: RequestUpdateSchema) {
  const apiClient = getApiClient();

  const image = details.image;

  const imageID = image ? image.id || (await uploadImage('images', image)).id : undefined;

  const updatedRequest = await apiClient.updateByID({
    collection: 'requests',
    id: id,
    data: {
      ...data,
      details: { ...details, bags: extractID(details.bags), image: imageID },
      deliveryPreferences: extractID(deliveryPreferences),
    },
  });

  return { message: 'Request updated successfully!', donation: updatedRequest };
}
