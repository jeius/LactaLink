import { Form } from '@/components/contexts/FormProvider';
import { useAddressForm } from '@/features/address/hooks/useAddressForm';
import { getColor } from '@/lib/colors';
import { Stack } from 'expo-router';
import React, { useMemo } from 'react';
import { useWindowDimensions } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Layout() {
  const insets = useSafeAreaInsets();
  const screen = useWindowDimensions();

  const detents = useMemo(() => {
    const height = screen.height - insets.top;
    return [height / screen.height];
  }, [screen.height, insets.top]);

  const methods = useAddressForm();

  return (
    <Form {...methods}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="details"
          options={{
            presentation: 'formSheet',
            contentStyle: { backgroundColor: getColor('background', '0') },
            sheetAllowedDetents: detents,
            sheetCornerRadius: 24,
          }}
        />
      </Stack>
    </Form>
  );
}
