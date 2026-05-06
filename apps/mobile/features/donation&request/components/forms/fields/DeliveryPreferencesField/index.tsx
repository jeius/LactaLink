import { AlertCircleIcon, Edit2Icon, PlusIcon, TruckIcon, XIcon } from 'lucide-react-native';

import { Box } from '@/components/ui/box';
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
import Sheet from '@/components/ui/sheet';
import { SheetRef } from '@/components/ui/sheet/Sheet';
import { VStack } from '@/components/ui/vstack';
import DeliveryPreferenceCard from '@/features/delivery-preference/components/DeliveryPreferenceCard';
import { useInfiniteDeliveryPreferences } from '@/features/delivery-preference/hooks/queries';
import { useMeUser } from '@/hooks/auth/useAuth';
import { transformToDeliveryPreferenceSchema } from '@/lib/utils/transformData';
import { DonationCreateSchema, RequestCreateSchema } from '@lactalink/form-schemas/listings';
import { DeliveryPreference } from '@lactalink/types/payload-generated-types';
import { isPlaceHolderData } from '@lactalink/utilities/checkers';
import { useMemo, useRef } from 'react';
import { Control, FieldPath, PathValue, useController } from 'react-hook-form';
import Animated, { FadeInDown, FadeOutRight, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DPList from './DPList';

const AnimatedButton = Animated.createAnimatedComponent(Button);

interface DeliveryPreferencesFieldProps<
  TFieldValues extends DonationCreateSchema | RequestCreateSchema =
    | DonationCreateSchema
    | RequestCreateSchema,
> {
  control: Control<TFieldValues>;
  isLoading?: boolean;
  isDisabled?: boolean;
}

export default function DeliveryPreferencesField<
  TFieldValues extends DonationCreateSchema | RequestCreateSchema =
    | DonationCreateSchema
    | RequestCreateSchema,
>({ control, isLoading, isDisabled }: DeliveryPreferencesFieldProps<TFieldValues>) {
  const insets = useSafeAreaInsets();
  const sheetRef = useRef<SheetRef>(null);

  const {
    field: { value: fields, onChange: setValue },
    fieldState: { error, invalid },
    formState,
  } = useController({
    control,
    name: 'deliveryPreferences' as FieldPath<TFieldValues>,
    defaultValue: [] as PathValue<TFieldValues, FieldPath<TFieldValues>>,
  });

  const disableRemove = fields.length <= 1;
  const hasPreferences = fields.length > 0;

  const { data: meUser } = useMeUser();
  const { data: preferences, dataMap, ...dpQuery } = useInfiniteDeliveryPreferences(meUser);

  const selectedValues = useMemo(
    () =>
      fields
        .map((pref: DeliveryPreference) => dataMap.get(pref.id))
        .filter(Boolean) as DeliveryPreference[],
    [fields, dataMap]
  );

  const isSubmitting = formState.isSubmitting;

  function handleChange(newPreferences: DeliveryPreference[]) {
    const preferences = newPreferences.map((pref) => transformToDeliveryPreferenceSchema(pref));
    setValue(preferences);
  }

  function remove(index: number) {
    const updated = [...fields];
    updated.splice(index, 1);
    setValue(updated);
  }

  return (
    <FormControl isInvalid={invalid} isDisabled={isDisabled || isSubmitting} className="px-5">
      <FormControlLabel className="justify-between">
        <FormControlLabelText size="lg" className="font-JakartaSemiBold">
          Delivery Preferences
        </FormControlLabelText>
        <Icon as={TruckIcon} />
      </FormControlLabel>

      <FormControlHelper>
        <FormControlHelperText>You can add multiple delivery preferences.</FormControlHelperText>
      </FormControlHelper>

      <VStack space="md" className="mt-2">
        {selectedValues.map((item, index) => (
          <ListItem
            key={item.id}
            item={item}
            index={index}
            onRemove={remove}
            isDisabledRemove={disableRemove}
          />
        ))}
      </VStack>

      <FormControlError>
        <FormControlErrorIcon as={AlertCircleIcon} />
        <FormControlErrorText>{error?.message}</FormControlErrorText>
      </FormControlError>

      <AnimatedButton
        layout={LinearTransition}
        isDisabled={isDisabled || isLoading}
        size="sm"
        variant="outline"
        action="positive"
        className="mt-4"
        onPress={() => sheetRef.current?.present()}
      >
        <ButtonIcon as={hasPreferences ? Edit2Icon : PlusIcon} />
        <ButtonText>{hasPreferences ? 'Change' : 'Add'} Delivery Preferences</ButtonText>
      </AnimatedButton>

      <Sheet
        ref={sheetRef}
        scrollable
        detents={[0.65, 1]}
        footer={<Box className="bg-background-0" style={{ paddingBottom: insets.bottom }} />}
      >
        <DPList {...dpQuery} data={preferences} value={selectedValues} onChange={handleChange} />
      </Sheet>
    </FormControl>
  );
}

type ListItemProps = {
  item: DeliveryPreference;
  index: number;
  isDisabledRemove?: boolean;
  onRemove?: (index: number) => void;
};

function ListItem({ item, index, isDisabledRemove, onRemove }: ListItemProps) {
  if (isPlaceHolderData(item)) return <DeliveryPreferenceCard.Skeleton className="w-full" />;

  return (
    <Animated.View layout={LinearTransition} entering={FadeInDown} exiting={FadeOutRight}>
      <DeliveryPreferenceCard showName data={item} className="w-full" />
      <Button
        variant="ghost"
        action="negative"
        className="absolute h-fit w-fit rounded-full bg-error-500/70 p-2"
        isDisabled={isDisabledRemove}
        onPress={() => onRemove?.(index)}
        hitSlop={8}
        style={{ top: 8, right: 8 }}
      >
        <ButtonIcon as={XIcon} className="stroke-error-0" />
      </Button>
    </Animated.View>
  );
}
