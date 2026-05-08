import { useForm } from '@/components/contexts/FormProvider';
import { HintAlert } from '@/components/HintAlert';
import { ActionModal } from '@/components/modals/ActionModal';
import SafeArea from '@/components/SafeArea';
import { Box } from '@/components/ui/box';
import { FlashList } from '@/components/ui/FlashList';
import ScrollView from '@/components/ui/ScrollView';
import VerifyBagItem from '@/features/donation&request/components/cards/VerifyBagItem';
import DonationReview from '@/features/donation&request/components/DonationReview';
import { useMilkBagVerificationHint } from '@/features/donation&request/hooks/hints';
import { useUpdateDonationMutation } from '@/features/donation&request/hooks/mutations';
import { MilkBagSchema } from '@lactalink/form-schemas';
import { DonationUpdateSchema } from '@lactalink/form-schemas/listings';
import { listKeyExtractor } from '@lactalink/utilities/extractors';
import { ListRenderItem } from '@shopify/flash-list';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { useController } from 'react-hook-form';
import { GestureResponderEvent } from 'react-native';
import { toast } from 'sonner-native';

export default function MilkbagVerfication() {
  const { id: donationID } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { hasViewedHint, closeHint } = useMilkBagVerificationHint();

  const { control, getValues, formState, handleSubmit, additionalState, trigger } =
    useForm<DonationUpdateSchema>();

  const { isSubmitting } = formState;
  const { refreshing, onRefresh } = additionalState;

  const {
    field: { value: milkBags, onChange },
  } = useController({ control, name: 'details.bags' });

  const allVerified = useMemo(() => milkBags.every((bag) => !!bag.bagImage), [milkBags]);

  const { mutateAsync: updateDonation } = useUpdateDonationMutation(donationID);

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

  async function handleValidation(e: GestureResponderEvent) {
    const isValid = await trigger('details.bags');
    if (isValid && allVerified) return;
    toast.error('Please ensure all milk bags are verified before proceeding.');
    e.preventDefault();
  }

  async function onSubmit(data: DonationUpdateSchema) {
    const toastID = 'donation-submit';

    toast.loading('Updating donation...', {
      id: toastID,
      duration: Infinity,
      cancel: null,
    });

    await updateDonation({ data })
      .then((donation) => {
        router.dismissTo(`/donations/${donation.id}`);
      })
      .finally(() => toast.dismiss(toastID));
  }

  function handleConfirm() {
    handleSubmit(onSubmit)();
  }

  return (
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
            visible={!hasViewedHint}
            message="Ensure that you affix/write the code to the exact milk bag."
            onClose={closeHint}
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
            onTriggerPress={handleValidation}
            onConfirm={handleConfirm}
            description={
              <ScrollView
                className="border-outline-200"
                contentContainerClassName="py-2"
                style={{
                  maxHeight: 380,
                  borderTopWidth: 1,
                  borderBottomWidth: 1,
                }}
              >
                <DonationReview data={getValues()} />
              </ScrollView>
            }
          />
        }
      />
    </SafeArea>
  );
}
