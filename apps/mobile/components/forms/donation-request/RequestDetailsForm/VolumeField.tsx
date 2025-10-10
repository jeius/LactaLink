import { FormField } from '@/components/FormField';
import { AnimatedPressable } from '@/components/animated/pressable';
import { MilkBagCard } from '@/components/cards/MilkBagCard';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
import { HStack } from '@/components/ui/hstack';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { VOLUME_PRESET } from '@/lib/constants/donationRequest';
import { RequestSchema } from '@lactalink/form-schemas';
import { Donation, MilkBag } from '@lactalink/types/payload-generated-types';
import { generatePlaceHoldersWithID } from '@lactalink/utilities';
import { isPlaceHolderData } from '@lactalink/utilities/checkers';
import { extractCollection, extractErrorMessage, extractID } from '@lactalink/utilities/extractors';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { AlertCircleIcon } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

interface VolumeFieldProps {
  matchedDonation?: Donation;
  isLoading?: boolean;
  isDisabled?: boolean;
}

export function VolumeField({ isLoading, matchedDonation, isDisabled }: VolumeFieldProps) {
  const [isCustomVolume, setIsCustomVolume] = useState(false);
  const { control } = useFormContext<RequestSchema>();

  function handleToggleCustomVolume() {
    setIsCustomVolume((prev) => !prev);
  }

  return matchedDonation ? (
    <MilkBagsField
      matchedDonation={matchedDonation}
      isLoading={isLoading}
      isDisabled={isDisabled}
    />
  ) : (
    <VStack space="sm" className="mx-5">
      <Text className="font-JakartaMedium">How much milk do you need?</Text>
      <Card variant="filled" className="flex-col gap-5" isDisabled={isDisabled}>
        <FormField
          control={control}
          name="volumeNeeded"
          fieldType="button-group"
          options={Object.values(VOLUME_PRESET)}
          isDisabled={isCustomVolume}
          isLoading={isLoading}
        />

        <HStack space="sm" className="items-start">
          <Button
            size="sm"
            variant={isCustomVolume ? 'solid' : 'outline'}
            onPress={handleToggleCustomVolume}
          >
            <ButtonText>Custom</ButtonText>
          </Button>

          {isCustomVolume && (
            <FormField
              control={control}
              name="volumeNeeded"
              fieldType="number"
              placeholder="Enter volume in mL"
              variant="underlined"
              className="w-full max-w-48"
              containerClassName="flex-1"
            />
          )}
        </HStack>
      </Card>
    </VStack>
  );
}

const placeholder = generatePlaceHoldersWithID(6, {}) as MilkBag[];

interface MilkBagsFieldProps {
  matchedDonation: Donation;
  isLoading?: boolean;
  isDisabled?: boolean;
}

function MilkBagsField({ matchedDonation, isLoading, isDisabled }: MilkBagsFieldProps) {
  const { control, getFieldState, setValue } = useFormContext<RequestSchema>();
  const { error } = getFieldState('details.bags');
  const selectedBags = useWatch({ control, name: 'details.bags' });

  const { bags, bagsMap } = useMemo(() => {
    const bags = extractCollection(matchedDonation.details.bags);

    const map = new Map<string, MilkBag>();
    bags.forEach((bag) => map.set(extractID(bag), bag));

    return { bags: Array.from(map.values()), bagsMap: map };
  }, [matchedDonation]);

  useEffect(() => {
    // Update the total volume needed based on selected bags
    if (Array.isArray(selectedBags) && selectedBags.length > 0) {
      const totalVolume = selectedBags.reduce((acc, { id: bagId }) => {
        const bag = bagsMap.get(bagId);
        return acc + (bag?.volume || 0);
      }, 0);

      setValue('volumeNeeded', totalVolume);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBags, bagsMap]);

  const renderItem: ListRenderItem<MilkBag> = ({ item, index }) => {
    const isPlaceholder = isPlaceHolderData(item);
    const isSelected = selectedBags?.some(({ id }) => id === item.id);

    function handleSelectBag() {
      if (isSelected) {
        setValue(
          'details.bags',
          selectedBags?.filter(({ id }) => id !== item.id),
          { shouldValidate: true, shouldDirty: true, shouldTouch: true }
        );
      } else {
        setValue(
          'details.bags',
          selectedBags ? [...selectedBags, { id: item.id }] : [{ id: item.id }],
          { shouldValidate: true, shouldDirty: true, shouldTouch: true }
        );
      }
    }

    return isPlaceholder ? (
      <CardSkeleton />
    ) : (
      <AnimatedPressable
        // entering={FadeIn.duration(300).delay(index * 200)}
        disabled={isDisabled}
        onPress={handleSelectBag}
        className="overflow-hidden rounded-2xl"
      >
        <MilkBagCard
          disableViewThumbnail
          data={item}
          className={isSelected ? 'border-primary-500 border-2' : undefined}
        />
      </AnimatedPressable>
    );
  };

  return (
    <FormControl isInvalid={!!error} isDisabled={isDisabled}>
      <FormControlLabel className="mx-5">
        <FormControlLabelText>Available Milk Bags</FormControlLabelText>
      </FormControlLabel>

      <FormControlHelper className="mx-5">
        <FormControlHelperText>Select the milk bags you want to request.</FormControlHelperText>
      </FormControlHelper>

      <Box className="mt-2">
        <FlashList
          horizontal
          data={isLoading ? placeholder : bags}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 8 }}
          ItemSeparatorComponent={() => <Box className="w-4" />}
        />
      </Box>

      {error && (
        <FormControlError className="mx-5">
          <FormControlErrorIcon as={AlertCircleIcon} />
          <FormControlErrorText numberOfLines={2} ellipsizeMode="tail" className="shrink">
            {extractErrorMessage(error)}
          </FormControlErrorText>
        </FormControlError>
      )}
    </FormControl>
  );
}

function CardSkeleton() {
  return (
    <Card className={`w-40 p-0`}>
      <VStack className="items-stretch">
        <Skeleton variant="sharp" className="h-32 w-full" />
        <VStack space="xs" className="w-full items-center px-3 py-2">
          <Skeleton variant="circular" className="h-5 w-2/3" />

          <Skeleton variant="circular" className="h-3 w-full" />
          <Skeleton variant="circular" className="h-3 w-2/3" />
        </VStack>
      </VStack>
    </Card>
  );
}
