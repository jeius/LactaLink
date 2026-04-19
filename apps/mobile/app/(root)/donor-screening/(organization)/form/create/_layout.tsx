import { Form } from '@/components/contexts/FormProvider';
import { HeaderBackButton } from '@/components/HeaderBackButton';
import LoadingSpinner from '@/components/loaders/LoadingSpinner';
import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { useScreeningFormQuery } from '@/features/donor-screening/hooks/queries';
import { useScreeningForm } from '@/features/donor-screening/hooks/useScreeningForm';
import { FormCreateSearchParams } from '@/features/donor-screening/lib/types';
import { useScreenFormSheetOptions, useScreenOptions } from '@/hooks/useScreenOptions';
import { Stack, useGlobalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function FormCreateLayout() {
  const screenOptions = useScreenOptions();
  const formSheetOptions = useScreenFormSheetOptions();
  const insets = useSafeAreaInsets();

  const { formID } = useGlobalSearchParams<FormCreateSearchParams>();
  const { data: form, isLoading } = useScreeningFormQuery(formID);

  const methods = useScreeningForm(form);
  const { handleSubmit } = methods;

  if (isLoading) return <LoadingSpinner />;

  return (
    <Form {...methods}>
      <Stack initialRouteName="index" screenOptions={formSheetOptions}>
        <Stack.Screen
          name="index"
          options={{
            ...screenOptions,
            headerShown: true,
            header: () => (
              <HStack
                space="md"
                className="items-center justify-between px-2 pb-2"
                style={{ paddingTop: insets.top + 4 }}
              >
                <HeaderBackButton />
                <Button className="mr-2" onPress={handleSubmit(() => {})}>
                  <ButtonText>Submit</ButtonText>
                </Button>
              </HStack>
            ),
          }}
        />
      </Stack>
    </Form>
  );
}
