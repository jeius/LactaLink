import { AnimatedPressable } from '@/components/animated/pressable';
import { DeliveryPreferenceCard } from '@/components/cards/DeliveryPreferenceCard';
import { MilkBagCard } from '@/components/cards/MilkBagCard';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { VStack, VStackProps } from '@/components/ui/vstack';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { Collections } from '@lactalink/types/collections';
import { DeliveryPreference, MilkBag } from '@lactalink/types/payload-generated-types';
import { generatePlaceHoldersWithID } from '@lactalink/utilities';
import { isPlaceHolderData } from '@lactalink/utilities/checkers';
import { listKeyExtractor } from '@lactalink/utilities/extractors';
import { Link } from 'expo-router';
import React from 'react';
import { FlatList } from 'react-native-gesture-handler';

const PLACEHOLDER_DATA = generatePlaceHoldersWithID(4, {});
const baseLabelStyle = tva({
  base: 'mx-5 mb-1 font-JakartaSemiBold',
});

interface BaseProps<T extends Collections> extends VStackProps {
  data: T[];
  isLoading?: boolean;
  label?: string;
  labelClassName?: string;
}

export function DPList({
  data,
  isLoading,
  label = 'Delivery Preferences',
  labelClassName,
  ...props
}: BaseProps<DeliveryPreference>) {
  return (
    <VStack {...props}>
      <Text className={baseLabelStyle({ class: labelClassName })}>{label}</Text>
      <FlatList
        data={isLoading ? (PLACEHOLDER_DATA as typeof data) : data}
        horizontal
        keyExtractor={listKeyExtractor}
        showsHorizontalScrollIndicator={false}
        ItemSeparatorComponent={() => <Box className="w-4" />}
        contentContainerClassName="px-5"
        renderItem={({ item }) => {
          const isLoading = isPlaceHolderData(item);
          return (
            <Link asChild push href={`/delivery-preferences/${item.id}`}>
              <AnimatedPressable className="overflow-hidden rounded-2xl">
                <DeliveryPreferenceCard
                  appearance="compact"
                  preference={item}
                  isLoading={isLoading}
                />
              </AnimatedPressable>
            </Link>
          );
        }}
      />
    </VStack>
  );
}

export function MilkBagList({
  data,
  isLoading,
  label = 'Milk Bags',
  labelClassName,
  ...props
}: BaseProps<MilkBag>) {
  if (!isLoading && data.length === 0) {
    return null;
  }

  return (
    <VStack {...props}>
      <Text className={baseLabelStyle({ class: labelClassName })}>{label}</Text>
      <FlatList
        data={isLoading ? (PLACEHOLDER_DATA as typeof data) : data}
        horizontal
        keyExtractor={listKeyExtractor}
        showsHorizontalScrollIndicator={false}
        ItemSeparatorComponent={() => <Box className="w-4" />}
        contentContainerClassName="px-5"
        renderItem={({ item }) => {
          const isLoading = isPlaceHolderData(item);
          return <MilkBagCard data={item} isLoading={isLoading} />;
        }}
      />
    </VStack>
  );
}
