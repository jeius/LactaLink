import { getMeUser } from '@/lib/stores/meUserStore';
import { transformToDeliveryPreferenceSchema } from '@/lib/utils/transformData';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { DELIVERY_OPTIONS } from '@lactalink/enums';
import { DonationCreateSchema, RequestCreateSchema } from '@lactalink/form-schemas';
import { DeliveryPreference } from '@lactalink/types/payload-generated-types';
import { checkIsOwner } from '@lactalink/utilities/checkers';
import { extractID } from '@lactalink/utilities/extractors';
import { AlertCircleIcon, ChevronDownIcon, TimerIcon, TruckIcon } from 'lucide-react-native';
import React from 'react';
import { Control, Controller, useFormContext, useFormState, useWatch } from 'react-hook-form';
import { FlatList } from 'react-native-gesture-handler';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedPressable } from '../animated/pressable';
import { DeliveryPreferenceCard } from '../cards';
import { FormField } from '../FormField';
import { Box } from '../ui/box';
import { Card } from '../ui/card';
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
import {
  Select,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectIcon,
  SelectInput,
  SelectItem,
  SelectPortal,
  SelectTrigger,
} from '../ui/select';
import { Text } from '../ui/text';
import { VStack, VStackProps } from '../ui/vstack';

const AnimatedCard = Animated.createAnimatedComponent(Card);

interface DeliveryFieldProps extends VStackProps {
  type: 'donation' | 'request';
  deliveryPreferences: DeliveryPreference[];
}

export default function DeliveryField({ type, deliveryPreferences, ...props }: DeliveryFieldProps) {
  const { control, setValue } = useFormContext<DonationCreateSchema | RequestCreateSchema>();

  const selectedDP = useWatch({ control, name: 'deliveryPreferences' });
  const hasSelectedDP = selectedDP && selectedDP.length > 0;

  function handleSelectPreference(pref: DeliveryPreference | null, isOwner: boolean) {
    const transformedPref = pref && transformToDeliveryPreferenceSchema(pref);

    const setOptions = {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    };

    setValue('deliveryPreferences', transformedPref ? [transformedPref] : [], setOptions);

    if (pref) {
      if (isOwner) {
        setValue('delivery.type', 'PROPOSED', setOptions);
      } else {
        setValue('delivery.type', 'CONFIRMED', setOptions);
      }
    } else {
      // @ts-expect-error - Expected type error, but works as intended
      setValue('delivery.type', undefined, setOptions);
    }

    const address = transformedPref?.address;
    const mode =
      transformedPref?.preferredMode?.length === 1 ? transformedPref.preferredMode[0] : '';

    // @ts-expect-error - Expected type error, but works as intended
    setValue('delivery.address', address, setOptions);

    // @ts-expect-error - Expected type error, but works as intended
    setValue('delivery.mode', mode, setOptions);
  }

  return (
    <VStack {...props} space="sm">
      <HStack space="sm" className="mx-5 items-center">
        <Text size="lg" className="font-JakartaSemiBold flex-1">
          Delivery
        </Text>
        <Icon as={TruckIcon} />
      </HStack>

      <DPList
        type={type}
        control={control}
        onChange={handleSelectPreference}
        deliveryPreferences={deliveryPreferences}
      />

      {hasSelectedDP && (
        <AnimatedCard
          entering={FadeIn}
          exiting={FadeOut}
          variant="filled"
          className="mx-5 mt-2 gap-3"
        >
          <ModeField control={control} type={type} />
          <DateField control={control} type={type} />
        </AnimatedCard>
      )}
    </VStack>
  );
}

type BaseFieldProps = {
  control: Control<DonationCreateSchema | RequestCreateSchema>;
  type: DeliveryFieldProps['type'];
};

interface DPListProps extends BaseFieldProps {
  onChange: (pref: DeliveryPreference | null, isOwner: boolean) => void;
  deliveryPreferences: DeliveryPreference[];
}
function DPList({ control, onChange, deliveryPreferences }: DPListProps) {
  const { errors } = useFormState({ control, name: 'deliveryPreferences' });
  const fieldError = errors.deliveryPreferences;
  const selectedDP = useWatch({ control, name: 'deliveryPreferences' })?.[0];

  const cardStyle = tva({
    base: 'w-52 flex-1 p-4',
    variants: { isSelected: { true: 'border-primary-500 border-2' } },
  });

  return (
    <FormControl isInvalid={!!fieldError}>
      <FormControlHelper className="mx-5">
        <FormControlHelperText>Choose one from the delivery preferences</FormControlHelperText>
      </FormControlHelper>

      <FormControlError className="mx-5 mb-2">
        <FormControlErrorIcon as={AlertCircleIcon} />
        <FormControlErrorText>{fieldError?.message}</FormControlErrorText>
      </FormControlError>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mb-1 mt-2"
        contentContainerClassName="px-5"
        ItemSeparatorComponent={() => <Box className="w-3" />}
        keyExtractor={(item) => item.id}
        data={deliveryPreferences}
        renderItem={({ item }) => {
          const isSelected = extractID(selectedDP) === item.id;

          const meUser = getMeUser();
          const isOwner = meUser ? checkIsOwner(meUser, [item]) : false;

          return (
            <AnimatedPressable
              onPress={() => onChange(isSelected ? null : item, isOwner)}
              className="overflow-hidden rounded-2xl"
            >
              <DeliveryPreferenceCard
                preference={item}
                size="sm"
                appearance="list-item"
                hideIconLabels
                className={cardStyle({ isSelected })}
                variant="filled"
              ></DeliveryPreferenceCard>
            </AnimatedPressable>
          );
        }}
      />
    </FormControl>
  );
}

function ModeField({ control }: BaseFieldProps) {
  const insets = useSafeAreaInsets();
  const selectedDP = useWatch({ control, name: 'deliveryPreferences' })?.[0];
  const deliveryModes = selectedDP?.preferredMode || [];
  const { errors } = useFormState({ control, name: 'delivery' });
  console.log('delivery error:', errors);

  return (
    <Controller
      control={control}
      name="delivery.mode"
      render={({ field, fieldState }) => {
        const { onChange, value, disabled } = field;
        const fieldError = fieldState.error;

        return (
          <FormControl isInvalid={!!fieldError} isDisabled={disabled}>
            <FormControlLabel>
              <FormControlLabelText>Delivery Mode</FormControlLabelText>
            </FormControlLabel>

            <Select selectedValue={value} onValueChange={onChange}>
              <SelectTrigger disabled={disabled} size="md">
                <SelectInput
                  className="flex-1"
                  placeholder="Select delivery mode"
                  value={DELIVERY_OPTIONS[value]?.label || ''}
                />
                <SelectIcon className="mr-3" as={ChevronDownIcon} />
              </SelectTrigger>

              <SelectPortal>
                <SelectBackdrop />
                <SelectContent className="px-4" style={{ paddingBottom: insets.bottom }}>
                  <SelectDragIndicatorWrapper className="pb-4">
                    <SelectDragIndicator />
                  </SelectDragIndicatorWrapper>
                  {deliveryModes.map((mode, idx) => (
                    <SelectItem
                      key={`${mode}-${idx}`}
                      value={mode}
                      label={DELIVERY_OPTIONS[mode]?.label || ''}
                    />
                  ))}
                </SelectContent>
              </SelectPortal>
            </Select>

            <FormControlHelper>
              <FormControlHelperText>
                Select a delivery mode based on the selected delivery preference
              </FormControlHelperText>
            </FormControlHelper>

            <FormControlError>
              <FormControlErrorIcon as={AlertCircleIcon} />
              <FormControlErrorText>{fieldError?.message}</FormControlErrorText>
            </FormControlError>
          </FormControl>
        );
      }}
    />
  );
}

function DateField({ control }: BaseFieldProps) {
  const mode = useWatch({ control, name: 'delivery.mode' });
  const modeLabel = DELIVERY_OPTIONS[mode]?.label || 'Delivery';

  return (
    <>
      <FormField
        control={control}
        name="delivery.date"
        label={`${modeLabel} Date`}
        fieldType="date"
        placeholder={`Choose ${modeLabel} Date`}
        helperText="Make sure to choose a date that matches the delivery preference's available days."
        datePickerOptions={{
          display: 'calendar',
          minimumDate: new Date(),
        }}
      />

      <FormField
        control={control}
        name="delivery.time"
        label={`${modeLabel} Time`}
        fieldType="date"
        placeholder={`Choose ${modeLabel} Time`}
        inputIcon={TimerIcon}
        mode="time"
        datePickerOptions={{
          display: 'spinner',
          minimumDate: new Date(),
        }}
      />

      <FormField
        control={control}
        name="delivery.note"
        label={`${modeLabel} Notes (Optional)`}
        fieldType="textarea"
        placeholder={`Any additional notes for the ${modeLabel.toLowerCase()}.`}
      />
    </>
  );
}
