import { ImageField } from '@/components/form-fields/ImageField';
import { SelectInputField } from '@/components/form-fields/SelectInputField';
import { TextAreaField } from '@/components/form-fields/TextAreaField';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack, VStackProps } from '@/components/ui/vstack';
import { COLLECTION_MODES, STORAGE_TYPES } from '@lactalink/enums';
import { DonationCreateSchema } from '@lactalink/form-schemas';
import { ClipboardPenIcon } from 'lucide-react-native';
import React from 'react';
import { Control } from 'react-hook-form';

interface DonationDetailsFieldsProps extends VStackProps {
  control: Control<DonationCreateSchema>;
  disableFields?: boolean;
}

export default function DonationDetailsFields({
  control,
  disableFields,
  space = '2xl',
  ...props
}: DonationDetailsFieldsProps) {
  return (
    <VStack {...props} space={space}>
      <VStack space="lg">
        <HStack space="md" className="items-center">
          <Text size="lg" className="flex-1 font-JakartaSemiBold">
            Milk Details
          </Text>
          <Icon as={ClipboardPenIcon} />
        </HStack>

        <SelectInputField
          control={control}
          name="details.storageType"
          label="How are you storing/preserving the milk?"
          triggerInputProps={{ placeholder: 'Select storage type' }}
          items={Object.values(STORAGE_TYPES)}
          transformItem={(item) => item}
          isDisabled={disableFields}
        />

        <SelectInputField
          control={control}
          name="details.collectionMode"
          label="How did you collect the milk?"
          triggerInputProps={{ placeholder: 'Select collection method' }}
          items={Object.values(COLLECTION_MODES)}
          transformItem={(item) => item}
          isDisabled={disableFields}
        />
      </VStack>

      <TextAreaField
        control={control}
        name="details.notes"
        label="Additional Notes"
        helperText="This information will be shared with the recipient."
        isDisabled={disableFields}
        textareaProps={{
          placeholder:
            'Any additional information about the milk, such as health conditions, medications, etc.',
        }}
      />

      <ImageField
        control={control}
        name="details.image"
        label="Cover Image"
        helperText="Upload a cover image to feature your donation."
        isDisabled={disableFields}
        options={{ allowsMultipleSelection: false }}
      />
    </VStack>
  );
}
