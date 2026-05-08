import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Textarea, TextareaInput } from '@/components/ui/textarea';
import { VStack, VStackProps } from '@/components/ui/vstack';
import { DELIVERY_OPTIONS, PREFERRED_STORAGE_TYPES, URGENCY_LEVELS } from '@lactalink/enums';
import { DeliveryCreateSchema, DeliveryPreferenceSchema } from '@lactalink/form-schemas';
import { RequestSchema } from '@lactalink/form-schemas/listings';
import { formatDate, formatDaysToText, formatLocaleTime } from '@lactalink/utilities/formatters';
import { DotIcon } from 'lucide-react-native';

interface RequestReviewProps extends VStackProps {
  data: Omit<RequestSchema, 'requester'> & { delivery?: DeliveryCreateSchema | null };
}
export default function RequestReview({ data, space = 'sm', ...props }: RequestReviewProps) {
  const {
    deliveryPreferences,
    details: { bags, storagePreference, neededAt, urgency, reason, notes },
    delivery,
  } = data;

  const bagsLength = bags?.length || 0;

  return (
    <VStack space={space} {...props}>
      <HStack space="xs" className="items-center">
        <Text size="sm">Preferred Storage:</Text>
        <Text size="sm" className="flex-1 font-JakartaSemiBold">
          {PREFERRED_STORAGE_TYPES[storagePreference].label}
        </Text>
      </HStack>

      <HStack space="xs" className="items-center">
        <Text size="sm">Urgency Level:</Text>
        <Text size="sm" className="flex-1 font-JakartaSemiBold">
          {URGENCY_LEVELS[urgency].label}
        </Text>
      </HStack>

      <HStack space="xs" className="items-center">
        <Text size="sm">Needed At:</Text>
        <Text size="sm" className="flex-1 font-JakartaSemiBold">
          {formatDate(neededAt)}
        </Text>
      </HStack>

      {bagsLength > 0 && (
        <VStack space="xs">
          <Text size="sm">Milk Bag{bagsLength > 1 ? 's' : null}:</Text>
          {bags?.map((bag, index) => (
            <HStack key={index} className="items-center">
              <Icon as={DotIcon} />
              <Text size="sm" className="font-JakartaSemiBold">
                {bag.volume}mL - {formatDate(bag.collectedAt, { shortMonth: true })},{' '}
                {formatLocaleTime(bag.collectedAt)}
              </Text>
            </HStack>
          ))}
        </VStack>
      )}

      {reason && (
        <VStack space="xs" className="w-full">
          <Text size="sm">Reason:</Text>
          <Textarea size="sm" rounded="lg" pointerEvents="none">
            <TextareaInput
              defaultValue={reason}
              editable={false}
              style={{ textAlignVertical: 'top', fontSize: 12 }}
              placeholder="No notes specified."
            />
          </Textarea>
        </VStack>
      )}

      {notes && (
        <VStack space="xs" className="w-full">
          <Text size="sm">Notes:</Text>
          <Textarea size="sm" rounded="lg" pointerEvents="none">
            <TextareaInput
              defaultValue={notes}
              editable={false}
              style={{ textAlignVertical: 'top', fontSize: 12 }}
              placeholder="No notes specified."
            />
          </Textarea>
        </VStack>
      )}

      {(deliveryPreferences?.length || 0) > 0 && (
        <VStack space="xs" className="w-full">
          <Text size="sm">Delivery Preferences:</Text>
          {deliveryPreferences?.map((preference, index) => (
            <DeliveryPreferenceCard key={index} data={preference} />
          ))}
        </VStack>
      )}

      {delivery && (
        <VStack space="xs" className="w-full">
          <Text size="sm">Delivery Details:</Text>
          <DeliveryCard data={delivery} />
        </VStack>
      )}
    </VStack>
  );
}

function DeliveryPreferenceCard({ data }: { data: DeliveryPreferenceSchema }) {
  const { address, preferredMode, availableDays, name } = data;
  const fullAddress = address?.displayName;

  return (
    <VStack space="xs" className="rounded-lg border border-outline-200 p-2">
      <Text size="sm" bold>
        {name || 'Unnamed Preference'}
      </Text>

      <HStack space="xs">
        <Text size="sm">Preferred Mode:</Text>
        <Text size="sm" className="flex-1 font-JakartaSemiBold">
          {preferredMode.map((mode) => DELIVERY_OPTIONS[mode].label).join(', ')}
        </Text>
      </HStack>

      <HStack space="xs">
        <Text size="sm">Available Days:</Text>
        <Text size="sm" className="flex-1 font-JakartaSemiBold">
          {formatDaysToText(availableDays, { short: true })}
        </Text>
      </HStack>

      <HStack space="xs">
        <Text size="sm">Address:</Text>
        <Text size="sm" className="flex-1 font-JakartaSemiBold">
          {fullAddress || '-'}
        </Text>
      </HStack>
    </VStack>
  );
}

function DeliveryCard({ data }: { data: DeliveryCreateSchema }) {
  const { mode, address, date, time, note } = data;
  const fullAddress = address?.displayName;

  return (
    <VStack space="xs" className="rounded-lg border border-outline-200 p-2">
      <HStack space="xs">
        <Text size="sm">Method:</Text>
        <Text size="sm" className="flex-1 font-JakartaSemiBold">
          {DELIVERY_OPTIONS[mode].label}
        </Text>
      </HStack>

      <HStack space="xs">
        <Text size="sm">Date & Time:</Text>
        <Text size="sm" className="flex-1 font-JakartaSemiBold">
          {formatDate(date, { shortMonth: true })}, {formatLocaleTime(time)}
        </Text>
      </HStack>

      <HStack space="xs">
        <Text size="sm">Location:</Text>
        <Text size="sm" className="flex-1 font-JakartaSemiBold">
          {fullAddress || '-'}
        </Text>
      </HStack>

      <HStack space="xs">
        <Text size="sm">Notes:</Text>
        <Text size="sm" className="flex-1 font-JakartaSemiBold">
          {note || '-'}
        </Text>
      </HStack>
    </VStack>
  );
}
