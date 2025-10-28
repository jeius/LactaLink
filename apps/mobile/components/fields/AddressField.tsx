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
import { useFetchBySlug } from '@/hooks/collections/useFetchBySlug';
import { transformToAddressSchema } from '@/lib/utils/transformData';
import { Address } from '@lactalink/types/payload-generated-types';
import { extractCollection, extractID } from '@lactalink/utilities/extractors';
import { areStrings } from '@lactalink/utilities/type-guards';
import { AlertCircleIcon, Edit2Icon, LucideIcon, LucideProps, PlusIcon } from 'lucide-react-native';
import { ControllerProps, FieldPath, FieldValues, useController } from 'react-hook-form';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';
import { SvgProps } from 'react-native-svg';
import { SelectBottomSheet, SelectItemProps } from '../bottom-sheets/SelectBottomSheet';
import { AddressCard } from '../cards';
import { Button, ButtonIcon, ButtonText } from '../ui/button';
import { Icon } from '../ui/icon';

const AnimatedButton = Animated.createAnimatedComponent(Button);
const AnimatedAddressCard = Animated.createAnimatedComponent(AddressCard);

interface AddressFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Pick<ControllerProps<TFieldValues, TName>, 'control' | 'name'> {
  isLoading?: boolean;
  isDisabled?: boolean;
  label?: string;
  labelIcon?: LucideIcon | FC<SvgProps | LucideProps>;
  helperText?: string;
  addresses?: (string | Address)[];
}

export function AddressField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  isLoading: isLoadingProp,
  helperText,
  label,
  control,
  name,
  labelIcon,
  isDisabled,
  addresses,
}: AddressFieldProps<TFieldValues, TName>) {
  const addressQuery = useFetchBySlug(!!addresses && areStrings(addresses), {
    collection: 'addresses',
    where: { id: { in: extractID(addresses) } },
  });

  const { data: meUser } = useMeUser();

  const selections = useMemo(() => {
    if (addresses) {
      return extractCollection(addresses) || addressQuery.data;
    } else {
      return extractCollection(meUser?.addresses?.docs) || [];
    }
  }, [addressQuery, addresses, meUser?.addresses?.docs]);

  const selectionsMap = useMemo(
    () => new Map(selections.map((addr) => [addr.id, addr])),
    [selections]
  );

  const {
    field: { value, onChange },
    fieldState: { error },
    formState: { isSubmitting },
  } = useController({ control, name });

  const address = selectionsMap.get(extractID(value) || '');
  const isLoading = isLoadingProp || addressQuery.isLoading;

  function handleAddressChange(addr: Address | null | undefined) {
    onChange(addr ? transformToAddressSchema(addr) : null);
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
        isDisabled={isDisabled || isSubmitting}
      />
    );
  }

  return (
    <FormControl isInvalid={!!error} isDisabled={isSubmitting}>
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
        <AnimatedAddressCard
          entering={FadeInDown}
          data={address}
          showMap
          isLoading={isLoading}
          className="mt-1"
          isDisabled={isSubmitting}
        />
      )}

      {error && (
        <FormControlError>
          <FormControlErrorIcon as={AlertCircleIcon} />
          <FormControlErrorText>{error.message}</FormControlErrorText>
        </FormControlError>
      )}

      <SelectBottomSheet
        slug="addresses"
        title="Select from the addresses"
        createLabel="Add New Address"
        allowCreate={true}
        allowEdit={true}
        collections={selections}
        allowMultipleSelection={false}
        selected={address}
        onChange={handleAddressChange}
        ItemComponent={Item}
        isDisabled={isDisabled || isSubmitting}
        triggerComponent={(props) => (
          <AnimatedButton
            {...props}
            layout={LinearTransition}
            isDisabled={isDisabled}
            size="sm"
            variant="outline"
            action="positive"
            className="mt-4"
          >
            <ButtonIcon as={address ? Edit2Icon : PlusIcon} />
            <ButtonText>{address ? 'Change' : 'Add'} Address</ButtonText>
          </AnimatedButton>
        )}
      />
    </FormControl>
  );
}
