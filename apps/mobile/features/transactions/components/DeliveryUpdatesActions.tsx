import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Transaction } from '@lactalink/types/payload-generated-types';
import { useState } from 'react';
import { useDeliveryActions } from '../hooks/useDeliveryActions';

interface Props {
  /**
   * The transaction document for which to render delivery update actions. Make
   * sure to pass a document with depth `≥3` so the hook has access to the delivery
   * detail and updates.
   */
  transaction: Transaction;
}

/**
 * Renders the CTA button(s) for the delivery execution phase of a transaction.
 *
 * @description
 * Delegates all role/mode/status logic to {@link useDeliveryActions}. Renders nothing
 * when no actions are available (e.g. terminal states, waiting on the other party).
 *
 * The first action in the list is displayed as the primary full-width button. Any
 * subsequent actions (e.g. "Experiencing Delay") are displayed as secondary outline
 * buttons in a row below the primary button.
 *
 * @param transaction - The current transaction document
 */
export default function DeliveryUpdatesActions({ transaction }: Props) {
  const { actions, isPending, mutate } = useDeliveryActions(transaction);
  const [pendingIndex, setPendingIndex] = useState(0);

  if (!actions || actions.length === 0) return null;

  const [primaryAction, ...secondaryActions] = actions;

  return (
    <VStack space="sm" className="px-4 pb-4 pt-2">
      <Button
        action="positive"
        variant="solid"
        size="lg"
        className="w-full"
        isDisabled={isPending}
        onPress={() => {
          mutate(primaryAction!.status);
          setPendingIndex(0);
        }}
      >
        {isPending && pendingIndex === 0 && <ButtonSpinner />}
        <ButtonText>{primaryAction!.label}</ButtonText>
      </Button>

      {secondaryActions.length > 0 && (
        <HStack space="sm">
          {secondaryActions.map((action, idx) => (
            <Button
              key={action.status}
              action={action.action}
              variant="outline"
              size="md"
              className="flex-1"
              isDisabled={isPending}
              onPress={() => {
                mutate(action.status);
                setPendingIndex(idx + 1);
              }}
            >
              {isPending && pendingIndex === idx + 1 && <ButtonSpinner />}
              <ButtonText>{action.label}</ButtonText>
            </Button>
          ))}
        </HStack>
      )}
    </VStack>
  );
}
