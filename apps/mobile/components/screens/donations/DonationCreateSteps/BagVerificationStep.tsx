import { DonationReviewCard } from '@/components/cards/DonationReviewCard';
import { useForm } from '@/components/contexts/FormProvider';
import { HintAlert } from '@/components/HintAlert';
import { ActionModal } from '@/components/modals/ActionModal';
import SafeArea from '@/components/SafeArea';
import { Box } from '@/components/ui/box';
import { FlashList } from '@/components/ui/FlashList';
import ScrollView from '@/components/ui/ScrollView';
import VerifyBagItem from '@/features/donation&request/components/cards/VerifyBagItem';
import { useDonationCreateMutation } from '@/features/donation&request/hooks/mutations';
import { MMKV_KEYS } from '@/lib/constants/storageKeys';
import Storage from '@/lib/localStorage';
import { DonationCreateSchema, MilkBagSchema } from '@lactalink/form-schemas';
import { DonationCreateResult } from '@lactalink/types/api';
import {
  extractDisplayName,
  extractErrorMessage,
  listKeyExtractor,
} from '@lactalink/utilities/extractors';
import { ListRenderItem } from '@shopify/flash-list';
import { Stack } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { useController } from 'react-hook-form';
import { GestureResponderEvent } from 'react-native';
import { toast } from 'sonner-native';

const STORAGE_KEY = MMKV_KEYS.ALERT.MILKBAG_VERIFICATION;

export default function BagVerificationStep({
  onSubmit,
}: {
  onSubmit: (result: DonationCreateResult | null) => void;
}) {
  const hasViewedHint = Storage.getBoolean(STORAGE_KEY);
  const [showHint, setShowHint] = useState(!hasViewedHint);

  const { control, getValues, formState, handleSubmit, additionalState, trigger } =
    useForm<DonationCreateSchema>();
  const { isSubmitting } = formState;
  const { refreshing, onRefresh } = additionalState;

  const {
    field: { value: milkBags, onChange },
  } = useController({ control, name: 'details.bags' });

  const allVerified = useMemo(() => milkBags.every((bag) => bag.bagImage), [milkBags]);

  const { mutateAsync: createDonation, cancelMutate } = useDonationCreateMutation();

  const renderItem = useCallback<ListRenderItem<MilkBagSchema>>(
    ({ item }) => {
      function handleOnChange(bag: MilkBagSchema) {
        const bagsMap = new Map(milkBags.map((b) => [b.id, b]));
        bagsMap.set(bag.id, bag);
        onChange(Array.from(bagsMap.values()));
      }

      return <VerifyBagItem data={item} className="self-center" onChange={handleOnChange} />;
    },
    [milkBags, onChange]
  );

  function handleHintClose() {
    Storage.set(STORAGE_KEY, true);
    setShowHint(true);
  }

  async function handleValidation(e: GestureResponderEvent) {
    const isValid = await trigger('details.bags');
    if (isValid && allVerified) return;
    toast.error('Please ensure all milk bags are verified before proceeding.');
    e.preventDefault();
  }

  async function submitHandler(data: DonationCreateSchema) {
    const toastID = 'donation-submit';

    toast.loading('Submitting donation...', {
      id: toastID,
      duration: Infinity,
      onDismiss: cancelMutate,
    });

    const handleSuccess = (res: DonationCreateResult | undefined) => {
      if (!res) return onSubmit(null); // Mutation was cancelled, treat as no result

      if (data.type === 'OPEN') {
        toast.success('Thank you for your donation!', { id: toastID });
      } else if (data.type === 'DIRECT') {
        try {
          const recipientName = extractDisplayName({ profile: res.donation.recipient });
          toast.success(`Thank you! ${recipientName} will be notified of your kind donation`, {
            id: toastID,
          });
        } catch (_) {
          toast.success('Donation submitted', { id: toastID });
        }
      }

      onSubmit(res);
    };

    const handleError = (error: unknown) => {
      toast.error(extractErrorMessage(error), { id: toastID });
      onSubmit(null);
    };

    await createDonation(data)
      .then(handleSuccess, handleError)
      .finally(() => toast.dismiss(toastID));
  }

  return (
    <>
      <Stack.Screen options={{ headerTitle: 'Verify Milk Bags' }} />
      <SafeArea safeTop={false} className="items-stretch">
        <FlashList
          data={milkBags}
          renderItem={renderItem}
          keyExtractor={listKeyExtractor}
          refreshing={refreshing}
          onRefresh={onRefresh}
          className="flex-1"
          contentContainerClassName="grow p-5"
          ItemSeparatorComponent={() => <Box className="h-6" />}
          headerClassName="mb-6"
          footerClassName="mt-6 flex-1 justify-end"
          ListHeaderComponent={
            <HintAlert
              visible={showHint}
              message="Ensure that you affix/write the code to the exact milk bag."
              onClose={handleHintClose}
            />
          }
          ListFooterComponent={
            <ActionModal
              action="primary"
              modalSize="lg"
              triggerButtonProps={{ label: 'Review and Submit' }}
              confirmButtonProps={{ label: 'Submit' }}
              isDisabled={!allVerified || isSubmitting}
              title="Review Donation"
              description={
                <ScrollView
                  className="border-outline-200"
                  style={{
                    maxHeight: 380,
                    borderTopWidth: 1,
                    borderBottomWidth: 1,
                  }}
                >
                  <DonationReviewCard data={getValues()} variant="ghost" className="p-2" />
                </ScrollView>
              }
              onTriggerPress={handleValidation}
              onConfirm={() => {
                handleSubmit(submitHandler)();
              }}
            />
          }
        />
      </SafeArea>
    </>
  );
}
