import { getPriorityColor } from '@/lib/utils/getPriorityColor';
import { PREFERRED_STORAGE_TYPES, URGENCY_LEVELS } from '@lactalink/enums';
import { RequestSchema } from '@lactalink/types';
import { formatDate } from '@lactalink/utilities';
import { CalendarDaysIcon, MilkIcon, PackageOpenIcon } from 'lucide-react-native';
import React, { ComponentProps } from 'react';
import { useTheme } from '../AppProvider/ThemeProvider';
import FastTimerIcon from '../icons/FastTimerIcon';
import { Card } from '../ui/card';
import { HStack } from '../ui/hstack';
import { Icon } from '../ui/icon';
import { Text } from '../ui/text';
import { Textarea, TextareaInput } from '../ui/textarea';
import { VStack } from '../ui/vstack';
import { DeliveryPreferenceCard } from './DeliveryPreferenceCard';

interface RequestReviewCardProps extends ComponentProps<typeof Card> {
  data: RequestSchema;
}
export function RequestReviewCard({ data, variant = 'filled', ...props }: RequestReviewCardProps) {
  const { theme } = useTheme();

  const {
    volumeNeeded,
    deliveryPreferences,
    details: { neededAt, storagePreference, urgency, reason, notes },
  } = data;

  return (
    <Card {...props} variant={variant}>
      <VStack space="sm" className="w-full">
        <HStack space="xs" className="w-full items-center">
          <Text size="sm">Storage Type:</Text>
          <Icon as={PackageOpenIcon} />
          <Text size="sm" className="font-JakartaMedium">
            {PREFERRED_STORAGE_TYPES[storagePreference].label}
          </Text>
        </HStack>

        <HStack space="xs" className="w-full items-center">
          <Text size="sm">Urgency:</Text>
          <Icon as={FastTimerIcon} fill={getPriorityColor(theme, urgency).toString()} />
          <Text
            size="sm"
            className="font-JakartaMedium"
            style={{ color: getPriorityColor(theme, urgency) }}
          >
            {URGENCY_LEVELS[urgency].label}
          </Text>
        </HStack>

        <HStack space="xs" className="w-full items-center">
          <Text size="sm">Needed At:</Text>
          <Icon as={CalendarDaysIcon} />
          <Text size="sm" className="font-JakartaMedium">
            {formatDate(neededAt)},{' '}
            {new Date(neededAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </HStack>

        <HStack space="xs" className="w-full items-center">
          <Text size="sm">Volume Needed:</Text>
          <Icon as={MilkIcon} />
          <Text size="sm" className="font-JakartaMedium">
            {volumeNeeded} mL
          </Text>
        </HStack>

        <VStack space="xs" className="w-full">
          <Text size="sm">Reason:</Text>
          <Textarea size="sm" rounded="lg" pointerEvents="none">
            <TextareaInput
              defaultValue={reason}
              editable={false}
              style={{ textAlignVertical: 'top', fontSize: 14 }}
              placeholder="No reason specified."
            />
          </Textarea>
        </VStack>

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
