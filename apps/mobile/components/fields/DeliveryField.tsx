import {
  BottomSheet,
  BottomSheetBackdrop,
  BottomSheetDragIndicator,
  BottomSheetModalPortal,
  BottomSheetScrollView,
} from '@/components/ui/bottom-sheet';
import { Button, ButtonText } from '@/components/ui/button';
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
import {
  DeliveryCreateSchema,
  DonationCreateSchema,
  RequestCreateSchema,
} from '@lactalink/form-schemas';
import { AlertCircleIcon, TruckIcon } from 'lucide-react-native';
import React, { useState } from 'react';
import { Control, useController } from 'react-hook-form';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DeliveryCard } from '../cards/DeliveryCard';
import { DeliveryForm, DeliveryFormProps } from '../forms/donation-request/DeliveryForm';

interface DeliveryFieldProps extends DeliveryFormProps {
  control: Control<DonationCreateSchema | RequestCreateSchema>;
}

export function DeliveryField({ control, ...props }: DeliveryFieldProps) {
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();

  const {
    field: { value, onChange, onBlur },
    fieldState: { error },
  } = useController({ control, name: 'delivery', defaultValue: undefined });

  function handleChange(data: DeliveryCreateSchema) {
    onChange?.(data);
    props.onChange?.(data);
    handleClose();
  }

  function handleClose() {
    setOpen(false);
    onBlur();
  }

  return (
    <FormControl isInvalid={!!error} className="px-5">
      <FormControlLabel>
        <FormControlLabelText size="lg" className="flex-1 font-JakartaSemiBold">
          Delivery Details
        </FormControlLabelText>
        <Icon as={TruckIcon} />
      </FormControlLabel>

      <FormControlHelper>
        <FormControlHelperText>
          Specify the delivery details for this donation.
        </FormControlHelperText>
      </FormControlHelper>

      {error && (
        <FormControlError>
          <FormControlErrorIcon as={AlertCircleIcon} />
          <FormControlErrorText>{error.message}</FormControlErrorText>
        </FormControlError>
      )}

      {value && (
        <DeliveryCard
          isLoading={props.isLoading}
          isDisabled={props.isDisabled}
          data={value}
          className="mt-4"
        />
      )}

      <BottomSheet open={open} setOpen={setOpen} onClose={handleClose}>
        <Button
          size="sm"
          variant="outline"
          action="positive"
          isDisabled={props.isDisabled}
          onPress={() => setOpen(true)}
          className="mt-4"
        >
          <ButtonText>{value ? 'Change' : 'Set'} Delivery Details</ButtonText>
        </Button>
        <BottomSheetModalPortal
          snapPoints={['95%']}
          enableDynamicSizing={false}
          handleComponent={(props) => <BottomSheetDragIndicator {...props} className="py-4" />}
          backdropComponent={BottomSheetBackdrop}
          enableContentPanningGesture={false}
          bottomInset={insets.bottom}
          topInset={insets.top}
        >
          <BottomSheetScrollView showsVerticalScrollIndicator={false}>
            <DeliveryForm
              {...props}
              insideBottomSheet
              values={value}
              onChange={handleChange}
              className="px-5 py-2"
            />
          </BottomSheetScrollView>
        </BottomSheetModalPortal>
      </BottomSheet>
    </FormControl>
  );
}
