import { AnimatedPressable } from '@/components/animated/pressable';
import { FieldWrapper } from '@/components/form-fields/FieldWrapper';
import { Box } from '@/components/ui/box';
import { FlashList } from '@/components/ui/FlashList';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import DeliveryPreferenceCard from '@/features/delivery-preference/components/DeliveryPreferenceCard';
import { useMeUser } from '@/hooks/auth/useAuth';
import { transformToDeliveryPreferenceSchema } from '@/lib/utils/transformData';
import { tva } from '@gluestack-ui/utils/nativewind-utils';
import { DeliveryPreference } from '@lactalink/types/payload-generated-types';
import { extractCollection, listKeyExtractor } from '@lactalink/utilities/extractors';
import { Link } from 'expo-router';
import { PlusCircleIcon } from 'lucide-react-native';
import { useMemo } from 'react';
import { Control, FieldPath, FieldValues, useController } from 'react-hook-form';

const cardStyle = tva({
  base: 'w-52 flex-1 rounded-2xl p-0',
  variants: { isSelected: { true: 'border-2 border-primary-500' } },
});

interface Props<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  control: Control<TFieldValues>;
  name: TName;
  selections?: DeliveryPreference[];
  isLoading?: boolean;
  isDisabled?: boolean;
}

export default function SelectDeliveryPreferenceField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({ control, name, selections: prefs, isDisabled, isLoading }: Props<TFieldValues, TName>) {
  const { data: meUser } = useMeUser();

  const selections = useMemo(() => {
    const userDPs = prefs || extractCollection(meUser?.deliveryPreferences?.docs) || [];
    return userDPs.sort((a, b) => (new Date(a.createdAt) > new Date(b.createdAt) ? 1 : -1));
  }, [prefs, meUser?.deliveryPreferences?.docs]);

  const {
    field: { value, onChange, onBlur },
    fieldState: { error, invalid },
  } = useController({ control, name });

  return (
    <FieldWrapper
      isInvalid={invalid}
      error={error}
      isDisabled={isDisabled}
      contentPosition="last"
      label="Delivery Preference (Optional)"
      helperText="You can choose from the delivery preferences when setting up the delivery details."
    >
      <FlashList
        horizontal
        data={selections}
        keyExtractor={listKeyExtractor}
        ItemSeparatorComponent={() => <Box className="w-3" />}
        contentContainerClassName="px-5"
        footerClassName="px-2 items-stretch"
        className="-mx-5 mt-2 h-64"
        renderItem={({ item }) => {
          const isSelected = value?.id === item.id;

          function handleSelect() {
            onChange(isSelected ? null : transformToDeliveryPreferenceSchema(item));
            onBlur();
          }

          if (isLoading) return <DeliveryPreferenceCard.Skeleton />;

          return (
            <AnimatedPressable
              onPress={handleSelect}
              disabled={isDisabled}
              className="overflow-hidden rounded-2xl"
              disableRipple
            >
              <DeliveryPreferenceCard
                data={item}
                isDisabled={isDisabled}
                className={cardStyle({ isSelected })}
                variant="filled"
              />
            </AnimatedPressable>
          );
        }}
        ListFooterComponent={() => {
          if (isLoading) return null;
          return (
            <Link href={'/delivery-preferences/create'} asChild push>
              <AnimatedPressable
                className="flex-1 items-center justify-center gap-2 overflow-hidden rounded-2xl"
                style={{ width: 190 }}
              >
                <Icon as={PlusCircleIcon} size="2xl" />
                <Text className="text-center font-JakartaSemiBold">New Delivery Preference</Text>
              </AnimatedPressable>
            </Link>
          );
        }}
      />
    </FieldWrapper>
  );
}
