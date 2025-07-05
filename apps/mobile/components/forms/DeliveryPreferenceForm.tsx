import { useAuth } from '@/hooks/auth/useAuth';
import { useDeliveryPreferenceForm } from '@/hooks/forms';
import { DAYS, DELIVERY_OPTIONS } from '@/lib/constants';
import { DeliveryPreferenceSchema } from '@lactalink/types';
import { CalendarDaysIcon, MapPinIcon, SaveIcon, TruckIcon, XIcon } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { FormProvider } from 'react-hook-form';
import { FormField } from '../FormField';
import { Box } from '../ui/box';
import { Button, ButtonIcon, ButtonText } from '../ui/button';
import { Card } from '../ui/card';
import { HStack } from '../ui/hstack';
import { Skeleton } from '../ui/skeleton';
import { VStack } from '../ui/vstack';

interface DeliveryPreferenceFormProps {
  id?: string | null;
  onChange?: (data: DeliveryPreferenceSchema) => void;
}
export function DeliveryPreferenceForm({ id, onChange }: DeliveryPreferenceFormProps) {
  const { user } = useAuth();

  const { form, isLoading, isFetching, submit } = useDeliveryPreferenceForm(id);

  const isSubmitting = form.formState.isSubmitting;
  const isDirty = form.formState.isDirty;
  const isSubmitSuccessful = form.formState.isSubmitSuccessful;

  useEffect(() => {
    if (isSubmitSuccessful) {
      const data = form.getValues();
      onChange?.(data);
    }
  }, [isSubmitSuccessful, form, onChange]);

  function handleReset() {
    form.reset();
  }

  if (isLoading || isFetching) {
    return <CardSkeleton />;
  }

  return (
    <FormProvider {...form}>
      <Card>
        <VStack space="2xl">
          <FormField
            name="name"
            fieldType="text"
            variant="underlined"
            placeholder="Delivery Preference Name"
            keyboardType="default"
          />

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
        </VStack>

        {isDirty && (
          <HStack space="md" className="mt-8">
            <Box className="flex-1">
              <Button isDisabled={isSubmitting} onPress={submit}>
                <ButtonIcon as={SaveIcon} />
                <ButtonText>Save</ButtonText>
              </Button>
            </Box>

            <Button
              isDisabled={isSubmitting}
              variant="outline"
              action="negative"
              onPress={handleReset}
            >
              <ButtonIcon as={XIcon} />
            </Button>
          </HStack>
        )}
      </Card>
    </FormProvider>
  );
}

function CardSkeleton() {
  return (
    <Card className="w-full">
      <VStack space="2xl">
        <Skeleton variant="rounded" className="h-10" />
        <Skeleton variant="rounded" className="h-8 w-52" />
        <HStack space="md" className="flex-wrap">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} variant="rounded" className="h-10 w-24" />
          ))}
        </HStack>
        <Skeleton variant="rounded" className="h-10" />
        <Skeleton variant="rounded" className="h-8 w-52" />
        <HStack space="md" className="flex-wrap">
          {Array.from({ length: 7 }).map((_, index) => (
            <Skeleton key={index} variant="rounded" className="h-10 w-24" />
          ))}
        </HStack>
        <Skeleton variant="rounded" className="h-10" />
        <Skeleton variant="rounded" className="h-8 w-52" />
        <Skeleton variant="rounded" className="h-10" />
      </VStack>
    </Card>
  );
}
