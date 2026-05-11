import { Image } from '@/components/Image';
import SafeArea from '@/components/SafeArea';
import { Alert, AlertIcon, AlertText } from '@/components/ui/alert';
import { Badge, BadgeText } from '@/components/ui/badge';
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
import { UserProfile } from '@lactalink/types';
import { DonorScreeningForm } from '@lactalink/types/payload-generated-types';
import { extractDisplayName } from '@lactalink/utilities/extractors';
import { Href, useRouter } from 'expo-router';
import {
  BuildingIcon,
  ClipboardListIcon,
  HeartHandshakeIcon,
  HospitalIcon,
  InfoIcon,
  ShieldCheckIcon,
  StethoscopeIcon,
} from 'lucide-react-native';
import { SubmissionCreateSearchParams } from '../../lib/types';

interface Props {
  form: DonorScreeningForm;
  organization?: UserProfile | null;
}

export default function ScreeningApplicationScreen({ form, organization }: Props) {
  const router = useRouter();

  const href: Href = {
    pathname: '/donor-screening/submission/create',
    params: { formID: form.id } satisfies SubmissionCreateSearchParams,
  };

  const isHospital = organization?.relationTo === 'hospitals';
  const isMilkBank = organization?.relationTo === 'milkBanks';
  const hasOrg = isHospital || isMilkBank;

  let orgName: string | null = null;
  if (
    hasOrg &&
    organization &&
    typeof organization.value === 'object' &&
    organization.value !== null
  ) {
    orgName = extractDisplayName({ profile: organization });
  }

  return (
    <SafeArea className="items-stretch justify-start">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <VStack space="2xl" className="flex-1 px-6 py-8">
          {/* Hero */}
          <VStack space="md" className="items-center py-2">
            <Image
              alt="Donor Screening"
              source={getImageAsset('screening')}
              contentFit="contain"
              style={{ width: '100%', aspectRatio: 1.25 }}
            />
            <Heading size="2xl" className="text-center">
              Donor Screening Required
            </Heading>
            <Text size="md" className="text-center text-typography-500">
              Before you share the gift of milk, we&apos;d like to learn a little more about you.
            </Text>
          </VStack>

          {/* Organization card */}
          {hasOrg && orgName && (
            <Card variant="outline" size="md" className="rounded-2xl">
              <HStack space="md" className="mb-2 items-center">
                <Box className="rounded-xl bg-secondary-100 p-3">
                  <Icon
                    as={isHospital ? HospitalIcon : BuildingIcon}
                    className="text-secondary-600"
                    style={{ width: 22, height: 22 }}
                  />
                </Box>
                <VStack className="flex-1">
                  <Text bold className="text-typography-900">
                    {orgName}
                  </Text>
                  <Badge size="sm" action="secondary" variant="solid" className="self-start">
                    <BadgeText>{isHospital ? 'Hospital' : 'Milk Bank'}</BadgeText>
                  </Badge>
                </VStack>
              </HStack>
              <Text size="sm" className="text-typography-600">
                {isHospital
                  ? `The hospital has prepared a health screening form for all prospective donors.`
                  : `${orgName} requires all donors to complete a brief health screening before participation.`}
              </Text>
            </Card>
          )}

          {/* Why screening matters */}
          <VStack space="md">
            <Heading size="md">Why Screening Matters</Heading>
            <Divider />
            <VStack space="sm">
              <HStack space="md" className="items-start py-1">
                <Box className="shrink-0 rounded-full bg-success-100 p-2">
                  <Icon
                    as={ShieldCheckIcon}
                    className="text-success-600"
                    style={{ width: 20, height: 20 }}
                  />
                </Box>
                <VStack space="xs" className="flex-1">
                  <Text bold>Milk Quality Assurance</Text>
                  <Text size="sm" className="text-typography-600">
                    We verify that donated milk meets strict safety and nutritional standards for
                    every recipient.
                  </Text>
                </VStack>
              </HStack>

              <HStack space="md" className="items-start py-1">
                <Box className="shrink-0 rounded-full bg-error-100 p-2">
                  <Icon
                    as={HeartHandshakeIcon}
                    className="text-error-600"
                    style={{ width: 20, height: 20 }}
                  />
                </Box>
                <VStack space="xs" className="flex-1">
                  <Text bold>Recipient Safety</Text>
                  <Text size="sm" className="text-typography-600">
                    Screening helps protect the vulnerable infants who depend on donated milk.
                  </Text>
                </VStack>
              </HStack>

              <HStack space="md" className="items-start py-1">
                <Box className="shrink-0 rounded-full bg-primary-100 p-2">
                  <Icon
                    as={StethoscopeIcon}
                    className="text-primary-600"
                    style={{ width: 20, height: 20 }}
                  />
                </Box>
                <VStack space="xs" className="flex-1">
                  <Text bold>Medical Review</Text>
                  <Text size="sm" className="text-typography-600">
                    Your responses are carefully reviewed by our qualified medical team.
                  </Text>
                </VStack>
              </HStack>
            </VStack>
          </VStack>

          {/* Privacy note */}
          <Alert action="info" className="rounded-2xl">
            <AlertIcon as={InfoIcon} />
            <AlertText className="flex-1">
              Your answers are private and confidential. They will only be used to assess your
              eligibility as a donor.
            </AlertText>
          </Alert>

          {/* CTA */}
          <VStack space="sm">
            <Button size="lg" onPress={() => router.push(href)}>
              <ButtonIcon as={ClipboardListIcon} />
              <ButtonText>Apply for Screening</ButtonText>
            </Button>
            <Text size="xs" className="text-center text-typography-500">
              Takes about 10–15 minutes. You can save your progress and continue later.
            </Text>
          </VStack>
        </VStack>
      </ScrollView>
    </SafeArea>
  );
}
