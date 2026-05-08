import { Form } from '@/components/contexts/FormProvider';
import LoadingSpinner from '@/components/loaders/LoadingSpinner';
import { Button, ButtonText } from '@/components/ui/button';
import { useEditDonationForm } from '@/features/donation&request/hooks/useEditDonationForm';
import { useScreenOptions } from '@/hooks/useScreenOptions';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useFormState } from 'react-hook-form';

export default function EditDonationLayout() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const screenOptions = useScreenOptions();

  const methods = useEditDonationForm(id);
  const { control, isLoading, reset } = methods;
  const { isDirty, isSubmitting } = useFormState({ control });
  const disableFields = isSubmitting;

  if (isLoading) return <LoadingSpinner />;

  return (
    <Form {...methods}>
      <Stack initialRouteName="index" screenOptions={screenOptions}>
        <Stack.Screen
          name="index"
          options={{
            headerShown: true,
            headerTitle: 'Edit Donation',
            headerRight: () =>
              isDirty && (
                <Button disablePressAnimation onPress={reset}>
                  <ButtonText>Reset</ButtonText>
                </Button>
              ),
          }}
        />
        <Stack.Screen
          name="milkbag-verification"
          options={{ headerShown: true, headerTitle: 'Milkbag Verification' }}
        />
      </Stack>
    </Form>
  );
}
