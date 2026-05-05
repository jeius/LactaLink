import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionIcon,
  AccordionItem,
  AccordionTitleText,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  BottomSheet,
  BottomSheetPortal,
  BottomSheetScrollView,
} from '@/components/ui/bottom-sheet';
import { BottomSheetPortalProps, BottomSheetProps } from '@/components/ui/bottom-sheet/types';
import { BottomSheetHandle } from '@/components/ui/BottomSheetHandle';
import { Divider } from '@/components/ui/divider';
import { Transaction } from '@lactalink/types/payload-generated-types';
import { ChevronDownIcon } from 'lucide-react-native';
import { extractDeliveryDetail } from '../../lib/extractors';
import DeliveryProgressSection from './DeliveryProgressSection';
import { TransactionChatCard } from './TransactionChatCard';
import TransactionDetails from './TransactionDetails';

interface TransactionSheetProps
  extends
    Pick<BottomSheetPortalProps, 'animatedPosition' | 'snapPoints'>,
    Pick<BottomSheetProps, 'snapToIndex'> {
  transaction: Transaction;
}

export function TransactionSheet({ transaction, ...props }: TransactionSheetProps) {
  const deliveryDetail = extractDeliveryDetail(transaction);

  return (
    <BottomSheet snapToIndex={props.snapToIndex} disableClose>
      <BottomSheetPortal
        {...props}
        handleComponent={BottomSheetHandle}
        enableContentPanningGesture={true}
        enableDynamicSizing={false}
        animateOnMount={true}
        backgroundStyle={{ backgroundColor: 'transparent' }}
        enableOverDrag={false}
      >
        <BottomSheetScrollView
          contentContainerClassName="bg-background-0 pb-5 grow"
          showsVerticalScrollIndicator={false}
        >
          <TransactionChatCard transaction={transaction} variant="ghost" />

          <Divider />

          <Accordion defaultValue={['delivery-progress', 'details']} type="multiple">
            {deliveryDetail && (
              <>
                <AccordionItem value="delivery-progress">
                  <AccordionHeader className="border-y border-outline-200 py-0">
                    <AccordionTrigger className="py-4">
                      <AccordionTitleText bold>View Progress</AccordionTitleText>
                      <AccordionIcon as={ChevronDownIcon} />
                    </AccordionTrigger>
                  </AccordionHeader>
                  <AccordionContent className="px-4">
                    <DeliveryProgressSection transaction={transaction} />
                  </AccordionContent>
                </AccordionItem>

                <Divider />
              </>
            )}

            <AccordionItem value="details">
              <AccordionHeader className="border-y border-outline-200 py-0">
                <AccordionTrigger className="py-4">
                  <AccordionTitleText bold>Transaction Details</AccordionTitleText>
                  <AccordionIcon as={ChevronDownIcon} />
                </AccordionTrigger>
              </AccordionHeader>
              <AccordionContent className="px-4">
                <TransactionDetails />
              </AccordionContent>
            </AccordionItem>

            <Divider />
          </Accordion>
        </BottomSheetScrollView>
      </BottomSheetPortal>
    </BottomSheet>
  );
}
