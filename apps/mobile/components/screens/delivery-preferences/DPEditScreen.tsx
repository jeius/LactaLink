import { useLocalSearchParams, useRouter } from 'expo-router';
import { Trash2Icon } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { useWatch } from 'react-hook-form';
import { toast } from 'sonner-native';

import { FloatingActionButton } from '@/components/buttons';
import { Form } from '@/components/contexts/FormProvider';
import FormPreventBack from '@/components/forms/FormPreventBack';
import KeyboardAvoidingScrollView from '@/components/KeyboardAvoider';
import LoadingSpinner from '@/components/loaders/LoadingSpinner';
import { ActionModal } from '@/components/modals';
import SafeArea from '@/components/SafeArea';
import { Text } from '@/components/ui/text';
import DeliveryPreferenceFields from '@/features/delivery-preference/components/DeliveryPreferenceFields';
import {
  useDeleteDPMutation,
  useUpsertDPMutation,
} from '@/features/delivery-preference/hooks/mutations';
import { useDeliveryPreferenceForm } from '@/features/delivery-preference/hooks/useDeliveryPreferenceForm';
import { DeliveryPreferenceSchema } from '@lactalink/form-schemas';
import { ErrorSearchParams } from '@lactalink/types';
import { extractErrorMessage } from '@lactalink/utilities/extractors';

export default function DPEditScreen() {
  //#region Hooks
  const router = useRouter();
  const [floatingButtonHeight, setFloatingButtonHeight] = useState(0);

  const { id } = useLocalSearchParams<{ id: string }>();

  const form = useDeliveryPreferenceForm(id);
  //#endregion

  //#region Form State
  const { isLoading, fetchError: error, handleSubmit, formState, control } = form;
  const { isSubmitting, isDirty } = formState;
  const showFloatingButton = isDirty;

  const name = useWatch({ control, name: 'name' });
  //#endregion

  const { mutateAsync: upsertDP } = useUpsertDPMutation();
  const { mutateAsync: deleteDP } = useDeleteDPMutation();

  useEffect(() => {
    if (!isLoading && error) {
      const params: ErrorSearchParams = { message: error.message, action: 'go-back' };
      router.push({ pathname: '/error', params });
    }
  }, [isLoading, error, router]);

  //#region Form Handlers
  async function onSubmit(formData: DeliveryPreferenceSchema) {
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

  async function handleDelete() {
    await deleteDP(id).catch((err) => toast.error(`Failed to delete: ${extractErrorMessage(err)}`));
    router.back();
  }

  function handleReset() {
    form.reset();
  }
  //#endregion

  //#region Render
  return (
    <Form {...form}>
      <FormPreventBack />

      <SafeArea safeTop={false} mode="margin" className="flex-1 overflow-hidden">
        <KeyboardAvoidingScrollView
          refreshing={form.refreshing || false}
          onRefresh={form.onRefresh}
          contentContainerClassName="p-5 grow gap-6"
          style={{ marginBottom: showFloatingButton ? floatingButtonHeight : 0 }}
        >
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <>
              <DeliveryPreferenceFields
                control={control}
                space="2xl"
                className="flex-1"
                isLoading={isLoading}
              />

              <ActionModal
                action="negative"
                title="Confirm Delete"
                description={
                  <Text>
                    Are you sure you want to delete{' '}
                    {<Text className="font-JakartaSemiBold">{name}</Text>}?
                  </Text>
                }
                confirmLabel="Delete"
                triggerIcon={Trash2Icon}
                triggerLabel="Delete Delivery Preference"
                onConfirm={handleDelete}
                isDisabled={isSubmitting}
              />
            </>
          )}
        </KeyboardAvoidingScrollView>

        <FloatingActionButton
          onConfirm={handleSubmit(onSubmit)}
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
  //#endregion
}
