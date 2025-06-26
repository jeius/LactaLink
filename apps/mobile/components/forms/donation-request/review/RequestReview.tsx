import { Image } from '@/components/Image';
import { Card } from '@/components/ui/card';
import { Divider } from '@/components/ui/divider';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { Textarea, TextareaInput } from '@/components/ui/textarea';
import { VStack } from '@/components/ui/vstack';
import { useFetchBySlug } from '@/hooks/collections/useFetchBySlug';

import { DAYS, DELIVERY_OPTIONS, PRIORITY_LEVELS, STORAGE_TYPES } from '@/lib/constants';
import { tva } from '@gluestack-ui/nativewind-utils/tva';

import { CreateRequestSchema } from '@lactalink/types';
import { formatDate } from '@lactalink/utilities';
import { MapPinIcon, MilkIcon, TruckIcon } from 'lucide-react-native';
import { Fragment, useMemo } from 'react';

import { useFormContext } from 'react-hook-form';

const urgencyStyle = tva({
  base: 'font-JakartaMedium',
  variants: {
    urgency: {
      LOW: 'text-success-500',
      MEDIUM: 'text-info-500',
      HIGH: 'text-warning-500',
      CRITICAL: 'text-error-500',
    },
  },
});

export function RequestReview() {
  const { getValues } = useFormContext<CreateRequestSchema>();
  const {
    volumeNeeded,
    details: { storagePreference, neededAt, urgency, notes, image, reason },
    deliveryDetails: formDeliveryDetails,
  } = getValues();

  const { data: addressDocs, isLoading } = useFetchBySlug(true, {
    collection: 'addresses',
    where: { id: { in: formDeliveryDetails.map((e) => e.address) } },
    depth: 0,
  });

  const deliveryDetails = useMemo(() => {
    return formDeliveryDetails.map((detail) => {
      const { availableDays, preferredMode, address: addressId } = detail;
      const address = addressDocs?.find((address) => address.id === addressId);

      const days = availableDays.map((day) => DAYS[day].label).join(', ');
      const deliveryMode = preferredMode.map((mode) => DELIVERY_OPTIONS[mode].label).join(', ');

      return {
        deliveryMode,
        addressName: address?.name || 'Not specified',
        address: address?.displayName || 'Not specified',
        availableDays: days,
      };
    });
  }, [formDeliveryDetails, addressDocs]);

  return (
    <VStack space="lg" className="p-5">
      <VStack>
        <Text size="lg" className="font-JakartaSemiBold mb-1">
          Review Your Request
        </Text>
        <Text>Please review the details of your request before submitting.</Text>
      </VStack>

      <Card>
        <HStack space="md" className="justify-between">
          <Text className="font-JakartaSemiBold pb-3">Milk Details</Text>
          <Icon as={MilkIcon} size="xl" className="text-primary-500" />
        </HStack>

        <VStack space="md">
          <Text>
            Preferred Storage:{' '}
            <Text className="font-JakartaMedium">
              {storagePreference === 'EITHER' ? 'Either' : STORAGE_TYPES[storagePreference].label}
            </Text>
          </Text>

          <Text>
            Urgency:{' '}
            <Text className={urgencyStyle({ urgency })}>{PRIORITY_LEVELS[urgency].label}</Text>
          </Text>

          <Text>
            Needed At:{' '}
            <Text className="font-JakartaMedium">
              {formatDate(neededAt)}-
              {new Date(neededAt).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </Text>

          <Text>
            Volume Needed: <Text className="font-JakartaMedium">{volumeNeeded}mL</Text>
          </Text>

          {image ? (
            <VStack space="sm">
              <Text>Image:</Text>

              <Card size="lg" variant="outline" className="h-24 w-20 p-0">
                <Image
                  alt={image.alt}
                  contentFit="cover"
                  source={{ uri: image.url }}
                  style={{
                    width: '100%',
                    height: '100%',
                  }}
                />
              </Card>
            </VStack>
          ) : (
            <Text>
              Image: <Text className="font-JakartaMedium">None</Text>
            </Text>
          )}

          <VStack space="sm">
            <Text>Reason:</Text>
            <Textarea pointerEvents="none">
              <TextareaInput
                defaultValue={reason}
                editable={false}
                style={{ textAlignVertical: 'top' }}
              />
            </Textarea>
          </VStack>

          <VStack space="sm">
            <Text>Note:</Text>
            <Textarea pointerEvents="none">
              <TextareaInput
                defaultValue={notes}
                editable={false}
                style={{ textAlignVertical: 'top' }}
              />
            </Textarea>
          </VStack>
        </VStack>
      </Card>

      <Card>
        <HStack space="md" className="justify-between">
          <Text className="font-JakartaSemiBold pb-3">
            Delivery Preference{deliveryDetails.length > 1 ? 's' : null}
          </Text>
          <Icon as={TruckIcon} size="xl" className="text-primary-500" />
        </HStack>

        <VStack space="lg">
          {deliveryDetails.map((detail, index) => {
            const { address, addressName, availableDays, deliveryMode } = detail;
            return (
              <Fragment key={index}>
                <VStack key={index} space="sm">
                  <Text>
                    Delivery Mode: <Text className="font-JakartaMedium">{deliveryMode}</Text>
                  </Text>
                  <Text>
                    Available Days: <Text className="font-JakartaMedium">{availableDays}</Text>
                  </Text>
                  <VStack>
                    <Text>
                      Address:{' '}
                      {isLoading ? (
                        <Skeleton variant="rounded" speed={4} className="h-4 w-16" />
                      ) : (
                        <Text className="font-JakartaMedium">{addressName}</Text>
                      )}
                    </Text>

                    {isLoading ? (
                      <Skeleton variant="rounded" speed={4} className="h-5" />
                    ) : (
                      <HStack space="xs" className="items-center">
                        <Icon as={MapPinIcon} size="sm" className="text-primary-500" />
                        <Text className="font-JakartaMedium">{address}</Text>
                      </HStack>
                    )}
                  </VStack>
                </VStack>
                {index < deliveryDetails.length - 1 && <Divider orientation="horizontal" />}
              </Fragment>
            );
          })}
        </VStack>
      </Card>
    </VStack>
  );
}
