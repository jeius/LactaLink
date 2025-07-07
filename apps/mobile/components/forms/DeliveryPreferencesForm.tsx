import { VStack } from '@/components/ui/vstack';
import { AlertCircleIcon, TruckIcon, XIcon } from 'lucide-react-native';

import { Button, ButtonIcon } from '@/components/ui/button';
import { DeliveryPreferenceSchema } from '@lactalink/types';
import { FieldPath, FieldValues, useFieldArray, useFormContext } from 'react-hook-form';
import { DeliveryPreferencesBottomSheet } from '../bottom-sheets/DeliveryPreferencesBottomSheet';
import { DPCard } from '../cards/DPCard';
import { Box } from '../ui/box';
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from '../ui/form-control';
import { Icon } from '../ui/icon';

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
          <Box key={field.id} className="relative">
            <DPCard preference={preferences[i]!} />
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
          </Box>
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
