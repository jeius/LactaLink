import { AnimatedPressable } from '@/components/animated/pressable';
import { DeliveryCard } from '@/components/cards/DeliveryCard';
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
import ScrollView from '@/components/ui/ScrollView';
import Sheet from '@/components/ui/sheet';
import { SheetRef } from '@/components/ui/sheet/Sheet';
import { DeliveryCreateSchema } from '@lactalink/form-schemas/delivery-preference';
import { DonationCreateSchema, RequestCreateSchema } from '@lactalink/form-schemas/listings';
import { AlertCircleIcon, TruckIcon } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { Control, FieldPath, useController } from 'react-hook-form';
import DeliveryForm, { DeliveryFormProps } from '../DeliveryForm';

interface DeliveryFieldProps<
  TFieldValues extends DonationCreateSchema | RequestCreateSchema =
    | DonationCreateSchema
    | RequestCreateSchema,
> extends DeliveryFormProps {
  control: Control<TFieldValues>;
}

export default function DeliveryField<
  TFieldValues extends DonationCreateSchema | RequestCreateSchema =
    | DonationCreateSchema
    | RequestCreateSchema,
>({ control, ...props }: DeliveryFieldProps<TFieldValues>) {
  const sheetRef = useRef<SheetRef>(null);

  const {
    field: { value, onChange, onBlur },
    fieldState: { error, invalid },
  } = useController({
    control,
    name: 'delivery' as FieldPath<TFieldValues>,
    defaultValue: undefined,
  });

  const [selectedValue, setSelectedValue] = useState<typeof value | undefined>(value);

  function handleOpen(value?: typeof selectedValue) {
    setSelectedValue(value ? value : undefined);
    sheetRef.current?.present();
  }

  function handleClose() {
    sheetRef.current?.dismiss();
    onBlur();
  }

  function handleChange(data: DeliveryCreateSchema) {
    onChange?.(data);
    props.onChange?.(data);
    handleClose();
  }

  return (
    <FormControl isInvalid={invalid} className="px-5">
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
        <AnimatedPressable
          disabled={props.isDisabled}
          onPress={() => handleOpen(value)}
          className="mt-4 overflow-hidden rounded-2xl"
        >
          <DeliveryCard isLoading={props.isLoading} data={value} />
        </AnimatedPressable>
      )}

      <Button
        size="sm"
        variant="outline"
        action="positive"
        isDisabled={props.isDisabled}
        onPress={() => handleOpen()}
        className="mt-4"
      >
        <ButtonText>{value ? 'Change' : 'Set'} Delivery Details</ButtonText>
      </Button>

      <Sheet ref={sheetRef} detents={[1]} scrollable onDidDismiss={handleClose}>
        <ScrollView nestedScrollEnabled contentContainerClassName="grow py-2 px-4">
          <DeliveryForm {...props} values={selectedValue} onChange={handleChange} />
        </ScrollView>
      </Sheet>
    </FormControl>
  );
}
