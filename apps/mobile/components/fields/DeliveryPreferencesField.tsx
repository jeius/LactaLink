import { AlertCircleIcon, Edit2Icon, PlusIcon, TruckIcon, XIcon } from 'lucide-react-native';

import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { useMeUser } from '@/hooks/auth/useAuth';
import { extractCollection } from '@lactalink/utilities';
import { useRef } from 'react';
import {
  ControllerProps,
  FieldPath,
  FieldPathValue,
  FieldValues,
  useFieldArray,
  useFormContext,
} from 'react-hook-form';
import { DeliveryPreferencesBottomSheet } from '../bottom-sheets/DeliveryPreferencesBottomSheet';
import { EditActionButton } from '../buttons';
import { DeliveryPreferenceCard } from '../cards/DeliveryPreferenceCard';
import { DraggableWrapper, DraggableWrapperRef } from '../DraggableWrapper';
import { BasicList, BasicListItemProps } from '../lists/BasicList';
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlHelper,
  FormControlHelperText,
  FormControlLabel,
  FormControlLabelText,
} from '../ui/form-control';
import { HStack } from '../ui/hstack';
import { Icon } from '../ui/icon';

interface DeliveryPreferencesFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Pick<ControllerProps<TFieldValues, TName>, 'control' | 'name'> {
  isLoading?: boolean;
  label?: string;
  helperText?: string;
}

export function DeliveryPreferencesField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({ name, isLoading, label, helperText }: DeliveryPreferencesFieldProps<TFieldValues, TName>) {
  const { data: user } = useMeUser();
  const selections = extractCollection(user?.deliveryPreferences?.docs || []);

  const { fields, remove } = useFieldArray({ name });

  const form = useFormContext<TFieldValues>();
  const { error } = form.getFieldState(name);
  const isSubmitting = form.formState.isSubmitting;

  const disableRemove = fields.length <= 1;
  const preferenceIDs: string[] = form.watch(name) || [];
  const hasPreferences = preferenceIDs?.length > 0;
  const preferences = selections.filter((pref) => preferenceIDs.includes(pref.id));

  const draggableRefs = useRef<Record<string, DraggableWrapperRef | null>>({});

  function handleChange(newPreferences: string[]) {
    form.setValue(name, newPreferences as FieldPathValue<TFieldValues, TName>);
  }

  function handleDismiss(id: string) {
    draggableRefs.current[id]?.dismiss();
  }

  function BasicListItem({ item, index, isLoading }: BasicListItemProps<'delivery-preferences'>) {
    const itemID = item.id;

    return (
      <DraggableWrapper
        disabled
        ref={(ref) => {
          if (ref) {
            draggableRefs.current[itemID] = ref;
          } else {
            delete draggableRefs.current[itemID];
          }
        }}
        onDismiss={() => remove(index)}
      >
        <DeliveryPreferenceCard
          isLoading={isLoading}
          preference={item}
          action={
            <HStack space="lg" className="grow justify-end">
              <EditActionButton href={`/delivery-preferences/edit/${itemID}`} />
              <Button
                action="negative"
                variant="link"
                className="h-fit w-fit p-0"
                isDisabled={disableRemove}
                onPress={() => handleDismiss(itemID)}
                hitSlop={8}
              >
                <ButtonIcon as={XIcon} />
              </Button>
            </HStack>
          }
        />
      </DraggableWrapper>
    );
  }

  return (
    <FormControl isInvalid={!!error} isDisabled={isSubmitting} className="px-5">
      {label && (
        <FormControlLabel className="justify-between">
          <FormControlLabelText>{label}</FormControlLabelText>
          <Icon as={TruckIcon} className="text-primary-500" />
        </FormControlLabel>
      )}

      {helperText && (
        <FormControlHelper>
          <FormControlHelperText>{helperText}</FormControlHelperText>
        </FormControlHelper>
      )}

      <BasicList
        slug="delivery-preferences"
        data={preferences}
        isLoading={isLoading}
        ItemComponent={BasicListItem}
        gap={8}
        keyExtractor={(item, index) => fields[index]?.id || item.id}
      />

      <FormControlError>
        <FormControlErrorIcon as={AlertCircleIcon} />
        <FormControlErrorText>{error?.message}</FormControlErrorText>
      </FormControlError>

      <DeliveryPreferencesBottomSheet
        title="Select from your Delivery Preferences"
        createLabel="Add New Delivery Preferences"
        allowCreate={true}
        allowEdit={true}
        collections={selections}
        allowMultipleSelection={true}
        selected={preferenceIDs}
        onChange={handleChange}
        triggerComponent={(props) => (
          <Button {...props} size="sm" variant="outline" action="positive" className="mt-4">
            <ButtonIcon as={hasPreferences ? Edit2Icon : PlusIcon} />
            <ButtonText>{hasPreferences ? 'Change' : 'Add'} Delivery Preferences</ButtonText>
          </Button>
        )}
      />
    </FormControl>
  );
}
