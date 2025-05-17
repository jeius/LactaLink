import { Card } from '@/components/ui/card';
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from '@/components/ui/form-control';
import { VStack } from '@/components/ui/vstack';

import { Input, InputField, InputIcon } from '@/components/ui/input';
import { SetupProfileSchema } from '@lactalink/types';
import { AlertCircleIcon, PhoneIcon } from 'lucide-react-native';
import React from 'react';
import { Controller, UseFormReturn } from 'react-hook-form';
import AddressForm from './address';

export default function ProfileContact({ form }: { form: UseFormReturn<SetupProfileSchema> }) {
  const {
    formState: { errors },
    control,
  } = form;
  return (
    <VStack space="xl">
      <Card>
        <FormControl isInvalid={!!errors['phone']}>
          <FormControlLabel>
            <FormControlLabelText>Phone</FormControlLabelText>
          </FormControlLabel>
          <Controller
            control={control}
            name="phone"
            render={({ field }) => (
              <Input className="pl-3">
                <InputIcon as={PhoneIcon} className="text-primary-500" />
                <InputField
                  {...field}
                  placeholder="e.g. 09123456789"
                  keyboardType="number-pad"
                  textContentType="telephoneNumber"
                  autoComplete="tel-device"
                  autoCapitalize="none"
                  onChangeText={field.onChange}
                />
              </Input>
            )}
          />
          <FormControlError>
            <FormControlErrorIcon as={AlertCircleIcon} />
            <FormControlErrorText>{errors.phone?.message}</FormControlErrorText>
          </FormControlError>
        </FormControl>
      </Card>

      <AddressForm form={form} />
    </VStack>
  );
}
