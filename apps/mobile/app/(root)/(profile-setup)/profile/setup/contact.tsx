import { AnimatedPressable } from '@/components/animated/pressable';
import { DeleteActionButton } from '@/components/buttons';
import { AddressCard } from '@/components/cards';
import { TextInputField } from '@/components/form-fields/TextInputField';
import { HintAlert } from '@/components/HintAlert';
import KeyboardAvoidingScrollView from '@/components/KeyboardAvoider';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FormControl, FormControlLabel, FormControlLabelText } from '@/components/ui/form-control';
import { useDeleteAddressMutation } from '@/features/address/hooks/mutations';
import { useKeyboardOffset } from '@/features/profile/components/KeyboardOffsetContext';
import PageTitle from '@/features/profile/components/PageTitle';

import { useMeUser } from '@/hooks/auth/useAuth';
import { useNavigateWithRedirect } from '@/hooks/useNavigateWithRedirect';

import { MMKV_KEYS } from '@/lib/constants/storageKeys';
import Storage from '@/lib/localStorage';
import { SetupProfileSchema } from '@lactalink/form-schemas';
import { Address } from '@lactalink/types/payload-generated-types';
import { extractCollection, extractID } from '@lactalink/utilities/extractors';

import { PhoneIcon, PlusIcon } from 'lucide-react-native';
import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { ListRenderItem, useWindowDimensions } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';

const STORAGE_KEY = MMKV_KEYS.ALERT.ADDRESS.CREATE;

export default function ProfileContact() {
  const navigateTo = useNavigateWithRedirect();

  const { data: user } = useMeUser();
  const addresses = user?.addresses?.docs || [];

  const hasViewedHint = Storage.getBoolean(STORAGE_KEY);
  const [showHint, setShowHint] = useState(!hasViewedHint);

  const offset = useKeyboardOffset((s) => s.height);
  const screen = useWindowDimensions();

  const { control } = useFormContext<SetupProfileSchema>();
  const { mutate: deleteAddr, isPending: isDeleting } = useDeleteAddressMutation();

  const gap = 16;
  const itemWidth = screen.width - 48;

  function handleAdd() {
    navigateTo('/addresses/create');
  }

  function handleHintClose() {
    Storage.set(STORAGE_KEY, false);
    setShowHint(false);
  }

  const renderItem: ListRenderItem<string | Address> = ({ item }) => {
    const addressName = extractCollection(item)?.name;

    const handlePress = () => {
      const addressId = extractID(item);
      navigateTo(`/addresses/edit/${addressId}`);
    };

    return (
      <AnimatedPressable
        disabled={isDeleting}
        onPress={handlePress}
        className="overflow-hidden rounded-2xl"
      >
        <AddressCard
          data={item}
          showMap
          disableTapOnMap
          disableLinks
          style={{ width: screen.width - 48, minHeight: 232 }}
          action={
            <DeleteActionButton
              hitSlop={10}
              itemName={addressName || 'this address'}
              onConfirm={() => deleteAddr(item)}
            />
          }
        />
      </AnimatedPressable>
    );
  };

  return (
    <KeyboardAvoidingScrollView keyboardVerticalOffset={offset}>
      <PageTitle className="px-5 py-4" />

      <Card variant="filled" className="mx-5">
        <TextInputField
          control={control}
          name="phone"
          label="Phone Number"
          inputProps={{
            placeholder: 'e.g. 09123456789',
            keyboardType: 'phone-pad',
            textContentType: 'telephoneNumber',
            autoComplete: 'tel-device',
            autoCapitalize: 'none',
            icon: PhoneIcon,
          }}
        />
      </Card>

      <FormControl className="mt-2 flex-1">
        <FormControlLabel className="px-5">
          <FormControlLabelText>Addresses</FormControlLabelText>
        </FormControlLabel>

        <Box className="px-5 pb-2">
          <HintAlert
            visible={showHint}
            message="You can add more addresses."
            onClose={handleHintClose}
          />
        </Box>

        <FlatList
          horizontal
          data={addresses}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <Box style={{ width: gap }} />}
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="px-5 pb-4 justify-center grow"
          decelerationRate={'fast'}
          snapToOffsets={addresses.map((_, idx) => (itemWidth + gap) * idx)}
          getItemLayout={(_, index) => ({
            length: itemWidth,
            offset: (itemWidth + gap) * index,
            index,
          })}
        />

        <Button size="sm" variant="outline" action="positive" className="mx-5" onPress={handleAdd}>
          <ButtonIcon size="md" as={PlusIcon} />
          <ButtonText>Add New Address</ButtonText>
        </Button>
      </FormControl>
    </KeyboardAvoidingScrollView>
  );
}
