import { FormField } from '@/components/FormField';
import { OptionsCardItem } from '@/components/cards';
import { Button, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useFetchById } from '@/hooks/collections/useFetchById';
import { VOLUME_PRESET } from '@/lib/constants/donationRequest';
import { MilkBag, RequestSchema } from '@lactalink/types';
import React, { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';

interface VolumeFieldProps {
  donationID?: string;
  isLoading?: boolean;
}

export function VolumeField({ donationID: id, isLoading: isLoadingProp }: VolumeFieldProps) {
  const [isCustomVolume, setIsCustomVolume] = useState(false);
  const form = useFormContext<RequestSchema>();

  const {
    data,
    isLoading: isDataLoading,
    error,
  } = useFetchById(Boolean(id), {
    collection: 'donations',
    id,
    populate: { users: { profile: true, profileType: true, role: true } },
  });

  const isLoading = isLoadingProp || isDataLoading;

  const selectedBags = form.watch('details.bags');
  const bags = data?.details?.bags as MilkBag[] | undefined;

  const options: OptionsCardItem<string>[] | undefined = bags
    ?.filter((bag) => bag.status === 'AVAILABLE')
    .map((bag) => ({
      label: String(bag.volume) + ' mL',
      value: bag.id,
    }));

  useEffect(() => {
    if (Array.isArray(selectedBags) && selectedBags.length > 0) {
      const totalVolume = selectedBags.reduce((acc, bagId) => {
        const bag = bags?.find((b) => b.id === bagId);
        return acc + (bag?.volume || 0);
      }, 0);
      form.setValue('volumeNeeded', totalVolume);
    }
  }, [selectedBags, bags, form]);

  function handleToggleCustomVolume() {
    setIsCustomVolume((prev) => !prev);
  }

  return id ? (
    <VStack space="sm" className="mx-5">
      <Text className="font-JakartaMedium">Available Milk Bags</Text>
      <Card variant="filled">
        <FormField
          fieldType="button-group"
          name="details.bags"
          allowMultipleSelection
          helperText="Select the milk bags you want to request."
          options={options || []}
          isLoading={isLoading}
        />
      </Card>
    </VStack>
  ) : (
    <VStack space="sm" className="mx-5">
      <Text className="font-JakartaMedium">How much do you need?</Text>
      <Card variant="filled" className="flex-col gap-5">
        <FormField
          name="volumeNeeded"
          label="Select one"
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
