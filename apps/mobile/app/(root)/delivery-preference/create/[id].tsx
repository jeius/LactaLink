import React from 'react';
import { useFormContext } from 'react-hook-form';
import { ScrollView } from 'react-native-gesture-handler';
import { toast } from 'sonner-native';

import { FormField } from '@/components/FormField';
import { Image } from '@/components/Image';
import ActionModal from '@/components/modals/ActionModal';
import SafeArea from '@/components/SafeArea';
import { Card } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useAuth } from '@/hooks/auth/useAuth';
import { useFetchById } from '@/hooks/collections/useFetchById';
import { useDeliveryPreferenceForm } from '@/hooks/forms';
import { upsertDeliveryPreference } from '@/lib/api/upsert';
import { COLLECTION_QUERY_KEY, DAYS, DELIVERY_OPTIONS } from '@/lib/constants';
import { getDeliveryPreferenceIcon } from '@/lib/utils/getDeliveryPreferenceIcon';
import { DeliveryPreferenceSchema } from '@lactalink/types/forms';
import { formatDaysToText } from '@lactalink/utilities';
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
            title="Review Delivery Preference"
            description={<Description data={formData} />}
            triggerLabel="Submit"
            onConfirm={submit}
            isDisabled={isSubmitting}
          />
        </VStack>
      </ScrollView>
    </SafeArea>
  );
}

function Description({ data }: { data: DeliveryPreferenceSchema }) {
  const { name, preferredMode, availableDays, address: addressID } = data;
  const deliveryMode = preferredMode.map((mode) => DELIVERY_OPTIONS[mode].label).join(', ');
  const availableDaysText = formatDaysToText(availableDays);

  const {
    data: address,
    isLoading,
    isFetching,
  } = useFetchById(Boolean(addressID), {
    collection: 'addresses',
    id: addressID,
    select: { name: true, displayName: true },
    depth: 0,
  });

  const addressDPName = address?.displayName;
  const addressName = address?.name;

  return (
    <VStack space="sm">
      <Text>
        Name: <Text className="font-JakartaMedium">{name}</Text>
      </Text>
      <HStack space="sm" className="flex-wrap items-center">
        {preferredMode.map((mode, index) => {
          const iconAsset = getDeliveryPreferenceIcon(mode);
          return (
            <HStack
              key={index}
              space="xs"
              className="border-primary-500 items-center rounded-md border px-2 py-1"
            >
              <Image source={iconAsset} alt={`${mode}-icon`} style={{ width: 16, height: 16 }} />
              <Text size="sm" className="text-primary-500 font-JakartaMedium">
                {DELIVERY_OPTIONS[mode].label}
              </Text>
            </HStack>
          );
        })}
      </HStack>

      <HStack space="xs">
        <Icon as={CalendarDaysIcon} className="text-primary-500" />
        <Text className="font-JakartaMedium flex-1">{availableDaysText}</Text>
      </HStack>

      {addressDPName && addressName && (
        <HStack space="xs">
          <Icon as={MapPinIcon} className="text-primary-500" />
          <VStack className="flex-1">
            {isLoading || isFetching ? (
              <>
                <Skeleton variant="rounded" className="mb-1 h-5 w-40" />
                <Skeleton variant="rounded" className="h-4" />
              </>
            ) : (
              <>
                <Text className="font-JakartaMedium">{addressName}</Text>
                <Text size="sm" className="font-JakartaMedium text-typography-700">
                  {addressDPName}
                </Text>
              </>
            )}
          </VStack>
        </HStack>
      )}
    </VStack>
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
