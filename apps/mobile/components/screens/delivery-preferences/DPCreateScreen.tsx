import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { toast } from 'sonner-native';

import { Form } from '@/components/contexts/FormProvider';
import FormPreventBack from '@/components/forms/FormPreventBack';
import KeyboardAvoidingScrollView from '@/components/KeyboardAvoider';
import { ActionModal } from '@/components/modals/ActionModal';
import DeliveryPreferenceFields from '@/features/delivery-preference/components/DeliveryPreferenceFields';
import { useUpsertDPMutation } from '@/features/delivery-preference/hooks/mutations';
import { useDeliveryPreferenceForm } from '@/features/delivery-preference/hooks/useDeliveryPreferenceForm';
import { DeliveryPreferenceCreateSchema, DeliveryPreferenceSchema } from '@lactalink/form-schemas';
import { ErrorSearchParams } from '@lactalink/types';
import { extractErrorMessage } from '@lactalink/utilities/extractors';
import { Control } from 'react-hook-form';
import { GestureResponderEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function DPCreateScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const form = useDeliveryPreferenceForm(undefined);

  const { isLoading, fetchError: error, handleSubmit, formState, control } = form;
  const { isSubmitting } = formState;

  const { mutateAsync: upsertDP } = useUpsertDPMutation();

  useEffect(() => {
    if (!isLoading && error) {
      const params: ErrorSearchParams = { message: error.message, action: 'go-back' };
      router.push({ pathname: '/error', params });
    }
  }, [isLoading, error, router]);

  async function onSubmit(formData: DeliveryPreferenceCreateSchema) {
    const toastID = 'dp-upsert';
    toast.loading('Saving delivery preference...', {
      id: toastID,
      duration: Infinity,
      close: null,
    });

    await upsertDP(formData).then(
      () => {
        toast.success('Delivery preference saved!', { id: toastID });
        router.back();
      },
      (err) => {
        toast.error(`Failed to save: ${extractErrorMessage(err)}`, { id: toastID });
      }
    );
  }

  async function handleValidation(e: GestureResponderEvent) {
    const isValid = await form.trigger();
    if (!isValid) e.preventDefault();
  }

  return (
    <Form {...form}>
      <FormPreventBack />

      <KeyboardAvoidingScrollView
        refreshing={form.refreshing || false}
        onRefresh={form.onRefresh}
        contentContainerClassName="p-5 pb-2 grow gap-6"
        style={{ marginBottom: insets.bottom }}
      >
        <DeliveryPreferenceFields
          control={control as unknown as Control<DeliveryPreferenceSchema>}
          space="2xl"
          className="flex-1"
          isLoading={isLoading}
        />

        <ActionModal
          title="Review Submit"
          description="Are you sure you want to create this delivery preference? You can always edit it later."
          triggerLabel="Create"
          onTriggerPress={handleValidation}
          onConfirm={handleSubmit(onSubmit)}
          isDisabled={isSubmitting}
        />
      </KeyboardAvoidingScrollView>
    </Form>
  );
}
