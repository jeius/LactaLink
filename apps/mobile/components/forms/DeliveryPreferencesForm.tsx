import { VStack } from '@/components/ui/vstack';
import { AlertCircleIcon, EditIcon, TruckIcon, XIcon } from 'lucide-react-native';

import { Button, ButtonIcon } from '@/components/ui/button';
import { DeliveryPreferenceSchema } from '@lactalink/types';
import { Motion } from '@legendapp/motion';
import { useRouter } from 'expo-router';
import { useRef } from 'react';
import { FieldPath, FieldValues, useFieldArray, useFormContext } from 'react-hook-form';
import { DeliveryPreferencesBottomSheet } from '../bottom-sheets/DeliveryPreferencesBottomSheet';
import { DeliveryPreferenceCard } from '../cards/DeliveryPreferenceCard';
import { DraggableWrapper, DraggableWrapperRef } from '../DraggableWrapper';
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
  isLoading?: boolean;
}

export function DeliveryPreferencesForm({
  name = 'deliveryPreferences',
  isLoading,
}: DeliveryPreferencesFormProps) {
  const { fields, remove } = useFieldArray({ name });
  const router = useRouter();

  const form = useFormContext();
  const { error } = form.getFieldState(name);
  const isSubmitting = form.formState.isSubmitting;

  const preferences: DeliveryPreferenceSchema[] = form.watch(name) || [];
  const disableRemove = fields.length <= 1;

  const draggableRefs = useRef<Record<string, DraggableWrapperRef | null>>({});

  function handleChange(newPreferences: DeliveryPreferenceSchema[]) {
    form.setValue(name, newPreferences);
  }

  function handleEditAction(id?: string) {
    if (id) router.push(`/delivery-preferences/edit/${id}`);
  }

  function handleDismiss(id: string) {
    draggableRefs.current[id]?.dismiss();
  }

  function renderItem(item: DeliveryPreferenceSchema, index: number) {
    const key = fields[index]?.id || item.id || `preference-${index}`;
    const itemId = item.id || `temp-${index}`;

    return (
      <DraggableWrapper
        key={key}
        disabled
        ref={(ref) => {
          if (ref) {
            draggableRefs.current[itemId] = ref;
          } else {
            delete draggableRefs.current[itemId];
          }
        }}
        onDismiss={() => remove(index)}
      >
        <Motion.View initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <DeliveryPreferenceCard
            isLoading={isLoading}
            preference={item}
            action={
              <VStack space="lg">
                <Button
                  action="negative"
                  variant="link"
                  className="h-fit w-fit"
                  isDisabled={disableRemove}
                  onPress={() => handleDismiss(itemId)}
                  hitSlop={8}
                >
                  <ButtonIcon as={XIcon} />
                </Button>
                <Button
                  action="secondary"
                  variant="link"
                  className="h-fit w-fit"
                  onPress={() => handleEditAction(item.id)}
                  hitSlop={8}
                >
                  <ButtonIcon as={EditIcon} />
                </Button>
              </VStack>
            }
          />
        </Motion.View>
      </DraggableWrapper>
    );
  }

  return (
    <FormControl isInvalid={!!error} isDisabled={isSubmitting} className="px-5">
      <FormControlLabel className="justify-between">
        <FormControlLabelText>Delivery Preferences</FormControlLabelText>
        <Icon as={TruckIcon} className="text-primary-500" />
      </FormControlLabel>

      <VStack space="md" className="max-w-md">
        {preferences.map(renderItem)}

        <Box className="mx-auto">
          <DeliveryPreferencesBottomSheet
            allowMultipleSelection
            selected={preferences}
            onChange={handleChange}
          />
        </Box>
      </VStack>

      <FormControlError>
        <FormControlErrorIcon as={AlertCircleIcon} />
        <FormControlErrorText>{error?.message}</FormControlErrorText>
      </FormControlError>
    </FormControl>
  );
}
