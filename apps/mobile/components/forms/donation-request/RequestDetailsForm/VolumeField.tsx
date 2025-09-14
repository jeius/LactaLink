import { FormField } from '@/components/FormField';
import { SingleImageViewer } from '@/components/ImageViewer';
import { AnimatedPressable } from '@/components/animated/pressable';
import { useForm } from '@/components/contexts/FormProvider';
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
import { extractMilkBagSchema } from '@/lib/utils/extractMilkBagShema';
import { MilkBagSchema, RequestSchema } from '@lactalink/form-schemas';
import { Donation } from '@lactalink/types/payload-generated-types';
import { extractCollection, extractID } from '@lactalink/utilities/extractors';
import { formatDate } from '@lactalink/utilities/formatters';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { randomUUID } from 'expo-crypto';
import { AlertCircleIcon } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

interface VolumeFieldProps {
  matchedDonation?: Donation;
  isLoading?: boolean;
  isDisabled?: boolean;
}

export function VolumeField({ isLoading, matchedDonation, isDisabled }: VolumeFieldProps) {
  const [isCustomVolume, setIsCustomVolume] = useState(false);
  const form = useFormContext<RequestSchema>();

  const selectedBags = form.watch('details.bags');
  const setValue = form.setValue;

  const { bags, bagsMap } = useMemo(() => {
    const bags = extractCollection(matchedDonation?.details.bags) || [];

    const map = new Map<string, MilkBagSchema>();
    bags?.forEach((bag) => map.set(extractID(bag), extractMilkBagSchema(bag)));

    return { bags: Array.from(map.values()), bagsMap: map };
  }, [matchedDonation]);

  useEffect(() => {
    if (Array.isArray(selectedBags) && selectedBags.length > 0) {
      const totalVolume = selectedBags.reduce((acc, bagId) => {
        const bag = bagsMap.get(bagId);
        return acc + (bag?.volume || 0);
      }, 0);

      setValue('volumeNeeded', totalVolume);
    }
  }, [selectedBags, bags, setValue, bagsMap]);

  function handleToggleCustomVolume() {
    setIsCustomVolume((prev) => !prev);
  }

  return matchedDonation ? (
    <MilkBagsField bags={bags} isLoading={isLoading} isDisabled={isDisabled} />
  ) : (
    <VStack space="sm" className="mx-5">
      <Text className="font-JakartaMedium">How much milk do you need?</Text>
      <Card variant="filled" className="flex-col gap-5" isDisabled={isDisabled}>
        <FormField
          control={form.control}
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
              control={form.control}
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

interface MilkBagsFieldProps {
  bags: MilkBagSchema[];
  isLoading?: boolean;
  isDisabled?: boolean;
}

function MilkBagsField({ bags, isLoading, isDisabled }: MilkBagsFieldProps) {
  const form = useForm<RequestSchema>();
  const { error } = form.getFieldState('details.bags');

  const placeholder = useMemo(
    () =>
      Array.from(
        { length: 6 },
        (_, index) =>
          ({
            id: `placeholder-${index}-${randomUUID()}`,
          }) as MilkBagSchema
      ),
    []
  );

  return (
    <FormControl isInvalid={!!error} isDisabled={isDisabled}>
      <FormControlLabel className="mx-5">
        <FormControlLabelText>Available Milk Bags</FormControlLabelText>
      </FormControlLabel>

      <Controller
        control={form.control}
        name="details.bags"
        render={({ field }) => {
          const renderItem: ListRenderItem<MilkBagSchema> = ({ item }) => {
            const isPlaceholder = item.id.startsWith('placeholder-');

            const title = `${item.volume || 0} mL`;
            const date = formatDate(item.collectedAt);
            const time = new Date(item.collectedAt).toLocaleTimeString('en', {
              hour: '2-digit',
              minute: '2-digit',
            });

            const imageUrl = item.bagImage?.url;
            const blurhash = item.bagImage?.blurhash;
            const alt = item.bagImage?.alt || 'Milk Bag Image';

            const code = item.code || 'No Code';

            const value = Array.isArray(field.value) ? field.value : [];

            const isSelected = value.includes(item.id);

            function handleSelectBag() {
              if (isSelected) {
                field.onChange(value?.filter((id) => id !== item.id));
              } else {
                field.onChange([...value, item.id]);
              }
            }

            return isPlaceholder ? (
              <CardSkeleton />
            ) : (
              <AnimatedPressable disabled={isDisabled} onPress={handleSelectBag} className="mr-4">
                <Card
                  isDisabled={isDisabled}
                  className={`w-40 p-0 ${isSelected ? 'border-primary-500 border-2' : ''}`}
                >
                  <VStack className="items-stretch">
                    <Box className="bg-primary-50 relative h-32 w-full flex-shrink-0 overflow-hidden">
                      {imageUrl ? (
                        <SingleImageViewer
                          disabled
                          image={{ uri: imageUrl, blurHash: blurhash, alt }}
                        />
                      ) : (
                        <Text size="xs" className="my-auto text-center">
                          No Image
                        </Text>
                      )}
                      <Text
                        size="sm"
                        bold
                        className="bg-primary-500 text-primary-0 absolute left-0 top-0 px-2 py-1 text-center"
                        style={{ borderBottomRightRadius: 8 }}
                      >
                        {code}
                      </Text>
                    </Box>
                    <VStack space="xs" className="px-3 py-2">
                      <Text className="font-JakartaSemiBold text-center">{title}</Text>
                      <Text size="xs" className="text-typography-800 text-center">
                        {date}, {time}
                      </Text>
                    </VStack>
                  </VStack>
                </Card>
              </AnimatedPressable>
            );
          };

          return (
            <FlashList
              horizontal
              data={isLoading ? placeholder : bags}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 8 }}
              ItemSeparatorComponent={() => <Box style={{ width: 14 }} />}
            />
          );
        }}
      />

      <FormControlError className="mx-5">
        <FormControlErrorIcon as={AlertCircleIcon} />
        <FormControlErrorText>{error?.message}</FormControlErrorText>
      </FormControlError>

      <FormControlHelper className="mx-5">
        <FormControlHelperText>Select the milk bags you want to request.</FormControlHelperText>
      </FormControlHelper>
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
