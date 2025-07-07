import { Card } from '@/components/ui/card';
import { VStack } from '@/components/ui/vstack';
import { DELIVERY_OPTIONS } from '@/lib/constants';
import {
  AlertCircleIcon,
  CalendarDaysIcon,
  MapPinIcon,
  TruckIcon,
  XIcon,
} from 'lucide-react-native';

import { Button, ButtonIcon } from '@/components/ui/button';
import { useFetchById } from '@/hooks/collections/useFetchById';
import { getDeliveryPreferenceIcon } from '@/lib/utils/getDeliveryPreferenceIcon';
import { Address, DeliveryPreferenceSchema } from '@lactalink/types';
import { formatDaysToText } from '@lactalink/utilities/formatters';
import { FieldPath, FieldValues, useFieldArray, useFormContext } from 'react-hook-form';
import { DeliveryPreferencesBottomSheet } from '../bottom-sheets/DeliveryPreferencesBottomSheet';
import { Image } from '../Image';
import { Box } from '../ui/box';
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from '../ui/form-control';
import { HStack } from '../ui/hstack';
import { Icon } from '../ui/icon';
import { Skeleton } from '../ui/skeleton';
import { Text } from '../ui/text';

interface DeliveryPreferencesFormProps {
  name?: FieldPath<FieldValues>;
}

export function DeliveryPreferencesForm({
  name = 'deliveryPreferences',
}: DeliveryPreferencesFormProps) {
  const { fields, remove } = useFieldArray({ name });

  const form = useFormContext();
  const { error } = form.getFieldState(name);
  const isSubmitting = form.formState.isSubmitting;

  const preferences: DeliveryPreferenceSchema[] = form.watch(name) || [];
  const disableRemove = fields.length <= 1;

  function handleChange(newPreferences: DeliveryPreferenceSchema[]) {
    form.setValue(name, newPreferences);
  }

  return (
    <FormControl isInvalid={!!error} isDisabled={isSubmitting}>
      <FormControlLabel className="justify-between">
        <FormControlLabelText>Delivery Preferences</FormControlLabelText>
        <Icon as={TruckIcon} className="text-primary-500" />
      </FormControlLabel>

      <VStack space="md" className="max-w-md">
        {fields.map((field, i) => (
          <PreferenceCards
            key={field.id}
            id={preferences[i]!.id}
            disableRemove={disableRemove}
            onRemove={() => remove(i)}
          />
        ))}

        <Box className="mx-auto mt-2">
          <DeliveryPreferencesBottomSheet selected={preferences} onChange={handleChange} />
        </Box>
      </VStack>

      <FormControlError>
        <FormControlErrorIcon as={AlertCircleIcon} />
        <FormControlErrorText>{error?.message}</FormControlErrorText>
      </FormControlError>
    </FormControl>
  );
}

interface PreferenceCardsProps {
  id: string;
  disableRemove?: boolean;
  onRemove?: (id: string) => void;
}
function PreferenceCards({ id, disableRemove, onRemove: remove }: PreferenceCardsProps) {
  const {
    data: preference,
    isLoading,
    isFetching,
  } = useFetchById(Boolean(id), {
    collection: 'delivery-preferences',
    id: id,
    select: { name: true, address: true, availableDays: true, preferredMode: true, owner: true },
    populate: { addresses: { displayName: true, name: true } },
  });

  const { address, preferredMode, availableDays, name } = preference || {};
  const addressDPName = (address as Address | undefined)?.displayName || 'Unknown Address';
  const addressName = (address as Address | undefined)?.name || 'Unknown Address Name';
  const preferenceName = name || `Delivery Preference`;
  const availableDaysText = (availableDays && formatDaysToText(availableDays)) || 'Unknown Days';

  if (isLoading || isFetching) {
    return <CardSkeleton />;
  }

  return (
    <Card className="relative w-full">
      <VStack space="sm">
        <Text className="font-JakartaSemiBold">{preferenceName}</Text>

        <VStack space="md">
          <HStack space="sm" className="flex-wrap items-center">
            {preferredMode?.map((mode, index) => {
              const iconAsset = getDeliveryPreferenceIcon(mode);
              return (
                <HStack
                  key={index}
                  space="xs"
                  className="border-primary-500 items-center rounded-md border px-2 py-1"
                >
                  <Image
                    source={iconAsset}
                    alt={`${mode}-icon`}
                    style={{ width: 16, height: 16 }}
                  />
                  <Text size="sm" className="text-primary-500 font-JakartaMedium">
                    {DELIVERY_OPTIONS[mode].label}
                  </Text>
                </HStack>
              );
            })}
          </HStack>

          <HStack space="xs" className="items-start">
            <Icon as={CalendarDaysIcon} className="text-primary-500" />
            <Text size="sm" className="font-JakartaMedium flex-1">
              {availableDaysText}
            </Text>
          </HStack>

          <HStack space="xs" className="items-start">
            <Icon as={MapPinIcon} className="text-primary-500" />
            <VStack className="flex-1">
              <Text size="sm" className="font-JakartaMedium">
                {addressName}
              </Text>
              <Text size="xs" className="font-JakartaMedium text-typography-700">
                {addressDPName}
              </Text>
            </VStack>
          </HStack>
        </VStack>
      </VStack>
      <Box className="absolute right-0 top-0">
        <Button
          action="negative"
          variant="link"
          className="h-fit w-fit p-4"
          isDisabled={disableRemove}
          onPress={() => remove?.(id)}
        >
          <ButtonIcon as={XIcon} />
        </Button>
      </Box>
    </Card>
  );
}

function CardSkeleton() {
  return (
    <Card className="w-full">
      <VStack space="md">
        <Skeleton variant="rounded" className="h-6 w-52" />
        <HStack space="md" className="flex-wrap">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} variant="rounded" className="h-6 w-24" />
          ))}
        </HStack>
        <Skeleton variant="rounded" className="h-5 w-40" />
        <Skeleton variant="rounded" className="h-5" />
      </VStack>
    </Card>
  );
}
