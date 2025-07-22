import { Card } from '@/components/ui/card';
import { VStack } from '@/components/ui/vstack';

import { FormField } from '@/components/FormField';
import { HintAlert } from '@/components/HintAlert';
import { AddressList } from '@/components/lists';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from '@/components/ui/form-control';
import { Address, SetupProfileSchema } from '@lactalink/types';
import { extractID } from '@lactalink/utilities';
import { useRouter } from 'expo-router';
import { AlertCircleIcon, PhoneIcon, PlusIcon } from 'lucide-react-native';
import React from 'react';
import { useFormContext } from 'react-hook-form';

export default function ProfileContact() {
  const form = useFormContext<SetupProfileSchema>();
  const router = useRouter();

  const addresses = form.watch('addresses') || [];
  const { error } = form.getFieldState('addresses');

  function handleAddressChange(value: Address[]) {
    form.setValue('addresses', extractID(value), { shouldValidate: false, shouldDirty: true });
  }

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

      <FormControl isInvalid={Boolean(error)} className="flex-1">
        <FormControlLabel className="mx-5">
          <FormControlLabelText>Addresses</FormControlLabelText>
        </FormControlLabel>

        <Box className="mx-5 pb-2">
          <HintAlert message="You can add more addresses." />
        </Box>

        <FormControlError className="mx-5">
          <FormControlErrorIcon as={AlertCircleIcon} />
          <FormControlErrorText>{error?.message}</FormControlErrorText>
        </FormControlError>

        <Box className="flex-1">
          <AddressList
            addresses={addresses}
            allowEdit
            allowDelete
            itemVariant="card"
            disableRemove={addresses.length === 1}
            onChange={handleAddressChange}
          />
        </Box>

        <Box className="mx-5 mt-2">
          <Button variant="outline" action="positive" onPress={handleAdd}>
            <ButtonIcon size="md" as={PlusIcon} />
            <ButtonText>Add New Address</ButtonText>
          </Button>
        </Box>
      </FormControl>
    </VStack>
  );
}
