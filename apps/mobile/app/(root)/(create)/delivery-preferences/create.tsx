import React from 'react';
import { toast } from 'sonner-native';

import { DeliveryPreferenceCard } from '@/components/cards/DeliveryPreferenceCard';
import { Form } from '@/components/contexts/FormProvider';
import { AddressField } from '@/components/fields';
import { FormField } from '@/components/FormField';
import FormPreventBack from '@/components/forms/FormPreventBack';
import { ActionModal } from '@/components/modals';
import { RefreshControl } from '@/components/RefreshControl';
import SafeArea from '@/components/SafeArea';
import { Card } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useRevalidateCollectionQueries } from '@/hooks/collections/useRevalidateQueries';
import { useDeliveryPreferenceForm } from '@/hooks/forms/useDeliveryPreferenceForm';
import { upsertDeliveryPreference } from '@/lib/api/upsert';
import { DAYS, DELIVERY_OPTIONS } from '@lactalink/enums';
import { DeliveryPreferenceCreateSchema } from '@lactalink/form-schemas';
import { ErrorSearchParams } from '@lactalink/types';
import { extractErrorMessage } from '@lactalink/utilities/extractors';
import { Redirect, useRouter } from 'expo-router';
import { CalendarDaysIcon, MapPinIcon, TagIcon, TruckIcon } from 'lucide-react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

export default function CreatePage() {
  const router = useRouter();
  const revalidateQueries = useRevalidateCollectionQueries();

  const form = useDeliveryPreferenceForm(null);

  const isSubmitting = form.formState.isSubmitting;
  const isLoading = form.isLoading;
  const error = form.fetchError;

  const formData = form.watch();

  const submit = form.handleSubmit(onSubmit);

  async function onSubmit(formData: DeliveryPreferenceCreateSchema) {
    const promise = upsertDeliveryPreference(formData);

    toast.promise(promise, {
      loading: 'Saving delivery preference...',
      success: (res: { message: string }) => {
        return res.message;
      },
      error: (error) => {
        return extractErrorMessage(error);
      },
    });

    await promise;

    revalidateQueries(['delivery-preferences', 'users']);

    form.reset(formData);
    router.back();
  }

  async function handleValidation() {
    const isValid = await form.trigger();
    if (!isValid) {
      throw new Error('Form validation failed');
    }
  }

  if (!isLoading && error) {
    const params: ErrorSearchParams = { message: error.message };
    return <Redirect href={{ pathname: '/error', params }} />;
  }

  return (
    <Form {...form}>
      <FormPreventBack />

      <SafeArea safeTop={false} mode="margin" className="relative flex-1 overflow-hidden">
        <KeyboardAwareScrollView
          refreshControl={
            <RefreshControl refreshing={form.refreshing || false} onRefresh={form.onRefresh} />
          }
        >
          <VStack space="2xl" className="p-5">
            <FormField
              control={form.control}
              name="preferredMode"
              fieldType="button-group"
              options={Object.values(DELIVERY_OPTIONS)}
              labelIcon={TruckIcon}
              label="Preferred Delivery Modes"
              containerClassName="gap-2"
              helperText="You can select multiple mode of delivery."
              allowMultipleSelection
              isDisabled={isSubmitting}
            />
            <FormField
              control={form.control}
              name="availableDays"
              fieldType="button-group"
              label="Available Days"
              helperText="You can select multiple days for delivery."
              labelIcon={CalendarDaysIcon}
              options={Object.values(DAYS)}
              containerClassName="gap-2"
              allowMultipleSelection
              isDisabled={isSubmitting}
            />

            <AddressField
              control={form.control}
              name="address"
              isLoading={isLoading}
              label="Preferred Address"
              labelIcon={MapPinIcon}
              isDisabled={isSubmitting}
            />

            <VStack>
              <HStack space="sm">
                <Icon as={TagIcon} />
                <Text className="mb-1 font-JakartaMedium">Label</Text>
              </HStack>
              <Card isDisabled={isSubmitting}>
                <FormField
                  control={form.control}
                  name="name"
                  fieldType="text"
                  variant="underlined"
                  placeholder="e.g. Home Delivery, Office Delivery"
                  helperText="Give a name to your delivery preference."
                  keyboardType="default"
                  autoCapitalize="words"
                />
              </Card>
            </VStack>

            <ActionModal
              title="Review Submit"
              description={
                <DeliveryPreferenceCard preference={formData} variant="ghost" className="p-0" />
              }
              triggerLabel="Submit"
              onTriggerPress={handleValidation}
              onConfirm={submit}
              isDisabled={isSubmitting}
            />
          </VStack>
        </KeyboardAwareScrollView>
      </SafeArea>
    </Form>
  );
}
