import React from 'react';
import { useFormContext } from 'react-hook-form';
import { ScrollView } from 'react-native-gesture-handler';
import { toast } from 'sonner-native';

import { DeliveryPreferenceCard } from '@/components/cards/DeliveryPreferenceCard';
import { FormField } from '@/components/FormField';
import { ActionModal } from '@/components/modals';
import SafeArea from '@/components/SafeArea';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { VStack } from '@/components/ui/vstack';
import { useAuth } from '@/hooks/auth/useAuth';
import { useDeliveryPreferenceForm } from '@/hooks/forms';
import { upsertDeliveryPreference } from '@/lib/api/upsert';
import { COLLECTION_QUERY_KEY, DAYS, DELIVERY_OPTIONS } from '@/lib/constants';
import { DeliveryPreferenceSchema } from '@lactalink/types/forms';
import { extractErrorMessage } from '@lactalink/utilities/errors';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { CalendarDaysIcon, MapPinIcon, TruckIcon } from 'lucide-react-native';

export default function EditPage() {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { isLoading } = useDeliveryPreferenceForm();

  const form = useFormContext<DeliveryPreferenceSchema>();
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

    queryClient.invalidateQueries({
      queryKey: COLLECTION_QUERY_KEY,
    });

    form.reset(formData);
    router.back();
  }

  async function handleValidation() {
    const isValid = await form.trigger();
    if (!isValid) {
      throw new Error('Form validation failed');
    }
  }

  return (
    <SafeArea safeTop={false} mode="margin" className="relative flex-1 overflow-hidden">
      <ScrollView style={{ flex: 1 }}>
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
              autoCapitalize="words"
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

          {isLoading ? (
            <AddressSkeleton />
          ) : (
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
          )}

          <ActionModal
            action="positive"
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
      </ScrollView>
    </SafeArea>
  );
}

function AddressSkeleton() {
  return (
    <Card>
      <VStack space="md">
        <Skeleton variant="rounded" className="h-8 w-44" />
        <Skeleton variant="rounded" className="h-10" />
        <Skeleton variant="rounded" className="h-6" />
      </VStack>
    </Card>
  );
}
