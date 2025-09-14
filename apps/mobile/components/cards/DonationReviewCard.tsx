import { getHexColor } from '@/lib/colors';
import { COLLECTION_MODES, PREFERRED_STORAGE_TYPES } from '@lactalink/enums';
import { DonationSchema } from '@lactalink/form-schemas';
import { formatDate } from '@lactalink/utilities/formatters';
import { DotIcon, DropletIcon, PackageIcon } from 'lucide-react-native';
import React, { ComponentProps } from 'react';
import { useTheme } from '../AppProvider/ThemeProvider';
import { Card } from '../ui/card';
import { HStack } from '../ui/hstack';
import { Icon } from '../ui/icon';
import { Text } from '../ui/text';
import { Textarea, TextareaInput } from '../ui/textarea';
import { VStack } from '../ui/vstack';
import { DeliveryPreferenceCard } from './DeliveryPreferenceCard';

interface DonationReviewCardProps extends ComponentProps<typeof Card> {
  data: DonationSchema;
}
export function DonationReviewCard({
  data,
  variant = 'filled',
  ...props
}: DonationReviewCardProps) {
  const { theme } = useTheme();

  const fillColor = getHexColor(theme, 'primary', 50)?.toString();
  const strokeColor = getHexColor(theme, 'primary', 700)?.toString();

  const {
    deliveryPreferences,
    details: { bags, collectionMode, storageType, notes },
  } = data;

  return (
    <Card {...props} variant={variant}>
      <VStack space="sm" className="w-full">
        <HStack space="xs" className="w-full items-center">
          <Text size="sm">Storage Type:</Text>
          <Icon as={PackageIcon} fill={fillColor} stroke={strokeColor} />
          <Text size="sm" className="font-JakartaMedium">
            {PREFERRED_STORAGE_TYPES[storageType].label}
          </Text>
        </HStack>

        <HStack space="xs" className="w-full items-center">
          <Text size="sm">Collection Method:</Text>
          <Icon as={DropletIcon} fill={fillColor} stroke={strokeColor} />
          <Text size="sm" className="font-JakartaMedium">
            {COLLECTION_MODES[collectionMode].label}
          </Text>
        </HStack>

        {bags.length > 0 && (
          <VStack space="xs">
            <Text size="sm">Milk Bag{bags.length > 1 ? 's' : null}:</Text>
            {bags.map((bag, index) => (
              <HStack key={index} className="items-center">
                <Icon as={DotIcon} />
                <Text size="sm" className="font-JakartaMedium">
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

        <VStack space="xs" className="w-full">
          <Text size="sm">Notes:</Text>
          <Textarea size="sm" rounded="lg" pointerEvents="none">
            <TextareaInput
              defaultValue={notes}
              editable={false}
              style={{ textAlignVertical: 'top', fontSize: 14 }}
              placeholder="No notes specified."
            />
          </Textarea>
        </VStack>

        <VStack space="xs" className="w-full">
          <Text size="sm">Delivery Preferences:</Text>
          {deliveryPreferences?.map((preference, index) => (
            <DeliveryPreferenceCard
              key={index}
              variant="outline"
              size="md"
              className="rounded-lg"
              preference={preference}
            />
          ))}
        </VStack>
      </VStack>
    </Card>
  );
}
