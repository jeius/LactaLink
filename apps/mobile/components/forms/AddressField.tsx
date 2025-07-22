import React from 'react';

import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from '@/components/ui/form-control';
import { useAuth } from '@/hooks/auth/useAuth';
import { useRouter } from 'expo-router';
import { AlertCircleIcon, Edit2Icon, EditIcon, PlusIcon } from 'lucide-react-native';
import { useFormContext } from 'react-hook-form';
import { SelectBottomSheet, SelectItemProps } from '../bottom-sheets/SelectBottomSheet';
import { AddressCard } from '../cards';
import { Button, ButtonIcon, ButtonText } from '../ui/button';
import { HStack } from '../ui/hstack';

interface AddressFieldProps {
  isLoading?: boolean;
}
export function AddressField({ isLoading }: AddressFieldProps) {
  const { profile } = useAuth();
  const selections = profile?.addresses || [];
  const router = useRouter();

  const { getFieldState, formState, watch, setValue } = useFormContext();

  const { error: addressFieldError } = getFieldState('address');
  const isSubmitting = formState.isSubmitting;
  const address: string = watch('address');

  function handleAddressChange(id: string) {
    setValue('address', id);
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
      <FormControlLabel>
        <FormControlLabelText>Preffered Address</FormControlLabelText>
      </FormControlLabel>

      <FormControlError>
        <FormControlErrorIcon as={AlertCircleIcon} />
        <FormControlErrorText>{addressFieldError?.message}</FormControlErrorText>
      </FormControlError>

      {address && (
        <AddressCard
          data={address}
          showMap
          isLoading={isLoading}
          action={<Action id={address} />}
        />
      )}

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
