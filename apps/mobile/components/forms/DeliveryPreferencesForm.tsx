import { VStack } from '@/components/ui/vstack';
import { AlertCircleIcon, EditIcon, TruckIcon, XIcon } from 'lucide-react-native';

import { Button, ButtonIcon } from '@/components/ui/button';
import { DeliveryPreferenceSchema } from '@lactalink/types';
import { useRouter } from 'expo-router';
import { FieldPath, FieldValues, useFieldArray, useFormContext } from 'react-hook-form';
import { DeliveryPreferencesBottomSheet } from '../bottom-sheets/DeliveryPreferencesBottomSheet';
import { DeliveryPreferenceCard } from '../cards/DeliveryPreferenceCard';
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
  const router = useRouter();

  const form = useFormContext();
  const { error } = form.getFieldState(name);
  const isSubmitting = form.formState.isSubmitting;

  const preferences: DeliveryPreferenceSchema[] = form.watch(name) || [];
  const disableRemove = fields.length <= 1;

  function handleChange(newPreferences: DeliveryPreferenceSchema[]) {
    form.setValue(name, newPreferences);
  }

  function handleEditAction(id?: string) {
    if (id) router.push(`/delivery-preference/edit/${id}`);
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
            <DeliveryPreferenceCard
              preference={preferences[i]!}
              action={
                <VStack space="lg">
                  <Button
                    action="negative"
                    variant="link"
                    className="h-fit w-fit"
                    isDisabled={disableRemove}
                    onPress={() => remove(i)}
                    hitSlop={8}
                  >
                    <ButtonIcon as={XIcon} />
                  </Button>
                  <Button
                    action="secondary"
                    variant="link"
                    className="h-fit w-fit"
                    onPress={() => handleEditAction(preferences[i]!.id)}
                    hitSlop={8}
                  >
                    <ButtonIcon as={EditIcon} />
                  </Button>
                </VStack>
              }
            />
            <Box className="absolute right-0 top-0"></Box>
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
