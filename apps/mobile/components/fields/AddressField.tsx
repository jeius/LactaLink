import React from 'react';

import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlHelper,
  FormControlHelperText,
  FormControlLabel,
  FormControlLabelText,
} from '@/components/ui/form-control';
import { useAuth } from '@/hooks/auth/useAuth';
import { useRouter } from 'expo-router';
import { AlertCircleIcon, Edit2Icon, EditIcon, PlusIcon } from 'lucide-react-native';
import {
  ControllerProps,
  FieldPath,
  FieldPathValue,
  FieldValues,
  useFormContext,
} from 'react-hook-form';
import { SelectBottomSheet, SelectItemProps } from '../bottom-sheets/SelectBottomSheet';
import { AddressCard } from '../cards';
import { Button, ButtonIcon, ButtonText } from '../ui/button';
import { HStack } from '../ui/hstack';

interface AddressFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Pick<ControllerProps<TFieldValues, TName>, 'control' | 'name'> {
  isLoading?: boolean;
  label?: string;
  helperText?: string;
}

export function AddressField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({ isLoading, helperText, label, name }: AddressFieldProps<TFieldValues, TName>) {
  const { user } = useAuth();
  const selections = user?.addresses?.docs || [];
  const router = useRouter();

  const { getFieldState, formState, watch, setValue } = useFormContext<TFieldValues>();

  const { error: addressFieldError } = getFieldState(name);
  const isSubmitting = formState.isSubmitting;
  const address: string = watch(name);

  function handleAddressChange(id: string) {
    setValue(name, id as FieldPathValue<TFieldValues, TName>);
  }

  function Action({ id }: { id: string }) {
    function handleEditPress() {
      router.push(`/addresses/edit/${id}`);
    }

    return (
      <HStack space="lg" className="grow justify-end">
        <Button
          isDisabled={isSubmitting}
          variant="link"
          action="default"
          className="h-fit w-fit p-0"
          hitSlop={8}
          onPress={handleEditPress}
        >
          <ButtonIcon as={EditIcon} />
        </Button>
      </HStack>
    );
  }

  function Item(props: SelectItemProps<'addresses'>) {
    const { item, isLoading } = props;

    return (
      <AddressCard
        data={item}
        variant="ghost"
        className="p-0"
        showMap
        disableTapOnMap
        isLoading={isLoading}
        action={<Action id={item.id} />}
      />
    );
  }

  return (
    <FormControl isInvalid={!!addressFieldError} isDisabled={isSubmitting}>
      {label && (
        <FormControlLabel>
          <FormControlLabelText>{label}</FormControlLabelText>
        </FormControlLabel>
      )}

      {helperText && (
        <FormControlHelper>
          <FormControlHelperText>{helperText}</FormControlHelperText>
        </FormControlHelper>
      )}

      {address && (
        <AddressCard
          data={address}
          showMap
          isLoading={isLoading}
          action={<Action id={address} />}
        />
      )}

      <FormControlError>
        <FormControlErrorIcon as={AlertCircleIcon} />
        <FormControlErrorText>{addressFieldError?.message}</FormControlErrorText>
      </FormControlError>

      <SelectBottomSheet
        slug="addresses"
        title="Select from your Addresses"
        createLabel="Add New Address"
        allowCreate={true}
        allowEdit={true}
        collections={selections}
        allowMultipleSelection={false}
        selected={address}
        onChange={handleAddressChange}
        ItemComponent={Item}
        triggerComponent={(props) => (
          <Button {...props} size="sm" variant="outline" action="positive" className="mt-4">
            <ButtonIcon as={address ? Edit2Icon : PlusIcon} />
            <ButtonText>{address ? 'Change' : 'Add'} Address</ButtonText>
          </Button>
        )}
      />
    </FormControl>
  );
}
