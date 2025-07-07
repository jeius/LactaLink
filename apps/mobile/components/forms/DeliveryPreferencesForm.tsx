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
import { getDeliveryPreferenceIcon } from '@/lib/utils/getDeliveryPreferenceIcon';
import { DeliveryPreferenceSchema } from '@lactalink/types';
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
        {fields.map((field, i) => {
          const { address, preferredMode, availableDays, name } = preferences[i]!;
          const addressName = address.displayName;
          const preferenceName = name || `Delivery Preference`;
          const availableDaysText = formatDaysToText(availableDays);

          return (
            <Card key={field.id} className="relative w-full">
              <VStack space="sm">
                <Text className="font-JakartaSemiBold">{preferenceName}</Text>

                <VStack space="md">
                  <HStack space="sm" className="flex-wrap items-center">
                    {preferredMode.map((mode, index) => {
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
                    <Text size="sm" className="font-JakartaMedium flex-1">
                      {addressName}
                    </Text>
                  </HStack>
                </VStack>
              </VStack>
              <Box className="absolute right-0 top-0">
                <Button
                  action="negative"
                  variant="link"
                  className="h-fit w-fit p-4"
                  isDisabled={disableRemove}
                  onPress={() => remove(i)}
                >
                  <ButtonIcon as={XIcon} />
                </Button>
              </Box>
            </Card>
          );
        })}

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
