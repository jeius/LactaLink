import React, { useState } from 'react';
import { FormProvider } from 'react-hook-form';
import { toast } from 'sonner-native';

import { AddressesBottomSheet } from '@/components/bottom-sheets/AddressesBottomSheet';
import { AddressCard } from '@/components/cards';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { FormField } from '@/components/FormField';
import FormPreventBack from '@/components/forms/FormPreventBack';
import KeyboardAvoidingWrapper from '@/components/KeyboardAvoider';
import FetchingSpinner from '@/components/loaders/FetchingSpinner';
import { ActionModal } from '@/components/modals';
import SafeArea from '@/components/SafeArea';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from '@/components/ui/form-control';
import { HStack } from '@/components/ui/hstack';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useRevalidateQueries } from '@/hooks/collections/useRevalidateQueries';
import { useDeliveryPreferenceForm } from '@/hooks/forms';
import { deleteCollection } from '@/lib/api/delete';
import { upsertDeliveryPreference } from '@/lib/api/upsert';
import { DAYS, DELIVERY_OPTIONS } from '@/lib/constants';
import { ErrorSearchParams } from '@lactalink/types';
import { DeliveryPreferenceSchema } from '@lactalink/types/forms';
import { extractErrorMessage } from '@lactalink/utilities/errors';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import {
  AlertCircleIcon,
  CalendarDaysIcon,
  Edit2Icon,
  PlusIcon,
  TrashIcon,
  TruckIcon,
} from 'lucide-react-native';

export default function EditPage() {
  //#region Hooks
  const router = useRouter();
  const revalidateQueries = useRevalidateQueries();
  const [floatingButtonHeight, setFloatingButtonHeight] = useState(0);

  const { id } = useLocalSearchParams<{ id: string }>();

  const { form, isFetching, error, isLoading } = useDeliveryPreferenceForm(id);
  //#endregion

  //#region Form State
  const isSubmitting = form.formState.isSubmitting;
  const isDirty = form.formState.isDirty;
  const showFloatingButton = isDirty;

  const { error: addressFieldError } = form.getFieldState('address');

  const name = form.getValues('name');
  const address = form.watch('address');

  const submit = form.handleSubmit(onSubmit);
  //#endregion

  //#region Form Handlers
  function handleAddressChange(id: string) {
    form.setValue('address', id);
  }

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
    router.back();
    form.reset(formData);
  }

  async function handleDelete() {
    const deleted = await deleteCollection('delivery-preferences', id);
    if (!deleted) return;
    revalidateQueries();
    router.back();
  }

  function handleReset() {
    form.reset();
  }
  //#endregion

  if (!isLoading && error) {
    const params: ErrorSearchParams = { message: error.message };
    return <Redirect href={{ pathname: '/error', params }} />;
  }

  //#region Render
  return (
    <FormProvider {...form}>
      <FormPreventBack />

      <SafeArea safeTop={false} mode="margin" className="relative flex-1 overflow-hidden">
        <KeyboardAvoidingWrapper>
          {isLoading ? (
            <PageSkeleton />
          ) : (
            <VStack
              space="2xl"
              className="p-5"
              style={{ marginBottom: showFloatingButton ? floatingButtonHeight : 0 }}
            >
              <FormField
                name="preferredMode"
                fieldType="button-group"
                options={Object.values(DELIVERY_OPTIONS)}
                labelIcon={TruckIcon}
                label="Preferred Delivery Modes"
                containerClassName="gap-2"
                helperText="You can select multiple mode of delivery."
                allowMultipleSelection
              />
              <FormField
                name="availableDays"
                fieldType="button-group"
                label="Available Days"
                helperText="You can select multiple days for delivery."
                labelIcon={CalendarDaysIcon}
                options={Object.values(DAYS)}
                containerClassName="gap-2"
                allowMultipleSelection
              />

              <FormControl isInvalid={!!addressFieldError} isDisabled={isSubmitting}>
                <FormControlLabel>
                  <FormControlLabelText>Preffered Address</FormControlLabelText>
                </FormControlLabel>

                <FormControlError>
                  <FormControlErrorIcon as={AlertCircleIcon} />
                  <FormControlErrorText>{addressFieldError?.message}</FormControlErrorText>
                </FormControlError>

                {address && <AddressCard data={address} showMap isLoading={isLoading} />}

                <AddressesBottomSheet
                  allowMultipleSelection={false}
                  selected={address}
                  onChange={handleAddressChange}
                  triggerComponent={(props) => (
                    <Button
                      {...props}
                      size="sm"
                      variant="outline"
                      action="positive"
                      className="mt-4"
                    >
                      <ButtonIcon as={address ? Edit2Icon : PlusIcon} />
                      <ButtonText>{address ? 'Change' : 'Add'} Address</ButtonText>
                    </Button>
                  )}
                />
              </FormControl>

              <VStack>
                <Text className="font-JakartaMedium mb-1">Name</Text>
                <Card>
                  <FormField
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
                action="negative"
                title="Confirm Delete"
                description={
                  <Text>
                    Are you sure you want to delete{' '}
                    {<Text className="font-JakartaSemiBold">{name}</Text>}?
                  </Text>
                }
                confirmLabel="Delete"
                triggerIcon={TrashIcon}
                triggerLabel="Delete Delivery Preference"
                onConfirm={handleDelete}
                isDisabled={isSubmitting}
              />
            </VStack>
          )}
        </KeyboardAvoidingWrapper>

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
      {!isLoading && <FetchingSpinner isFetching={isFetching} />}
    </FormProvider>
  );
  //#endregion
}

//#region PageSkeleton
function PageSkeleton() {
  return (
    <VStack space="2xl" className="p-5">
      <VStack space="md">
        <Skeleton variant="rounded" className="h-8 w-52" />
        <HStack space="md" className="flex-wrap">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} variant="rounded" className="h-10 w-24" />
          ))}
        </HStack>
        <Skeleton variant="rounded" className="h-6" />
        <Skeleton variant="rounded" className="h-10" />
      </VStack>

      <VStack space="md">
        <Skeleton variant="rounded" className="h-8 w-44" />
        <HStack space="md" className="flex-wrap">
          {Array.from({ length: 7 }).map((_, index) => (
            <Skeleton key={index} variant="rounded" className="h-10 w-24" />
          ))}
        </HStack>
        <Skeleton variant="rounded" className="h-6" />
        <Skeleton variant="rounded" className="h-10" />
      </VStack>

      <VStack space="md">
        <Skeleton variant="rounded" className="h-8 w-44" />
        <Skeleton variant="rounded" className="h-10" />
        <Skeleton variant="rounded" className="h-6" />
      </VStack>

      <VStack space="md">
        <Skeleton variant="rounded" className="h-8 w-32" />
        <Skeleton variant="rounded" className="h-10" />
        <Skeleton variant="rounded" className="h-6" />
      </VStack>
    </VStack>
  );
}
//#endregion
