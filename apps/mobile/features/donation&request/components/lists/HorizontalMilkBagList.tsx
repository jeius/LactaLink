import { AnimatedPressable } from '@/components/animated/pressable';
import { Box } from '@/components/ui/box';
import { FlashList } from '@/components/ui/FlashList';
import { Text } from '@/components/ui/text';
import { VStack, VStackProps } from '@/components/ui/vstack';
import { shadow } from '@/lib/utils/shadows';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { MilkBag } from '@lactalink/types/payload-generated-types';
import { generatePlaceHoldersWithID } from '@lactalink/utilities';
import { isPlaceHolderData } from '@lactalink/utilities/checkers';
import { listKeyExtractor } from '@lactalink/utilities/extractors';
import { Link } from 'expo-router';
import React from 'react';
import MilkBagCard from '../cards/MilkBagCard';

const baseLabelStyle = tva({
  base: 'mx-5 font-JakartaSemiBold',
});

interface Props extends VStackProps {
  data: MilkBag[];
  isLoading?: boolean;
  label?: string;
  labelClassName?: string;
}

export default function HorizontalMilkBagList({
  data,
  isLoading,
  label = 'Milk Bags',
  labelClassName,
  ...props
}: Props) {
  return (
    <VStack {...props}>
      <Text className={baseLabelStyle({ class: labelClassName })}>{label}</Text>

      <FlashList
        horizontal
        data={!isLoading ? data : generatePlaceHoldersWithID(5, {} as MilkBag)}
        keyExtractor={listKeyExtractor}
        ItemSeparatorComponent={() => <Box className="w-4" />}
        contentContainerClassName="px-5 py-2"
        renderItem={({ item }) => {
          if (isPlaceHolderData(item)) return <MilkBagCard.Skeleton />;
          return (
            <Link asChild push href={`/delivery-preferences/${item.id}`}>
              <AnimatedPressable className="overflow-hidden rounded-2xl" style={shadow.sm}>
                <MilkBagCard data={item} />
              </AnimatedPressable>
            </Link>
          );
        }}
      />
    </VStack>
  );
}
