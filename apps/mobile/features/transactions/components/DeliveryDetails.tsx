import { useMap } from '@/components/contexts/MapProvider';
import { Image } from '@/components/Image';
import TruncatedText from '@/components/TruncatedText';
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionIcon,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { getColor } from '@/lib/colors';
import { ColorCategory } from '@/lib/types/colors';
import { getDeliveryPreferenceIcon } from '@/lib/utils/getDeliveryPreferenceIcon';
import { isMeProfile } from '@/lib/utils/isMeUser';
import { DELIVERY_OPTIONS } from '@lactalink/enums';
import { DeliveryDetail } from '@lactalink/types/payload-generated-types';
import { isPlaceHolderData } from '@lactalink/utilities/checkers';
import { extractCollection } from '@lactalink/utilities/extractors';
import { formatDate, formatLocaleTime } from '@lactalink/utilities/formatters';
import { pointToLatLng } from '@lactalink/utilities/geo-utils';
import { CalendarDaysIcon, ChevronDownIcon, ClockIcon, MapPinIcon } from 'lucide-react-native';
import { useTransactionContext } from './context';
import DeliveryDetailsActions from './DeliveryDetailsActions';
import DeliveryUpdatesActions from './DeliveryUpdatesActions';

interface DeliveryPlanProps {
  data: DeliveryDetail;
}

export default function DeliveryDetails({ data }: DeliveryPlanProps) {
  const [map] = useMap();
  const transaction = useTransactionContext();

  if (isPlaceHolderData(data)) return <Skeleton variant="rounded" className="h-64 w-full" />;

  const { scheduledAt, notes: instructions, status } = data;

  const isAccepted = status === 'ACCEPTED';
  const method = DELIVERY_OPTIONS[data.method].label;
  const iconSource = getDeliveryPreferenceIcon(data.method);
  const time = formatLocaleTime(scheduledAt);
  const date = formatDate(scheduledAt, { shortMonth: true });
  const addressDoc = extractCollection(data.address);
  const fullAddress = addressDoc?.displayName || 'Unknown Address';
  const addressCoords = addressDoc?.coordinates;

  function handleAddressPress() {
    if (addressCoords) {
      map?.setCamera({ center: pointToLatLng(addressCoords), zoom: 16 }, true, 400);
    }
  }

  return (
    <Accordion className="bg-background-50">
      <AccordionItem value={method}>
        <AccordionHeader className="p-0">
          <AccordionTrigger className="items-center gap-2">
            <HStack space="sm" className="flex-1 items-center">
              <Box className="rounded-full border border-primary-500 p-1">
                <Image
                  source={iconSource}
                  alt={`${method || 'Unknown'}-icon`}
                  style={{ width: 18, height: 18 }}
                />
              </Box>
              <Text className="flex-1 font-JakartaSemiBold text-primary-500">{method}</Text>
            </HStack>

            <StatusBadge {...data} />

            <AccordionIcon as={ChevronDownIcon} />
          </AccordionTrigger>
        </AccordionHeader>

        <AccordionContent className="gap-4 px-3 py-2">
          {/**Schedule */}
          <HStack space="md">
            <HStack space="sm" className="flex-1 items-center">
              <Icon size="lg" as={CalendarDaysIcon} />
              <Text size="sm" numberOfLines={1} className="flex-1 font-JakartaMedium">
                {date}
              </Text>
            </HStack>
            <HStack space="sm" className="flex-1 items-center">
              <Icon size="lg" as={ClockIcon} />
              <Text size="sm" numberOfLines={1} className="flex-1 font-JakartaMedium">
                {time}
              </Text>
            </HStack>
          </HStack>

          {/**Location & Instructions */}
          <HStack space="sm" className="items-start">
            <Icon as={MapPinIcon} />
            <VStack space="xs" className="flex-1">
              <Button
                onPress={handleAddressPress}
                variant="link"
                action="default"
                size="sm"
                className="h-fit w-fit justify-start p-0"
              >
                <ButtonText>{fullAddress}</ButtonText>
              </Button>

              {instructions && (
                <TruncatedText size="sm" initialLines={2}>
                  {instructions}
                </TruncatedText>
              )}
            </VStack>
          </HStack>

          {/** Actions */}
          {isAccepted ? (
            <DeliveryUpdatesActions transaction={transaction} />
          ) : (
            <DeliveryDetailsActions deliveryPlan={data} />
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

function StatusBadge({ status, proposedBy }: DeliveryDetail) {
  const isMeProposer = isMeProfile(proposedBy);

  const statusDetails: Record<DeliveryDetail['status'], { label: string; color: ColorCategory }> = {
    PENDING: {
      label: isMeProposer ? 'Proposed' : 'Action Needed',
      color: isMeProposer ? 'info' : 'warning',
    },
    ACCEPTED: {
      label: 'Confirmed',
      color: 'primary',
    },
    REJECTED: {
      label: isMeProposer ? 'Rejected' : 'Disagreed',
      color: 'error',
    },
  };

  const { label, color } = statusDetails[status];

  return (
    <Box className="rounded-md border px-2 py-1" style={{ borderColor: getColor(color, '500') }}>
      <Text size="xs" style={{ color: getColor(color, '500') }}>
        {label.toUpperCase()}
      </Text>
    </Box>
  );
}
