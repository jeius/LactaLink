import { Image } from '@/components/Image';
import SafeArea from '@/components/SafeArea';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { getImageAsset } from '@/lib/stores';
import { Stack, useRouter } from 'expo-router';
import { ChevronLeftIcon, HomeIcon } from 'lucide-react-native';

export default function NotFoundScreen() {
  const router = useRouter();
  const canGoBack = router.canGoBack();

  function goBack() {
    if (canGoBack) {
      router.back();
    } else {
      router.push('/feed');
    }
  }
  return (
    <>
      <Stack.Screen options={{ headerShown: true, headerTitle: 'Page Not Found' }} />
      <SafeArea safeTop={false}>
        <VStack space="lg" className="mx-auto flex-1 items-center justify-center p-4">
          <Image
            alt="Nothing found"
            source={getImageAsset('error404')}
            contentFit="contain"
            style={{ width: '75%', aspectRatio: 1 }}
          />
          <Text size="lg" className="font-semibold">
            Oops! Looks like you are lost.
          </Text>
          <Button onPress={goBack}>
            <ButtonIcon as={canGoBack ? ChevronLeftIcon : HomeIcon} />
            <ButtonText>{canGoBack ? 'Go Back' : 'Go Home'}</ButtonText>
          </Button>
        </VStack>
      </SafeArea>
    </>
  );
}
