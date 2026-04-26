import { Image } from '@/components/Image';
import SafeArea from '@/components/SafeArea';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Divider } from '@/components/ui/divider';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import ScrollView from '@/components/ui/ScrollView';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { getImageAsset } from '@/lib/stores';
import { useRouter } from 'expo-router';
import { ArrowRightIcon, BellIcon, ClipboardCheckIcon, ClockIcon } from 'lucide-react-native';

export default function SubmissionThankYou() {
  const router = useRouter();

  function handleDone() {
    router.dismissTo('/account');
  }

  return (
    <SafeArea mode="margin" className="items-stretch justify-start p-5">
      <ScrollView contentContainerClassName="gap-4">
        <Image
          source={getImageAsset('emailReceived')}
          contentFit="contain"
          className="aspect-square w-full"
        />

        <VStack space="sm" className="items-center">
          <Heading size="xl" className="text-center font-JakartaBold">
            Submission Received!
          </Heading>
          <Text className="text-center font-JakartaMedium text-typography-500">
            We&apos;ve received your donor screening submission and it will be reviewed by our team
            shortly.
          </Text>
        </VStack>

        <Card className="p-4">
          <Text
            size="sm"
            className="mb-2 font-JakartaSemiBold uppercase tracking-wider text-typography-400"
          >
            What to expect
          </Text>

          <VStack space="sm">
            <HStack space="md" className="items-center">
              <Box className="rounded-full bg-primary-50 p-2">
                <Icon as={ClipboardCheckIcon} size="sm" className="text-primary-500" />
              </Box>
              <Text size="sm" className="flex-1 font-JakartaMedium">
                Your submission is currently under review
              </Text>
            </HStack>

            <Divider />

            <HStack space="md" className="items-center">
              <Box className="rounded-full bg-primary-50 p-2">
                <Icon as={ClockIcon} size="sm" className="text-primary-500" />
              </Box>
              <Text size="sm" className="flex-1 font-JakartaMedium">
                Reviews typically take 1–3 business days
              </Text>
            </HStack>

            <Divider />

            <HStack space="md" className="items-center">
              <Box className="rounded-full bg-primary-50 p-2">
                <Icon as={BellIcon} size="sm" className="text-primary-500" />
              </Box>
              <Text size="sm" className="flex-1 font-JakartaMedium">
                You&apos;ll be notified once a decision is made
              </Text>
            </HStack>
          </VStack>
        </Card>
      </ScrollView>

      <Button size="lg" onPress={handleDone} className="mt-4">
        <ButtonText>Back to Home</ButtonText>
        <ButtonIcon as={ArrowRightIcon} />
      </Button>
    </SafeArea>
  );
}
