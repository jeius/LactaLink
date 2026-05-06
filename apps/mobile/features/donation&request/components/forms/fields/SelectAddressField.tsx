import { AnimatedPressable } from '@/components/animated/pressable';
import { FieldWrapper } from '@/components/form-fields/FieldWrapper';
import { Box } from '@/components/ui/box';
import { FlashList } from '@/components/ui/FlashList';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import AddressCard from '@/features/address/components/AddressCard';
import { useMeUser } from '@/hooks/auth/useAuth';
import { transformToAddressSchema } from '@/lib/utils/transformData';
import { tva } from '@gluestack-ui/utils/nativewind-utils';
import { Address } from '@lactalink/types/payload-generated-types';
import { extractCollection, listKeyExtractor } from '@lactalink/utilities/extractors';
import { Link } from 'expo-router';
import { PlusCircleIcon } from 'lucide-react-native';
import { useMemo } from 'react';
import { Control, FieldPath, FieldValues, useController } from 'react-hook-form';

const cardStyle = tva({
  base: 'w-64',
  variants: { isSelected: { true: 'border-2 border-primary-500' } },
});

interface Props<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  control: Control<TFieldValues>;
  name: TName;
  selections?: Address[];
  isLoading?: boolean;
  isDisabled?: boolean;
  isRequired?: boolean;
}

export default function SelectAddressField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  selections: addresses,
  isDisabled,
  isLoading,
  isRequired,
}: Props<TFieldValues, TName>) {
  const { data: meUser } = useMeUser();

  const selections = useMemo(() => {
    const userAddresses = addresses || extractCollection(meUser?.addresses?.docs) || [];
    return userAddresses.sort((a, b) => (new Date(a.createdAt) > new Date(b.createdAt) ? 1 : -1));
  }, [addresses, meUser?.addresses?.docs]);

  const {
    field: { value, onChange, onBlur },
    fieldState: { error, invalid },
  } = useController({ control, name });

  return (
    <FieldWrapper
      isInvalid={invalid}
      error={error}
      isDisabled={isDisabled}
      isRequired={isRequired}
      contentPosition="last"
      label={'Address'}
      helperText={'Select the address of transaction'}
    >
      <FlashList
        horizontal
        data={selections}
        keyExtractor={listKeyExtractor}
        ItemSeparatorComponent={() => <Box className="w-3" />}
        contentContainerClassName="px-5"
        footerClassName="px-2 items-stretch"
        className="-mx-5 mt-2"
        style={{ height: 240 }}
        renderItem={({ item }) => {
          const isSelected = value?.id === item.id;

          function handleSelect() {
            onChange(isSelected ? null : transformToAddressSchema(item));
            onBlur();
          }

          if (isLoading) return <AddressCard.Skeleton />;

          return (
            <AnimatedPressable
              onPress={handleSelect}
              disabled={isDisabled}
              className="overflow-hidden rounded-2xl"
              disableRipple
            >
              <AddressCard
                data={item}
                disableTapOnMap
                isLoading={isLoading}
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
            <Link href={'/addresses/create'} asChild push>
              <AnimatedPressable
                className="flex-1 items-center justify-center gap-2 overflow-hidden rounded-2xl"
                style={{ width: 200 }}
              >
                <Icon as={PlusCircleIcon} size="2xl" />
                <Text className="font-JakartaSemiBold">New Address</Text>
              </AnimatedPressable>
            </Link>
          );
        }}
      />
    </FieldWrapper>
  );
}
