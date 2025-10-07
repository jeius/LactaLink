import React, { FC, useMemo } from 'react';

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
import { useMeUser } from '@/hooks/auth/useAuth';
import { Address } from '@lactalink/types/payload-generated-types';
import { extractCollection, extractID } from '@lactalink/utilities/extractors';
import { AlertCircleIcon, Edit2Icon, LucideIcon, LucideProps, PlusIcon } from 'lucide-react-native';
import {
  ControllerProps,
  FieldPath,
  FieldPathValue,
  FieldValues,
  useFormContext,
} from 'react-hook-form';
import { SvgProps } from 'react-native-svg';
import { SelectBottomSheet, SelectItemProps } from '../bottom-sheets/SelectBottomSheet';
import { EditActionButton } from '../buttons';
import { AddressCard } from '../cards';
import { Button, ButtonIcon, ButtonText } from '../ui/button';
import { HStack } from '../ui/hstack';
import { Icon } from '../ui/icon';

interface AddressFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Pick<ControllerProps<TFieldValues, TName>, 'control' | 'name'> {
  isLoading?: boolean;
  isDisabled?: boolean;
  label?: string;
  labelIcon?: LucideIcon | FC<SvgProps | LucideProps>;
  helperText?: string;
}

export function AddressField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  isLoading,
  helperText,
  label,
  name,
  labelIcon,
  isDisabled,
}: AddressFieldProps<TFieldValues, TName>) {
  const { data: user } = useMeUser();
  const selections = useMemo(
    () => extractCollection(user?.addresses?.docs) || [],
    [user?.addresses]
  );

  const selectionsMap = useMemo(() => {
    const map = new Map<string, (typeof selections)[number]>();
    for (const addr of selections) {
      map.set(addr.id, addr);
    }
    return map;
  }, [selections]);

  const { getFieldState, formState, watch, setValue } = useFormContext<TFieldValues>();

  const { error: addressFieldError } = getFieldState(name);
  const isSubmitting = formState.isSubmitting;

  const address: string = watch(name);
  const addressData = address ? selectionsMap.get(address) : null;

  function handleAddressChange(addr: Address | null | undefined) {
    setValue(name, extractID(addr) as FieldPathValue<TFieldValues, TName>);
  }

  function Action({ id }: { id: string }) {
    return (
      <HStack space="lg" className="grow justify-end">
        <EditActionButton isDisabled={isSubmitting} href={`/addresses/edit/${id}`} />
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
        isDisabled={isDisabled || isSubmitting}
      />
    );
  }

  return (
    <FormControl isInvalid={!!addressFieldError} isDisabled={isSubmitting}>
      {label && (
        <FormControlLabel className="gap-2">
          {labelIcon && <Icon as={labelIcon} />}
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
          className="mt-1"
          isDisabled={isDisabled || isSubmitting}
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
        selected={addressData}
        onChange={handleAddressChange}
        ItemComponent={Item}
        isDisabled={isDisabled || isSubmitting}
        triggerComponent={(props) => (
          <Button
            {...props}
            isDisabled={isDisabled}
            size="sm"
            variant="outline"
            action="positive"
            className="mt-4"
          >
            <ButtonIcon as={address ? Edit2Icon : PlusIcon} />
            <ButtonText>{address ? 'Change' : 'Add'} Address</ButtonText>
          </Button>
        )}
      />
    </FormControl>
  );
}
