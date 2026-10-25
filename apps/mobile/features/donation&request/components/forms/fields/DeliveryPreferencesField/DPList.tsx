import { AnimatedPressable } from '@/components/animated/pressable';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { InfiniteFlashList, InfiniteFlashListProps } from '@/components/ui/list';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import DeliveryPreferenceCard from '@/features/delivery-preference/components/DeliveryPreferenceCard';
import { DeliveryPreference } from '@lactalink/types/payload-generated-types';
import { listKeyExtractor } from '@lactalink/utilities/extractors';
import { CheckIcon, PenBoxIcon, PlusIcon } from 'lucide-react-native';

interface Props extends Omit<
  InfiniteFlashListProps<DeliveryPreference>,
  'renderItem' | 'ListHeaderComponent' | 'ListFooterComponent' | 'keyExtractor'
> {
  value?: DeliveryPreference[] | null;
  onChange?: (values: DeliveryPreference[]) => void;
  onCreate?: () => void;
  onEdit?: (id: string) => void;
  onDone?: () => void;
}
export default function DPList({ value, onChange, onCreate, onEdit, onDone, data, ...props }: Props) {
  return (
    <InfiniteFlashList
      {...props}
      data={data}
      keyExtractor={listKeyExtractor}
      gap={8}
      headerClassName="mb-4"
      contentContainerClassName="px-4"
      footerClassName="mt-4"
      ListHeaderComponent={
        <Box className="flex-row items-center justify-between gap-3">
          <Text bold size="lg" className="flex-1">
            Select from your Delivery Preferences
          </Text>
          <Button size="sm" action="primary" variant="solid" onPress={onDone}>
            <ButtonIcon as={CheckIcon} />
            <ButtonText>Done</ButtonText>
          </Button>
        </Box>
      }
      ListFooterComponent={
        <VStack space="sm">
          {props.isFetchingNextPage && <Spinner size={'small'} className="self-center" />}
          <Button
            disablePressAnimation
            action="default"
            variant="ghost"
            className="self-start"
            onPress={onCreate}
          >
            <ButtonIcon as={PlusIcon} />
            <ButtonText>Add New Preference</ButtonText>
          </Button>
        </VStack>
      }
      renderItem={({ item, isPlaceholder }) => {
        if (isPlaceholder) return <DeliveryPreferenceCard.Skeleton />;

        const selected = value?.some((pref) => pref.id === item.id);

        function handlePress() {
          if (!value) {
            onChange?.([item]);
            return;
          }
          let newValue: DeliveryPreference[] = [];
          if (selected) {
            newValue = value?.filter((pref) => pref.id !== item.id) || [];
          } else {
            newValue = [...(value || []), item];
          }
          onChange?.(newValue);
        }

        return (
          <AnimatedPressable
            className="overflow-hidden rounded-2xl border-success-600"
            style={{ borderWidth: selected ? 2 : 0 }}
            onPress={handlePress}
          >
            <DeliveryPreferenceCard showName data={item} className="w-full" />
            {selected && (
              <Box
                className="absolute left-0 top-0 bg-success-600 px-4 py-2"
                style={{ borderBottomRightRadius: 12 }}
              >
                <Text className="font-JakartaSemiBold text-success-0">Selected</Text>
              </Box>
            )}
            <Button
              variant="ghost"
              action="default"
              className="absolute h-fit w-fit bg-background-400/80 p-2"
              style={{ top: 8, right: 8 }}
              onPress={() => onEdit?.(item.id)}
            >
              <ButtonIcon as={PenBoxIcon} className="stroke-typography-0" />
            </Button>
          </AnimatedPressable>
        );
      }}
    />
  );
}
