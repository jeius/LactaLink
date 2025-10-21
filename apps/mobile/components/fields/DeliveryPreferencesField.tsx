import { AlertCircleIcon, Edit2Icon, PlusIcon, TruckIcon, XIcon } from 'lucide-react-native';

import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { useMeUser } from '@/hooks/auth/useAuth';
import { transformToDeliveryPreferenceSchema } from '@/lib/utils/transformData';
import { DonationCreateSchema, RequestCreateSchema } from '@lactalink/form-schemas';
import { DeliveryPreference } from '@lactalink/types/payload-generated-types';
import { extractCollection, extractID } from '@lactalink/utilities/extractors';
import { useMemo } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import Animated, { FadeIn, LinearTransition, SlideOutRight } from 'react-native-reanimated';
import { DeliveryPreferencesBottomSheet } from '../bottom-sheets/DeliveryPreferencesBottomSheet';
import { EditActionButton } from '../buttons';
import { DeliveryPreferenceCard } from '../cards/DeliveryPreferenceCard';
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlHelper,
  FormControlHelperText,
  FormControlLabel,
  FormControlLabelText,
} from '../ui/form-control';
import { HStack } from '../ui/hstack';
import { Icon } from '../ui/icon';
import { VStack } from '../ui/vstack';

const AnimatedDPCard = Animated.createAnimatedComponent(DeliveryPreferenceCard);

interface DeliveryPreferencesFieldProps {
  isLoading?: boolean;
  isDisabled?: boolean;
}

export function DeliveryPreferencesField({ isLoading, isDisabled }: DeliveryPreferencesFieldProps) {
  const { data: user } = useMeUser();
  const selections = extractCollection(user?.deliveryPreferences?.docs || []);

  const { control, getFieldState, formState, setValue } = useFormContext<
    DonationCreateSchema | RequestCreateSchema
  >();

  const { fields: selectedPrefs, remove } = useFieldArray({
    name: 'deliveryPreferences',
    keyName: 'fieldID',
    control: control,
  });

  const disableRemove = selectedPrefs.length <= 1;
  const hasPreferences = selectedPrefs.length > 0;

  const selectionsMap = useMemo(() => {
    const map = new Map<string, (typeof selections)[number]>();
    for (const pref of selections) {
      map.set(pref.id, pref);
    }
    return map;
  }, [selections]);

  const selected = useMemo(() => {
    const selected: DeliveryPreference[] = [];

    for (const { id } of selectedPrefs) {
      const pref = selectionsMap.get(id);
      if (pref) selected.push(pref);
    }

    return selected;
  }, [selectedPrefs, selectionsMap]);

  const { error } = getFieldState('deliveryPreferences');
  const isSubmitting = formState.isSubmitting;

  function handleChange(newPreferences: DeliveryPreference[]) {
    const preferences = newPreferences.map((pref) => transformToDeliveryPreferenceSchema(pref));
    setValue('deliveryPreferences', preferences);
  }

  function ListItem(pref: (typeof selectedPrefs)[number], index: number) {
    const item = selectionsMap.get(pref.id);

    if (!item) return null;

    const itemID = extractID(item);

    function handleRemove() {
      remove(index);
    }

    return (
      <AnimatedDPCard
        key={pref.fieldID}
        layout={LinearTransition.springify()}
        entering={FadeIn}
        exiting={SlideOutRight}
        isLoading={isLoading}
        isDisabled={isDisabled || isSubmitting}
        preference={item}
        action={
          <HStack space="lg" className="grow justify-end">
            <EditActionButton href={`/delivery-preferences/edit/${itemID}`} />
            <Button
              action="negative"
              variant="link"
              className="h-fit w-fit p-0"
              isDisabled={disableRemove}
              onPress={handleRemove}
              hitSlop={8}
            >
              <ButtonIcon as={XIcon} />
            </Button>
          </HStack>
        }
      />
    );
  }

  return (
    <FormControl isInvalid={!!error} isDisabled={isDisabled || isSubmitting} className="px-5">
      <FormControlLabel className="justify-between">
        <FormControlLabelText size="lg" className="font-JakartaSemiBold">
          Delivery Preferences
        </FormControlLabelText>
        <Icon as={TruckIcon} />
      </FormControlLabel>

      <FormControlHelper>
        <FormControlHelperText>You can add multiple delivery preferences.</FormControlHelperText>
      </FormControlHelper>

      <VStack space="sm" className="mt-2">
        {selectedPrefs.map(ListItem)}
      </VStack>

      <FormControlError>
        <FormControlErrorIcon as={AlertCircleIcon} />
        <FormControlErrorText>{error?.message}</FormControlErrorText>
      </FormControlError>

      <DeliveryPreferencesBottomSheet
        title="Select from your Delivery Preferences"
        createLabel="Add New Delivery Preferences"
        allowCreate={true}
        allowEdit={true}
        collections={selections}
        allowMultipleSelection={true}
        selected={selected}
        onChange={handleChange}
        isDisabled={isDisabled}
        triggerComponent={(props) => (
          <Animated.View layout={LinearTransition}>
            <Button
              {...props}
              isDisabled={isDisabled}
              size="sm"
              variant="outline"
              action="positive"
              className="mt-4"
            >
              <ButtonIcon as={hasPreferences ? Edit2Icon : PlusIcon} />
              <ButtonText>{hasPreferences ? 'Change' : 'Add'} Delivery Preferences</ButtonText>
            </Button>
          </Animated.View>
        )}
      />
    </FormControl>
  );
}
