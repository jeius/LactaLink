import { SetupProfileSchema } from '@lactalink/form-schemas';
import React from 'react';
import { Control } from 'react-hook-form';
import { Text, View } from 'react-native';

export default function ContactForm({ control }: { control: Control<SetupProfileSchema> }) {
  return (
    <View>
      <Text>ContactForm</Text>
    </View>
  );
}
