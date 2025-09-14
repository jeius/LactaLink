import SafeArea from '@/components/SafeArea';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { ErrorSearchParams } from '@lactalink/types';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeftIcon, HomeIcon } from 'lucide-react-native';

const ErrorPage = () => {
  const { message = 'Sorry! Something went wrong.', title = 'Unexpected Error' } =
    useLocalSearchParams<ErrorSearchParams>();
  const router = useRouter();
  const canGoBack = router.canGoBack();

  function goBack() {
    if (canGoBack) {
      router.back();
    } else {
      router.push('/');
    }
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: true, headerTitle: title }} />
      <SafeArea>
        <VStack space="lg" className="m-auto items-center">
          <Text size="xl">{message}</Text>
          <Button onPress={goBack}>
            <ButtonIcon as={canGoBack ? ChevronLeftIcon : HomeIcon} />
            <ButtonText>{canGoBack ? 'Go Back' : 'Go Home'}</ButtonText>
          </Button>
        </VStack>
      </SafeArea>
    </>
  );
};

export default ErrorPage;
