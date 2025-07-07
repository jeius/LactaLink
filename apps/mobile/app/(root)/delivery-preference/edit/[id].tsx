import React from 'react';
import { useFormContext } from 'react-hook-form';
import { ScrollView } from 'react-native-gesture-handler';
import { toast } from 'sonner-native';

import { FormField } from '@/components/FormField';
import ActionModal from '@/components/modals/ActionModal';
import SafeArea from '@/components/SafeArea';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Skeleton } from '@/components/ui/skeleton';
import { VStack } from '@/components/ui/vstack';
import { useAuth } from '@/hooks/auth/useAuth';
import { useDeliveryPreferenceForm } from '@/hooks/forms';
import { upsertDeliveryPreference } from '@/lib/api/upsert';
import { COLLECTION_QUERY_KEY, DAYS, DELIVERY_OPTIONS } from '@/lib/constants';
import { getApiClient } from '@lactalink/api';
import { DeliveryPreferenceSchema } from '@lactalink/types/forms';
import { extractErrorMessage } from '@lactalink/utilities/errors';
import { AnimatePresence, Motion } from '@legendapp/motion';
import { useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  CalendarDaysIcon,
  MapPinIcon,
  RotateCcwIcon,
  SaveIcon,
  TrashIcon,
  TruckIcon,
} from 'lucide-react-native';

export default function EditPage() {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { isLoading } = useDeliveryPreferenceForm(id);

  const form = useFormContext<DeliveryPreferenceSchema>();
  const isSubmitting = form.formState.isSubmitting;
  const isDirty = form.formState.isDirty;

  const name = form.getValues('name');

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

    queryClient.invalidateQueries({
      queryKey: COLLECTION_QUERY_KEY,
    });

    form.reset(formData);
    router.back();
  }

  function handleReset() {
    form.reset();
  }

  async function handleDelete() {
    const apiClient = getApiClient();

    async function deleteDP() {
      const doc = await apiClient.deleteByID({
        collection: 'delivery-preferences',
        id,
      });

      const message = `${doc.name} has been deleted successfully.`;
      return { message };
    }

    const promise = deleteDP();

    toast.promise(promise, {
      loading: 'Deleting delivery preference...',
      success: (res: { message: string }) => res.message,
      error: (error) => extractErrorMessage(error),
    });

    await promise;

    queryClient.invalidateQueries({
      queryKey: COLLECTION_QUERY_KEY,
    });
    router.back();
  }

  return (
    <SafeArea safeTop={false} mode="margin" className="relative flex-1 overflow-hidden">
      <ScrollView style={{ flex: 1 }}>
        {isLoading ? (
          <PageSkeleton />
        ) : (
          <VStack space="2xl" className="mb-20 p-5">
            <Card>
              <FormField
                name="name"
                label="Name"
                fieldType="text"
                variant="underlined"
                placeholder="e.g. Home Delivery, Office Delivery"
                helperText="Give a name to your delivery preference."
                keyboardType="default"
              />
            </Card>

            <Card>
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
            </Card>

            <Card>
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
            </Card>

            <Card>
              <FormField
                name="address"
                fieldType="combobox"
                label="Preferred Address"
                helperText="Select your preferred address for delivery."
                labelIcon={MapPinIcon}
                placeholder="Select Address"
                searchPlaceholder="Search Address"
                containerClassName="gap-2"
                collection="addresses"
                where={{ owner: { equals: user?.id } }}
                searchPath="displayName"
                labelPath="name"
                descriptionPath="displayName"
                icon={MapPinIcon}
                iconPosition="left"
              />
            </Card>

            <ActionModal
              action="negative"
              title="Confirm Delete"
              description={`Are you sure you want to delete "${name}"?`}
              confirmLabel="Delete"
              triggerIcon={TrashIcon}
              triggerLabel="Delete Delivery Preference"
              onConfirm={handleDelete}
              isDisabled={isSubmitting}
            />
          </VStack>
        )}
      </ScrollView>

      <AnimatePresence>
        {isDirty && (
          <Motion.View
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 80 }}
            transition={{ type: 'spring', damping: 20, stiffness: 400 }}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: 8,
            }}
          >
            <Card className="mx-auto p-4">
              <HStack space="md" className="w-full justify-end">
                <Box className="flex-1">
                  <Button onPress={submit} isDisabled={isSubmitting}>
                    <ButtonIcon as={SaveIcon} />
                    <ButtonText>Save</ButtonText>
                  </Button>
                </Box>

                <Button
                  isDisabled={isSubmitting}
                  variant="outline"
                  action="default"
                  onPress={handleReset}
                >
                  <ButtonIcon as={RotateCcwIcon} />
                  <ButtonText>Reset</ButtonText>
                </Button>
              </HStack>
            </Card>
          </Motion.View>
        )}
      </AnimatePresence>
    </SafeArea>
  );
}

function PageSkeleton() {
  return (
    <VStack space="2xl" className="mb-20 p-5">
      <Card>
        <VStack space="md">
          <Skeleton variant="rounded" className="h-8 w-32" />
          <Skeleton variant="rounded" className="h-10" />
          <Skeleton variant="rounded" className="h-6" />
        </VStack>
      </Card>

      <Card>
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
      </Card>

      <Card>
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
      </Card>

      <Card>
        <VStack space="md">
          <Skeleton variant="rounded" className="h-8 w-44" />
          <Skeleton variant="rounded" className="h-10" />
          <Skeleton variant="rounded" className="h-6" />
        </VStack>
      </Card>
    </VStack>
  );
}
