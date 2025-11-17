import { TextInputField } from '@/components/form-fields/TextInputField';
import { HintAlert } from '@/components/HintAlert';
import { AddressList } from '@/components/lists';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FormControl, FormControlLabel, FormControlLabelText } from '@/components/ui/form-control';
import PageTitle from '@/features/profile/components/PageTitle';

import { useMeUser } from '@/hooks/auth/useAuth';

import { MMKV_KEYS } from '@/lib/constants/storageKeys';
import localStorage from '@/lib/localStorage';
import { SetupProfileSchema } from '@lactalink/form-schemas';

import { useRouter } from 'expo-router';
import { PhoneIcon, PlusIcon } from 'lucide-react-native';
import React from 'react';
import { useFormContext } from 'react-hook-form';

export default function ProfileContact() {
  const router = useRouter();
  const { data: user } = useMeUser();
  const addresses = user?.addresses?.docs || [];

  const hasViewedHint = localStorage.getBoolean(MMKV_KEYS.ALERT.ADDRESS.CREATE);
  const [showHint, setShowHint] = React.useState(!hasViewedHint);

  const { control } = useFormContext<SetupProfileSchema>();

  function handleAdd() {
    router.push('/addresses/create');
  }

  function handleHintClose() {
    localStorage.set(MMKV_KEYS.ALERT.ADDRESS.CREATE, true);
    setShowHint(true);
  }

  function ListHeader() {
    return (
      <>
        <PageTitle className="mb-4 px-5" />

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

        <FormControlLabel className="mx-5">
          <FormControlLabelText>Addresses</FormControlLabelText>
        </FormControlLabel>

        <Box className="mx-5 pb-2">
          <HintAlert
            visible={showHint}
            message="You can add more addresses."
            onClose={handleHintClose}
          />
        </Box>
      </>
    );
  }

  function ListFooter() {
    return (
      <Button size="sm" variant="outline" action="positive" onPress={handleAdd}>
        <ButtonIcon size="md" as={PlusIcon} />
        <ButtonText>Add New Address</ButtonText>
      </Button>
    );
  }

  return (
    <FormControl className="flex-1">
      <AddressList
        data={addresses}
        gap={12}
        allowEdit
        allowDelete
        showMap
        itemVariant="card"
        disableRemove={addresses.length === 1}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        ListHeaderComponentStyle={{ marginBottom: 8, gap: 8 }}
        ListFooterComponentStyle={{ marginTop: 8 }}
      />
    </FormControl>
  );
}
