import { OptionsSelectField } from '@/components/form-fields/OptionsSelectField';
import { TextAreaField } from '@/components/form-fields/TextAreaField';
import { TextInputField } from '@/components/form-fields/TextInputField';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { EditProfileSchema } from '@lactalink/form-schemas';
import { Building2Icon, MailIcon, MapPinIcon, PhoneIcon, User2Icon } from 'lucide-react-native';
import React from 'react';
import { Control } from 'react-hook-form';
import { buildingTypeOptions } from '../../lib/options';

interface Props {
  control: Control<EditProfileSchema>;
  email?: string;
  address?: string;
}

export default function MilkBankEditForm({ control, email, address }: Props) {
  return (
    <>
      <VStack space="lg" className="px-5">
        <TextInputField
          control={control}
          name="name"
          label="Milk Bank Name"
          contentPosition="first"
          inputProps={{
            placeholder: 'Enter your hospital name',
            autoCapitalize: 'words',
            textContentType: 'organizationName',
            autoCorrect: true,
            icon: Building2Icon,
          }}
        />

        <TextInputField
          control={control}
          name="head"
          label="Contact Person"
          helperText="Enter the milk bank contact person."
          contentPosition="first"
          inputProps={{
            placeholder: 'e.g. John M. Doe',
            autoCapitalize: 'words',
            autoComplete: 'name',
            textContentType: 'name',
            icon: User2Icon,
          }}
        />

        <ReadOnlyField label="Email Address" value={email || 'No email'} icon={MailIcon} />

        <TextInputField
          control={control}
          name="phone"
          label="Phone Number"
          inputProps={{
            placeholder: 'e.g. 09123456789',
            keyboardType: 'phone-pad',
            textContentType: 'telephoneNumber',
            autoComplete: 'tel-device',
            autoCapitalize: 'none',
            icon: PhoneIcon,
          }}
        />

        <ReadOnlyField label="Address" value={address || 'No address'} icon={MapPinIcon} />

        <TextAreaField control={control} name="description" label="About Us" contentPosition="first" textareaProps={{ placeholder: 'Tell us about your milk bank...' }} />
      </VStack>

      <OptionsSelectField
        control={control}
        name="type"
        label="Is your milk bank?"
        items={buildingTypeOptions}
        listProps={{ contentContainerClassName: 'px-5' }}
        labelClassName="px-5"
      />
    </>
  );
}

function ReadOnlyField({ label, value, icon: FieldIcon }: { label: string; value: string; icon: typeof MailIcon }) {
  return <VStack space="xs"><Text className="font-JakartaMedium text-typography-800">{label}</Text><HStack space="sm" className="min-h-12 items-center rounded-xl border border-outline-300 bg-background-50 px-3 py-2"><Icon as={FieldIcon} className="text-typography-500" /><Text className="flex-1 text-typography-600">{value}</Text></HStack></VStack>;
}
