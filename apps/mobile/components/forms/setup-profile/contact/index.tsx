import { Card } from '@/components/ui/card';
import { VStack } from '@/components/ui/vstack';

import { FormField } from '@/components/FormField';
import { HintAlert } from '@/components/HintAlert';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { AddressSchema, SetupProfileSchema } from '@lactalink/types';
import { PhoneIcon } from 'lucide-react-native';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import AddressesCard from './address';

export default function ProfileContact() {
  const form = useFormContext<SetupProfileSchema>();

  const addresses = form.watch('addresses') || [];
  function handleAddressChange(value: AddressSchema[]) {
    const addressIDs = value.map((address) => address.id).filter(Boolean) as string[];
    form.setValue('addresses', addressIDs);
  }

  return (
    <VStack space="xl" className="flex-1">
      <Card className="mx-5">
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

      <VStack className="flex-1 px-5">
        <Text size="lg" className="font-JakartaMedium">
          Addresses
        </Text>

        <Box className="py-2">
          <HintAlert message="You can add more addresses." />
        </Box>

        <AddressesCard
          variant="ghost"
          className="flex-1 p-0"
          disableRemove={addresses.length === 1}
          onChange={handleAddressChange}
        />
      </VStack>
    </VStack>
  );
}
