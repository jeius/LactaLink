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

import { COLLECTION_MODES, DAYS, DELIVERY_OPTIONS, STORAGE_TYPES } from '@/lib/constants';

import { DonationSchema } from '@lactalink/types';
import { formatDate } from '@lactalink/utilities';
import { DotIcon, MapPinIcon, MilkIcon, TruckIcon } from 'lucide-react-native';
import { Fragment, useMemo } from 'react';

import { useFormContext } from 'react-hook-form';

export function DonationReview() {
  const { getValues } = useFormContext<DonationSchema>();
  const {
    details: { storageType, collectionMode, bags, notes, milkSample },
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
          Review Your Donation
        </Text>
        <Text>Please review the details of your donation before submitting.</Text>
      </VStack>

      <Card>
        <HStack space="md" className="justify-between">
          <Text className="font-JakartaSemiBold pb-3">Milk Details</Text>
          <Icon as={MilkIcon} size="xl" className="text-primary-500" />
        </HStack>

        <VStack space="md">
          <Text>
            Storage Type:{' '}
            <Text className="font-JakartaMedium">{STORAGE_TYPES[storageType].label}</Text>
          </Text>
          <Text>
            Collection Method:{' '}
            <Text className="font-JakartaMedium">{COLLECTION_MODES[collectionMode].label}</Text>
          </Text>

          {bags.length > 0 && (
            <VStack space="sm">
              <Text>Milk Bag{bags.length > 1 ? 's' : null}:</Text>
              {bags.map((bag, index) => (
                <HStack key={index} className="items-center">
                  <Icon as={DotIcon} />
                  <Text className="font-JakartaMedium">
                    {bag.quantity} x {bag.volume}mL @ {formatDate(bag.collectedAt)}-{' '}
                    {new Date(bag.collectedAt).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </HStack>
              ))}
            </VStack>
          )}

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

          {milkSample ? (
            <VStack space="sm">
              <Text>Milk Sample{milkSample.length > 1 ? 's' : null}:</Text>

              <HStack space="md" className="flex-wrap items-center">
                {milkSample.map((image, index) => (
                  <Card key={index} size="lg" variant="outline" className="h-24 w-20 p-0">
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
                ))}
              </HStack>
            </VStack>
          ) : (
            <Text>
              Milk Sample: <Text className="font-JakartaMedium">None</Text>
            </Text>
          )}
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
                      <Text>
                        <HStack space="xs">
                          <Icon as={MapPinIcon} size="sm" className="text-primary-500 mt-1" />
                          <Text className="font-JakartaMedium">{address}</Text>
                        </HStack>
                      </Text>
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
