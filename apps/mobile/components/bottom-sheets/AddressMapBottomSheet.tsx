import { AddressSchema } from '@lactalink/form-schemas';
import { Layout } from '@react-navigation/elements';
import {
  CheckIcon,
  LandmarkIcon,
  MapPinHouseIcon,
  MountainIcon,
  SaveIcon,
} from 'lucide-react-native';
import React, { PropsWithChildren, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import Animated, { SharedValue, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { LocateButton } from '../buttons/LocateButton';
import { TextInputField } from '../form-fields/TextInputField';
import { FormField } from '../FormField';
import { ActionModal } from '../modals';
import { BottomSheet, BottomSheetPortal, BottomSheetScrollView } from '../ui/bottom-sheet';
import { BottomSheetHandle, HANDLEHEIGHT } from '../ui/BottomSheetHandle';
import { Box } from '../ui/box';
import { Checkbox, CheckboxIcon, CheckboxIndicator, CheckboxLabel } from '../ui/checkbox';
import { HStack } from '../ui/hstack';
import { VStack } from '../ui/vstack';

const snapPoints = [HANDLEHEIGHT, '50%', '100%'];

interface AddressMapBottomSheetProps extends PropsWithChildren {
  /**
   * Callback fired when the save button is pressed.
   * @returns - `void`
   */
  onSavePress?: () => void;

  /**
   * If true, shows a loading state on the form fields.
   */
  isLoading?: boolean;

  /**
   * If true, renders the form fields inside the bottom sheet.
   * If false, renders the children prop.
   * @default false
   */
  editing?: boolean;

  positionProgress?: SharedValue<number>;
  snapPointProgress?: SharedValue<number>;
}

export function AddressMapBottomSheet({
  editing = false,
  children,
  positionProgress: progressProp,
  snapPointProgress,
  ...props
}: AddressMapBottomSheetProps) {
  const localPosProgress = useSharedValue(0);
  const positionProgress = progressProp ?? localPosProgress;

  const [boxSize, setBoxSize] = useState<Layout>({ width: 0, height: 0 });
  const [btnSize, setBtnSize] = useState<Layout>({ width: 40, height: 40 });

  const animatedBtnStyle = useAnimatedStyle(() => {
    const middlePos = boxSize.height * 0.5;
    const translateY = Math.max(
      positionProgress.value - HANDLEHEIGHT - btnSize.height,
      middlePos - btnSize.height - 20
    );
    return { transform: [{ translateY }] };
  });

  return (
    <Box className="flex-1" onLayout={(e) => setBoxSize(e.nativeEvent.layout)}>
      <Animated.View className="absolute right-4 top-0" style={animatedBtnStyle}>
        <LocateButton onLayout={(e) => setBtnSize(e.nativeEvent.layout)} disableFollowUser />
      </Animated.View>

      <BottomSheet disableClose snapToIndex={1}>
        <BottomSheetPortal
          snapPoints={snapPoints}
          snapToIndex={1}
          enableDynamicSizing={false}
          handleComponent={BottomSheetHandle}
          enableBlurKeyboardOnGesture={false}
          keyboardBehavior="extend"
          keyboardBlurBehavior="restore"
          android_keyboardInputMode="adjustPan"
          enableContentPanningGesture={true}
          animatedPosition={positionProgress}
          animatedIndex={snapPointProgress}
        >
          <BottomSheetScrollView
            showsVerticalScrollIndicator={false}
            automaticallyAdjustKeyboardInsets
          >
            {editing ? <FormSheetContent {...props} /> : children}
          </BottomSheetScrollView>
        </BottomSheetPortal>
      </BottomSheet>
    </Box>
  );
}

function FormSheetContent({ onSavePress, isLoading }: AddressMapBottomSheetProps) {
  const { control, formState, setValue, trigger } = useFormContext<AddressSchema>();

  const isDefault = useWatch({ control, name: 'isDefault', defaultValue: false });
  const cityID = useWatch({ control, name: 'cityMunicipality' });
  const provinceID = useWatch({ control, name: 'province' });

  const isSubmitting = formState.isSubmitting;

  function handleSetDefault(isSelected: boolean) {
    setValue('isDefault', isSelected);
  }

  async function handleValidation() {
    const isValid = await trigger();
    if (!isValid) {
      throw new Error('Form validation failed');
    }
  }

  return (
    <VStack space="lg" className="p-4 pt-0">
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
        where={provinceID ? { province: { equals: provinceID } } : undefined}
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
          cityID
            ? { cityMunicipality: { equals: cityID } }
            : provinceID
              ? { province: { equals: provinceID } }
              : undefined
        }
      />

      <TextInputField
        control={control}
        name="street"
        label="Street Address"
        helperText="Enter the street address of this location."
        isLoading={isLoading}
        isDisabled={isSubmitting}
        inputProps={{
          useBottomSheetInput: true,
          autoCapitalize: 'words',
          placeholder: 'e.g. Block 9, Sudlonon St.',
          autoComplete: 'street-address',
          textContentType: 'fullStreetAddress',
        }}
      />

      <TextInputField
        control={control}
        name="zipCode"
        label="Zip Code"
        helperText="Enter the zip/postal code of this address."
        isLoading={isLoading}
        isDisabled={isSubmitting}
        inputProps={{
          useBottomSheetInput: true,
          placeholder: 'e.g. 9200',
          containerClassName: 'max-w-32',
          keyboardType: 'number-pad',
          textContentType: 'postalCode',
        }}
      />

      <TextInputField
        control={control}
        name="name"
        label="Address Label"
        helperText="Set a label for this address to easily identify it."
        isLoading={isLoading}
        isDisabled={isSubmitting}
        inputProps={{
          useBottomSheetInput: true,
          autoCapitalize: 'words',
          placeholder: 'e.g. Home, Workplace',
        }}
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
  );
}
