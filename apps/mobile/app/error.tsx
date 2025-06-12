import SafeArea from '@/components/SafeArea';
import { Button, ButtonText } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { ErrorSearchParams } from '@lactalink/types';
import { useLocalSearchParams, useRouter } from 'expo-router';

const ErrorPage = () => {
  const { message } = useLocalSearchParams<ErrorSearchParams>();
  const router = useRouter();

  const goBack = () => {
    router.dismiss();
  };

  return (
    <SafeArea>
      <VStack space="lg" className="m-auto items-center">
        <Text size="xl">{message}</Text>
        <Button onPress={goBack}>
          <ButtonText>Go Back</ButtonText>
        </Button>
      </VStack>
    </SafeArea>
  );
};

export default ErrorPage;
