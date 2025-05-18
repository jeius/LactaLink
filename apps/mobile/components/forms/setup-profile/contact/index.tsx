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
import { Controller, useFormContext } from 'react-hook-form';
import Addresses from './address';

export default function ProfileContact() {
  const {
    formState: { errors },
    control,
  } = useFormContext<SetupProfileSchema>();

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
              <Input isDisabled={field.disabled} className="pl-3">
                <InputIcon as={PhoneIcon} className="text-primary-500" />
                <InputField
                  placeholder="e.g. 09123456789"
                  keyboardType="number-pad"
                  textContentType="telephoneNumber"
                  autoComplete="tel-device"
                  autoCapitalize="none"
                  value={field.value || ''}
                  onBlur={field.onBlur}
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

      <Addresses />
    </VStack>
  );
}
