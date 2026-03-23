import React, { FC } from 'react';

import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
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
import { Icon } from '@/components/ui/icon';
import AddressCard from '@/features/address/components/AddressCard';
import { useInfiniteAddresses } from '@/features/address/hooks/queries';
import { useMeUser } from '@/hooks/auth/useAuth';
import { transformToAddressSchema } from '@/lib/utils/transformData';
import { DeliveryPreferenceSchema } from '@lactalink/form-schemas';
import { Address } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { AlertCircleIcon, LucideIcon, LucideProps, PenIcon, PlusIcon } from 'lucide-react-native';
import { Control, useController } from 'react-hook-form';
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';
import { SvgProps } from 'react-native-svg';
import SelectAddressSheet from './SelectAddressSheet';

const AnimatedButton = Animated.createAnimatedComponent(Button);
const AnimatedAddressCard = Animated.createAnimatedComponent(AddressCard);

interface DPAddressFieldProps {
  control: Control<DeliveryPreferenceSchema>;
  isLoading?: boolean;
  isDisabled?: boolean;
  label?: string;
  labelIcon?: LucideIcon | FC<SvgProps | LucideProps>;
  helperText?: string;
}

export function DPAddressField({
  isLoading: isLoadingProp,
  helperText,
  label,
  control,
  labelIcon,
  isDisabled,
}: DPAddressFieldProps) {
  const { data: meUser } = useMeUser();

  const {
    data: selections,
    dataMap: selectionsMap,
    ...addressQuery
  } = useInfiniteAddresses(meUser);

  const {
    field: { value, onChange },
    fieldState: { error },
    formState: { isSubmitting },
  } = useController({ control, name: 'address' });

  const address = selectionsMap?.get(extractID(value) || '');
  const isLoading = isLoadingProp || addressQuery.isLoading;

  function handleAddressChange(addr: Address | null | undefined) {
    onChange(addr ? transformToAddressSchema(addr) : null);
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
          entering={FadeIn}
          data={address}
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

      <SelectAddressSheet
        isMultiSelect={false}
        addresses={selections}
        selected={address}
        onSelect={handleAddressChange}
        trigger={(props) => (
          <AnimatedButton
            {...props}
            size="sm"
            layout={LinearTransition}
            variant="outline"
            action="secondary"
            isDisabled={isDisabled || isSubmitting}
            className="mt-4"
          >
            <ButtonIcon as={address ? PenIcon : PlusIcon} />
            <ButtonText>{address ? 'Change' : 'Add'} Address</ButtonText>
          </AnimatedButton>
        )}
      />
    </FormControl>
  );
}
