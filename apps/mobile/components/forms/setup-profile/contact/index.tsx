import { Card } from '@/components/ui/card';
import { VStack } from '@/components/ui/vstack';

import { FormField } from '@/components/FormField';
import { HintAlert } from '@/components/HintAlert';
import { AddressList } from '@/components/lists';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { FormControl, FormControlLabel, FormControlLabelText } from '@/components/ui/form-control';
import { useAuth } from '@/hooks/auth/useAuth';
import { useRouter } from 'expo-router';
import { PhoneIcon, PlusIcon } from 'lucide-react-native';
import React from 'react';

export default function ProfileContact() {
  const router = useRouter();
  const { user } = useAuth();
  const addresses = user?.addresses?.docs || [];

  function handleAdd() {
    router.push('/addresses/create');
  }

  return (
    <VStack space="xl" className="flex-1">
      <Card variant="filled" className="mx-5">
        <FormField
          name="phone"
          label="Phone Number"
          fieldType="text"
          placeholder="e.g. 09123456789"
          keyboardType="phone-pad"
          textContentType="telephoneNumber"
          autoComplete="tel-device"
          autoCapitalize="none"
          inputIcon={PhoneIcon}
        />
      </Card>

      <FormControl className="flex-1">
        <FormControlLabel className="mx-5">
          <FormControlLabelText>Addresses</FormControlLabelText>
        </FormControlLabel>

        <Box className="mx-5 pb-2">
          <HintAlert message="You can add more addresses." />
        </Box>

        <Box className="flex-1">
          <AddressList
            data={addresses}
            gap={12}
            allowEdit
            allowDelete
            showMap
            itemVariant="card"
            disableRemove={addresses.length === 1}
          />
        </Box>

        <Box className="mx-5 mt-2">
          <Button size="sm" variant="outline" action="positive" onPress={handleAdd}>
            <ButtonIcon size="md" as={PlusIcon} />
            <ButtonText>Add New Address</ButtonText>
          </Button>
        </Box>
      </FormControl>
    </VStack>
  );
}
