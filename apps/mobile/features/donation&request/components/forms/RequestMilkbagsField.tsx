import { AnimatedPressable } from '@/components/animated/pressable';
import { Box } from '@/components/ui/box';
import { FlashList, ListRenderItem } from '@/components/ui/FlashList';
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
import { transformToMilkBagSchema } from '@/lib/utils/transformData';
import { RequestCreateSchema } from '@lactalink/form-schemas';
import { Donation, MilkBag } from '@lactalink/types/payload-generated-types';
import { displayVolume, generatePlaceHoldersWithID } from '@lactalink/utilities';
import { isPlaceHolderData } from '@lactalink/utilities/checkers';
import { extractCollection, extractID, listKeyExtractor } from '@lactalink/utilities/extractors';
import { AlertCircleIcon } from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo } from 'react';
import { Control, useController } from 'react-hook-form';
import { FadeIn } from 'react-native-reanimated';
import MilkBagCard from '../cards/MilkBagCard';

const placeholders = generatePlaceHoldersWithID(6, {}) as MilkBag[];

interface Props {
  control: Control<RequestCreateSchema>;
  matchedDonation: Donation | undefined;
  isLoading?: boolean;
  isDisabled?: boolean;
}

function RequestMilkbagsField({ matchedDonation, isLoading, isDisabled, control }: Props) {
  const {
    field: { onChange: setVolumeNeeded, onBlur: blurVolumeNeeded },
  } = useController({ control, name: 'volumeNeeded' });

  const {
    field: { value: selectedBags, onChange, onBlur, ref },
    fieldState: { error: fieldError, invalid },
    formState: { isSubmitting },
  } = useController({ control, name: 'details.bags' });

  const disableField = isDisabled || isSubmitting;

  const { bags, bagsMap } = useMemo(() => {
    const bags = isLoading ? placeholders : extractCollection(matchedDonation?.details.bags);

    const map = new Map<string, MilkBag>();
    bags?.forEach((bag) => map.set(extractID(bag), bag));

    return { bags: Array.from(map.values()), bagsMap: map };
  }, [isLoading, matchedDonation?.details.bags]);

  useEffect(() => {
    // Update the total volume needed based on selected bags
    if (Array.isArray(selectedBags) && selectedBags.length > 0) {
      const totalVolume = selectedBags.reduce((acc, { id: bagId }) => {
        const bag = bagsMap.get(bagId);
        return acc + (bag?.volume || 0);
      }, 0);
      setVolumeNeeded(totalVolume);
      blurVolumeNeeded();
    }
  }, [selectedBags, bagsMap, setVolumeNeeded, blurVolumeNeeded]);

  function handleSelect(selected: MilkBag[]) {
    onChange(selected.map((bag) => transformToMilkBagSchema(bag)));
    onBlur();
  }

  return (
    <FormControl ref={ref} isInvalid={invalid} isDisabled={disableField}>
      <FormControlLabel className="mx-5">
        <FormControlLabelText>Available Milk Bags</FormControlLabelText>
      </FormControlLabel>

      <FormControlHelper className="mx-5">
        <FormControlHelperText>Select the milk bags you want to request.</FormControlHelperText>
      </FormControlHelper>

      {fieldError && (
        <FormControlError className="mx-5">
          <FormControlErrorIcon as={AlertCircleIcon} />
          <FormControlErrorText numberOfLines={2} ellipsizeMode="tail" className="shrink">
            {fieldError.message || fieldError.root?.message || 'Invalid selection'}
          </FormControlErrorText>
        </FormControlError>
      )}

      <Box className="mt-2">
        <MilkbagList
          bags={bags}
          selectedBags={
            (selectedBags ?? []).map((bag) => bagsMap.get(bag.id)).filter(Boolean) as MilkBag[]
          }
          onSelect={handleSelect}
          isDisabled={disableField}
        />
      </Box>
    </FormControl>
  );
}

function MilkbagList({
  bags,
  selectedBags,
  onSelect,
  isDisabled,
}: {
  bags: MilkBag[];
  selectedBags: MilkBag[] | null | undefined;
  onSelect: (bags: MilkBag[]) => void;
  isDisabled?: boolean;
}) {
  const renderItem = useCallback<ListRenderItem<MilkBag>>(
    ({ item, index }) => {
      if (isPlaceHolderData(item)) return <MilkBagCard.Skeleton />;

      const isSelected = selectedBags?.some(({ id }) => id === item.id);

      function handleSelectBag() {
        if (isSelected) {
          onSelect(selectedBags?.filter(({ id }) => id !== item.id) ?? []);
        } else {
          onSelect(selectedBags ? [...selectedBags, item] : [item]);
        }
      }

      return (
        <AnimatedPressable
          entering={FadeIn.duration(300).delay(index * 200)}
          disabled={isDisabled}
          onPress={handleSelectBag}
          className={`overflow-hidden rounded-2xl ${isSelected ? 'border-2 border-primary-500' : ''}`}
          aria-label={`Select ${displayVolume(item.volume)} milkbag with code: ${item.code}`}
          recyclingKey={item.id}
        >
          <MilkBagCard disableViewThumbnail data={item} />
        </AnimatedPressable>
      );
    },
    [isDisabled, onSelect, selectedBags]
  );

  return (
    <FlashList horizontal data={bags} keyExtractor={listKeyExtractor} renderItem={renderItem} />
  );
}

export default RequestMilkbagsField;