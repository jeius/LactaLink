import { AnimatedPressable } from '@/components/animated/pressable';
import { DeliveryPreferenceCard } from '@/components/cards/DeliveryPreferenceCard';
import { MilkBagCard } from '@/components/cards/MilkBagCard';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { DeliveryPreference, MilkBag } from '@lactalink/types/payload-generated-types';
import { generatePlaceHoldersWithID } from '@lactalink/utilities';
import { isPlaceHolderData } from '@lactalink/utilities/checkers';
import { Link } from 'expo-router';
import React, { ComponentProps } from 'react';
import { FlatList } from 'react-native-gesture-handler';

const PLACEHOLDER_DATA = generatePlaceHoldersWithID(4, {});

interface DPListProps extends ComponentProps<typeof VStack> {
  data: DeliveryPreference[];
  isLoading?: boolean;
}

export function DPList({ data, isLoading, ...props }: DPListProps) {
  return (
    <VStack {...props}>
      <Text className="font-JakartaSemiBold mx-5 mb-1">Delivery Preferences</Text>
      <FlatList
        data={isLoading ? (PLACEHOLDER_DATA as typeof data) : data}
        horizontal
        keyExtractor={(item) => item.id}
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

interface MilkBagListProps extends ComponentProps<typeof VStack> {
  data: MilkBag[];
  isLoading?: boolean;
}

export function MilkBagList({ data, isLoading, ...props }: MilkBagListProps) {
  if (!isLoading && data.length === 0) {
    return null;
  }

  return (
    <VStack {...props}>
      <Text className="font-JakartaSemiBold mx-5 mb-1">Milk Bags</Text>
      <FlatList
        data={isLoading ? (PLACEHOLDER_DATA as typeof data) : data}
        horizontal
        keyExtractor={(item) => item.id}
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
