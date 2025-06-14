import { FormField } from '@/components/FormField';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useAuth } from '@/hooks/auth/useAuth';
import { DAYS, DELIVERY_OPTIONS } from '@lactalink/types';
import { CalendarDaysIcon, MapPinIcon, TruckIcon } from 'lucide-react-native';
import React from 'react';

export function DeliveryDetailsForm() {
  const { user } = useAuth();
  return (
    <VStack space="lg" className="m-5">
      <Text size="lg" className="font-JakartaSemiBold">
        Delivery Details
      </Text>
      <Card className="max-w-sm">
        <FormField
          name="deliveryDetails.prefferedModes"
          fieldType="button-group"
          options={Object.values(DELIVERY_OPTIONS)}
          labelIcon={TruckIcon}
          label="Preferred Delivery Modes"
          helperText="You can select multiple delivery modes."
          containerClassName="gap-2"
          allowMultipleSelection
        />
      </Card>
      <Card className="max-w-sm">
        <FormField
          name="deliveryDetails.availableDays"
          fieldType="button-group"
          label="Available Days"
          helperText="You can select multiple days for delivery."
          labelIcon={CalendarDaysIcon}
          options={Object.values(DAYS)}
          containerClassName="gap-2"
          allowMultipleSelection
        />
      </Card>
      <Card className="max-w-sm">
        <FormField
          name="deliveryDetails.address"
          fieldType="combobox"
          label="Preferred Address"
          helperText="Select your preffered address for delivery."
          labelIcon={MapPinIcon}
          containerClassName="gap-2"
          collection="addresses"
          where={{ owner: { equals: user?.id } }}
          searchPath="displayName"
          labelPath="name"
          descriptionPath="displayName"
        />
      </Card>
    </VStack>
  );
}
