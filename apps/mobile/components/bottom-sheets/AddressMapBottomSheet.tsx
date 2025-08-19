import { AddressSchema } from '@lactalink/types';
import {
  CheckIcon,
  LandmarkIcon,
  MapPinHouseIcon,
  MountainIcon,
  SaveIcon,
} from 'lucide-react-native';
import React, { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FormField } from '../FormField';
import { ActionModal } from '../modals';
import { BottomSheet, BottomSheetPortal, BottomSheetScrollView } from '../ui/bottom-sheet';
import { BottomSheetHandle } from '../ui/BottomSheetHandle';
import { Checkbox, CheckboxIcon, CheckboxIndicator, CheckboxLabel } from '../ui/checkbox';
import { HStack } from '../ui/hstack';
import { VStack } from '../ui/vstack';

interface AddressMapBottomSheetProps {
  onSavePress?: () => void;
  isLoading?: boolean;
}

export function AddressMapBottomSheet({ onSavePress, isLoading }: AddressMapBottomSheetProps) {
  const insets = useSafeAreaInsets();
  const form = useFormContext<AddressSchema>();

  const { isDefault = false, cityMunicipality, province } = form.watch();

  const isSubmitting = form.formState.isSubmitting;

  const snapPoints = useMemo(() => ['30%', '50%', '80%'], []);

  function handleSetDefault(isSelected: boolean) {
    form.setValue('isDefault', isSelected);
  }

  async function handleValidation() {
    const isValid = await form.trigger();
    if (!isValid) {
      throw new Error('Form validation failed');
    }
  }

  return (
    <BottomSheet disableClose snapToIndex={0}>
      <BottomSheetPortal
        snapPoints={snapPoints}
        snapToIndex={0}
        enableDynamicSizing={false}
        handleComponent={BottomSheetHandle}
        enableBlurKeyboardOnGesture={false}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustPan"
        enableContentPanningGesture={true}
      >
        <BottomSheetScrollView
          style={{ paddingBottom: insets.bottom, backgroundColor: 'transparent' }}
        >
          <VStack space="lg" className="p-4">
            <FormField
              name={`province`}
              label="Province"
              fieldType="combobox"
              placeholder="Select province..."
              collection="provinces"
              searchPath="name"
              searchPlaceholder="Search province here..."
              icon={MountainIcon}
              iconPosition="left"
              isLoading={isLoading}
              isDisabled={isSubmitting}
            />

            <FormField
              name={`cityMunicipality`}
              label="City or Municipality"
              fieldType="combobox"
              placeholder="Select city or municipality..."
              collection="citiesMunicipalities"
              searchPath="name"
              searchPlaceholder="Search city or municipality here..."
              icon={LandmarkIcon}
              iconPosition="left"
              where={province ? { province: { equals: province } } : undefined}
              isLoading={isLoading}
              isDisabled={isSubmitting}
            />

            <FormField
              name={`barangay`}
              label="Barangay"
              helperText="If applicable, select the barangay of this address."
              fieldType="combobox"
              placeholder="Select barangay..."
              collection="barangays"
              searchPath="name"
              searchPlaceholder="Search barangay here..."
              icon={MapPinHouseIcon}
              iconPosition="left"
              isLoading={isLoading}
              isDisabled={isSubmitting}
              where={
                cityMunicipality
                  ? { cityMunicipality: { equals: cityMunicipality } }
                  : province
                    ? { province: { equals: province } }
                    : undefined
              }
            />

            <FormField
              name={`street`}
              label="Street Address"
              helperText="Enter the street address of this location."
              fieldType="text"
              placeholder="e.g. Block 9, Sudlonon St."
              autoCapitalize="words"
              autoComplete="street-address"
              textContentType="fullStreetAddress"
              useBottomSheetInputs
              isLoading={isLoading}
              isDisabled={isSubmitting}
            />

            <FormField
              name={`zipCode`}
              label="Zip Code"
              helperText="Enter the zip/postal code of this address."
              fieldType="text"
              placeholder="e.g. 9200"
              keyboardType="number-pad"
              textContentType="postalCode"
              className="max-w-32"
              useBottomSheetInputs
              isLoading={isLoading}
              isDisabled={isSubmitting}
            />

            <FormField
              name={`name`}
              fieldType="text"
              label="Address Label"
              placeholder="e.g. Home, Workplace"
              autoCapitalize="words"
              helperText="Set a label for this address to easily identify it."
              useBottomSheetInputs
              isLoading={isLoading}
              isDisabled={isSubmitting}
            />

            <HStack space="xl" className="justify-between">
              <Checkbox
                value={`address-checkbox`}
                isChecked={isDefault}
                onChange={handleSetDefault}
                isDisabled={isSubmitting}
              >
                <CheckboxIndicator>
                  <CheckboxIcon as={CheckIcon} />
                </CheckboxIndicator>
                <CheckboxLabel>Set as default address</CheckboxLabel>
              </Checkbox>
            </HStack>

            <ActionModal
              className="mt-5"
              isDisabled={isSubmitting}
              triggerLabel="Save Address"
              triggerIcon={SaveIcon}
              title="Review Address"
              description="Are you sure you want to save this address?"
              onTriggerPress={handleValidation}
              confirmLabel="Save"
              onConfirm={onSavePress}
            />
          </VStack>
        </BottomSheetScrollView>
      </BottomSheetPortal>
    </BottomSheet>
  );
}
