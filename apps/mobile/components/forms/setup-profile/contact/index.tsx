import { Card } from '@/components/ui/card';
import { VStack } from '@/components/ui/vstack';

import { FormField } from '@/components/FormField';
import { PhoneIcon } from 'lucide-react-native';
import React from 'react';
import Addresses from './address';

export default function ProfileContact() {
  return (
    <VStack space="xl">
      <Card>
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

      <Addresses />
    </VStack>
  );
}
