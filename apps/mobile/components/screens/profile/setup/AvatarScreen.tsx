import { AvatarUpload } from '@/components/AvatarUpload';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { SetupProfileSchema } from '@lactalink/form-schemas';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

export default function ProfileAvatarScreen() {
  const { control, getValues } = useFormContext<SetupProfileSchema>();

  const name = getValues('name')
    ?.trim()
    .replace(/[^a-zA-Z0-9]+/g, '_');
  const givenName = getValues('givenName')?.trim();
  const familyName = getValues('familyName')?.trim();
  const profileType = getValues('profileType')?.trim();

  const filename: Record<string, string | undefined> = {
    INDIVIDUAL: givenName && familyName && `${givenName}_${familyName}`,
    MILK_BANK: name,
    HOSPITAL: name,
  };

  return (
    <Card className="m-5 self-center">
      <VStack space="xl">
        <VStack space="sm">
          <Text size="lg" className="font-JakartaMedium">
            Upload Your Avatar
          </Text>
          <Text className="text-typography-800">
            This will make it easier for others to recognize you within the platform. You can skip
            this part and change this anytime.
          </Text>
        </VStack>

        <Controller
          control={control}
          name="avatar"
          render={({ field }) => (
            <AvatarUpload
              value={field.value}
              onChange={field.onChange}
              filename={filename[profileType]?.toLowerCase()}
            />
          )}
        />
      </VStack>
    </Card>
  );
}
