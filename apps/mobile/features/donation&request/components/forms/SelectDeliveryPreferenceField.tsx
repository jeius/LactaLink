import { AnimatedPressable } from '@/components/animated/pressable';
import Avatar from '@/components/Avatar';
import { FieldWrapper } from '@/components/form-fields/FieldWrapper';
import { Box } from '@/components/ui/box';
import { FlashList } from '@/components/ui/FlashList';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import DeliveryPreferenceCard from '@/features/delivery-preference/components/DeliveryPreferenceCard';
import { useDeliveryPreferencesQuery } from '@/features/delivery-preference/hooks/queries';
import { transformToDeliveryPreferenceSchema } from '@/lib/utils/transformData';
import { tva } from '@gluestack-ui/utils/nativewind-utils';
import { DeliveryPreference } from '@lactalink/types/payload-generated-types';
import { generatePlaceHoldersWithID } from '@lactalink/utilities';
import { isPlaceHolderData } from '@lactalink/utilities/checkers';
import { extractCollection, listKeyExtractor } from '@lactalink/utilities/extractors';
import { Link } from 'expo-router';
import { PlusCircleIcon } from 'lucide-react-native';
import { Control, FieldPath, FieldValues, useController } from 'react-hook-form';

const cardStyle = tva({
  base: 'flex-1 rounded-2xl p-0',
  variants: { isSelected: { true: 'border-2 border-primary-500' } },
});

interface Props<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  control: Control<TFieldValues>;
  name: TName;
  selections: DeliveryPreference[];
  isLoading?: boolean;
  isDisabled?: boolean;
}

export default function SelectDeliveryPreferenceField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  selections: prefs,
  isDisabled,
  isLoading: isLoadingProp,
}: Props<TFieldValues, TName>) {
  const { data: selections, ...query } = useDeliveryPreferencesQuery(prefs);

  const isLoading = isLoadingProp || query.isLoading;

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
        data={selections ?? generatePlaceHoldersWithID(5, {} as DeliveryPreference)}
        keyExtractor={listKeyExtractor}
        ItemSeparatorComponent={() => <Box className="w-3" />}
        contentContainerClassName="px-5"
        footerClassName="px-2 items-stretch"
        className="-mx-5 mt-2 h-64"
        renderItem={({ item }) => {
          if (isLoading || isPlaceHolderData(item)) return <DeliveryPreferenceCard.Skeleton />;

          return (
            <RenderItem
              item={item}
              selected={value}
              isDisabled={isDisabled}
              onSelect={(data) => {
                onChange(data ? transformToDeliveryPreferenceSchema(data) : null);
                onBlur();
              }}
            />
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
                <Text className="text-center font-JakartaSemiBold">Add Delivery Preference</Text>
              </AnimatedPressable>
            </Link>
          );
        }}
      />
    </FieldWrapper>
  );
}

type RenderItemProps = {
  item: DeliveryPreference;
  selected: DeliveryPreference | null;
  onSelect: (data: DeliveryPreference | null) => void;
  isDisabled?: boolean;
};

function RenderItem({ item, selected, onSelect, isDisabled }: RenderItemProps) {
  const owner = extractCollection(item.owner);
  const isSelected = selected?.id === item.id;

  function handleSelect() {
    onSelect(isSelected ? null : item);
  }

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
        variant="filled"
        className={cardStyle({ isSelected })}
        style={{ width: 190 }}
      />

      {owner && (
        <Box className="absolute" style={{ top: 8, right: 8 }}>
          <Avatar profile={owner.profile} size="xs" showBadge={false} />
        </Box>
      )}
    </AnimatedPressable>
  );
}
