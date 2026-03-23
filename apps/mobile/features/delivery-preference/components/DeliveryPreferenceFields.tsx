import ButtonGroupField from '@/components/form-fields/ButtonGroupField';
import { TextInputField } from '@/components/form-fields/TextInputField';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { VStack, VStackProps } from '@/components/ui/vstack';
import { DAYS, DELIVERY_OPTIONS } from '@lactalink/enums';
import { DeliveryPreferenceSchema } from '@lactalink/form-schemas';
import { CalendarDaysIcon, TagIcon, TruckIcon } from 'lucide-react-native';
import React from 'react';
import { Control } from 'react-hook-form';
import { DPAddressField } from './DPAddressField';

interface DPEditFieldsProps extends VStackProps {
  control: Control<DeliveryPreferenceSchema>;
  isLoading?: boolean;
}

export default function DeliveryPreferenceFields({
  control,
  isLoading,
  ...props
}: DPEditFieldsProps) {
  return (
    <VStack {...props}>
      <ButtonGroupField
        control={control}
        name="preferredMode"
        items={Object.values(DELIVERY_OPTIONS)}
        transformItem={(item) => item}
        labelIcon={TruckIcon}
        label="Preferred Delivery Modes"
        helperText="You can select multiple mode of delivery."
        allowMultipleSelection
        buttonGroupProps={{ className: 'gap-2' }}
      />

      <ButtonGroupField
        control={control}
        name="availableDays"
        items={Object.values(DAYS)}
        transformItem={(item) => item}
        labelIcon={CalendarDaysIcon}
        label="Available Days"
        helperText="You can select multiple days for delivery."
        allowMultipleSelection
        buttonGroupProps={{ className: 'gap-2' }}
      />

      <DPAddressField control={control} isLoading={isLoading} label="Preferred Address" />

      <VStack>
        <Text className="mb-1 font-JakartaMedium">Name</Text>
        <Card>
          <TextInputField
            control={control}
            name="name"
            labelIcon={TagIcon}
            contentPosition="first"
            helperText="Give a name to your delivery preference."
            inputProps={{
              placeholder: 'e.g. Home Delivery, Office Delivery',
              keyboardType: 'default',
              autoCapitalize: 'words',
              variant: 'underlined',
              className: 'font-JakartaMedium',
            }}
          />
        </Card>
      </VStack>
    </VStack>
  );
}
