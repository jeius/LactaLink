import React from 'react';
import { FormProvider } from 'react-hook-form';
import { toast } from 'sonner-native';

import { DeliveryPreferenceCard } from '@/components/cards/DeliveryPreferenceCard';
import { AddressField } from '@/components/fields';
import { FormField } from '@/components/FormField';
import FormPreventBack from '@/components/forms/FormPreventBack';
import KeyboardAvoidingWrapper from '@/components/KeyboardAvoider';
import FetchingSpinner from '@/components/loaders/FetchingSpinner';
import { ActionModal } from '@/components/modals';
import SafeArea from '@/components/SafeArea';
import { Card } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useRevalidateQueries } from '@/hooks/collections/useRevalidateQueries';
import { useDeliveryPreferenceForm } from '@/hooks/forms';
import { upsertDeliveryPreference } from '@/lib/api/upsert';
import { DAYS, DELIVERY_OPTIONS } from '@/lib/constants';
import { DeliveryPreference, ErrorSearchParams } from '@lactalink/types';
import { DeliveryPreferenceSchema } from '@lactalink/types/forms';
import { extractErrorMessage } from '@lactalink/utilities/errors';
import { Redirect, useRouter } from 'expo-router';
import { CalendarDaysIcon, MapPinIcon, TagIcon, TruckIcon } from 'lucide-react-native';

export default function CreatePage() {
  const router = useRouter();
  const revalidateQueries = useRevalidateQueries();

  const { form, isLoading, isFetching, error } = useDeliveryPreferenceForm();

  const isSubmitting = form.formState.isSubmitting;

  const formData = form.watch();

  const submit = form.handleSubmit(onSubmit);

  async function onSubmit(formData: DeliveryPreferenceSchema) {
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

    revalidateQueries();

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
    <FormProvider {...form}>
      <FormPreventBack />

      <SafeArea safeTop={false} mode="margin" className="relative flex-1 overflow-hidden">
        <KeyboardAvoidingWrapper>
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
                <Text className="font-JakartaMedium mb-1">Label</Text>
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
                <DeliveryPreferenceCard
                  preference={formData as DeliveryPreference}
                  variant="ghost"
                  className="p-0"
                />
              }
              triggerLabel="Submit"
              onTriggerPress={handleValidation}
              onConfirm={submit}
              isDisabled={isSubmitting}
            />
          </VStack>
        </KeyboardAvoidingWrapper>
      </SafeArea>
      {!isLoading && <FetchingSpinner isFetching={isFetching} />}
    </FormProvider>
  );
}
