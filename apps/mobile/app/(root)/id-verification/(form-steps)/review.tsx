import { useForm } from '@/components/contexts/FormProvider';
import { SingleImageViewer } from '@/components/ImageViewer';
import SafeArea from '@/components/SafeArea';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { GENDER_TYPES, ID_TYPES } from '@lactalink/enums';
import { IdentitySchema } from '@lactalink/form-schemas';
import { Gender, IDType } from '@lactalink/types';
import { extractImageData } from '@lactalink/utilities/extractors';
import { formatDate } from '@lactalink/utilities/formatters';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CameraIcon } from 'lucide-react-native';
import React from 'react';
import { ScrollView } from 'react-native-gesture-handler';

export default function IDVerificationReview() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const { trigger, getValues } = useForm<IdentitySchema>();

  const personalInfo = getValues('personalInfo');
  const idDetails = getValues('details');
  const idImage = getValues('idImage');

  async function handleNext() {
    const validations = await Promise.all([
      trigger('details'),
      trigger('idImage'),
      trigger('personalInfo'),
    ]);

    const allValid = validations.every((v) => v);

    if (allValid) {
      router.push({ pathname: '/id-verification/verify-face', params });
    }
  }

  return (
    <SafeArea safeTop={false} className="items-stretch">
      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-col grow gap-4 p-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 8 }}
      >
        <VStack space="xs">
          <Text bold size="xl">
            Review Information
          </Text>
          <Text>
            Please review the information you have provided before proceeding to face verification.
          </Text>
        </VStack>

        <VStack space="xs">
          <Text size="lg" className="font-JakartaMedium">
            Personal Information
          </Text>
          {Object.entries(personalInfo).map(([key, value]) => {
            let displayValue = value || '-';

            if (value && !isNaN(new Date(value).getTime())) {
              displayValue = formatDate(value);
            } else if (value && GENDER_TYPES[value as Gender]) {
              displayValue = GENDER_TYPES[value as Gender].label;
            }

            return (
              <HStack key={key} space="xs">
                <Text className="capitalize">{key.replace(/([A-Z])/g, ' $1')}: </Text>
                <Text className="font-JakartaMedium" numberOfLines={2}>
                  {displayValue}
                </Text>
              </HStack>
            );
          })}
        </VStack>

        <VStack space="xs">
          <Text size="lg" className="font-JakartaMedium">
            ID Document Details
          </Text>
          {Object.entries(idDetails).map(([key, value]) => {
            let displayValue = value || '-';

            if (value && !isNaN(new Date(value).getTime())) {
              displayValue = formatDate(value);
            } else if (value && ID_TYPES[value as IDType]) {
              displayValue = ID_TYPES[value as IDType].label;
            }

            return (
              <HStack key={key} space="xs">
                <Text className="capitalize">{key.replace(/([A-Z])/g, ' $1')}: </Text>
                <Text className="font-JakartaMedium" numberOfLines={2}>
                  {displayValue}
                </Text>
              </HStack>
            );
          })}
        </VStack>

        <VStack space="xs">
          <Text size="lg" className="font-JakartaMedium">
            ID Image
          </Text>
          {idImage && (
            <Box className="w-full overflow-hidden rounded-2xl" style={{ aspectRatio: 1.75 }}>
              <SingleImageViewer contentFit="cover" image={extractImageData(idImage)} />
            </Box>
          )}
        </VStack>

        <Box className="mt-4 flex-1 justify-end">
          <Button onPress={handleNext}>
            <ButtonIcon as={CameraIcon} />
            <ButtonText>Capture Face</ButtonText>
          </Button>
        </Box>
      </ScrollView>
    </SafeArea>
  );
}
