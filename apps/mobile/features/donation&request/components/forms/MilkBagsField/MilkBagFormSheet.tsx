import { Form } from '@/components/contexts/FormProvider';
import { DateInputField } from '@/components/form-fields/DateInputField';
import { NumberInputField } from '@/components/form-fields/NumberInputField';
import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button';
import Sheet from '@/components/ui/sheet';
import { SheetRef } from '@/components/ui/sheet/Sheet';
import { VStack } from '@/components/ui/vstack';
import {
  useAddMilkBagMutation,
  useUpdateMilkBagMutation,
} from '@/features/donation&request/hooks/mutations';
import { getMeUser } from '@/lib/stores/meUserStore';
import { createTempID } from '@/lib/utils/tempID';
import { zodResolver } from '@hookform/resolvers/zod';
import { MilkBagSchema, milkBagSchema } from '@lactalink/form-schemas';
import { extractID } from '@lactalink/utilities/extractors';
import { CalendarDaysIcon, MilkIcon, TimerIcon } from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import { useForm as useHookForm } from 'react-hook-form';

interface MilkBagFormSheetProps {
  selectedMilkBag?: MilkBagSchema | null;
  milkbags?: MilkBagSchema[];
  onChange?: (milkbags: MilkBagSchema[]) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function MilkBagFormSheet({
  milkbags,
  onChange,
  selectedMilkBag,
  isOpen,
  onClose,
}: MilkBagFormSheetProps) {
  const sheetRef = useRef<SheetRef>(null);
  const presentedRef = useRef(false);

  const isUpdate = !!selectedMilkBag;

  const { mutate: addMilkBag } = useAddMilkBagMutation(milkbags, onChange);
  const { mutateAsync: updateBag, isPending: isUpdating } = useUpdateMilkBagMutation(
    milkbags,
    onChange
  );

  const methods = useHookForm({
    resolver: zodResolver(milkBagSchema),
    defaultValues: selectedMilkBag || {
      id: createTempID(),
      collectedAt: new Date().toISOString(),
      donor: extractID(getMeUser()?.profile?.value),
      status: 'AVAILABLE',
    },
  });

  const { handleSubmit, reset } = methods;

  function closeSheet() {
    sheetRef.current?.dismiss();
  }

  async function onSubmit(data: MilkBagSchema) {
    if (isUpdate) {
      await updateBag(data).then(closeSheet);
    }
    addMilkBag(data);
    closeSheet();
  }

  useEffect(() => {
    if (isOpen && !presentedRef.current) {
      sheetRef.current?.present();
      presentedRef.current = true;
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedMilkBag && isOpen) {
      reset(selectedMilkBag);
    } else if (!selectedMilkBag) {
      reset({
        id: createTempID(),
        collectedAt: new Date().toISOString(),
        donor: extractID(getMeUser()?.profile?.value),
        status: 'AVAILABLE',
      });
    }
  }, [selectedMilkBag, reset, isOpen]);

  return (
    <Sheet
      ref={sheetRef}
      detents={['auto']}
      onDidDismiss={() => {
        onClose?.();
        presentedRef.current = false;
      }}
    >
      <Form {...methods}>
        <VStack space="lg" className="px-4 pb-2">
          <NumberInputField
            name={`volume`}
            control={methods.control}
            label="Volume (mL)"
            helperText="Minimum 20 mL"
            inputProps={{
              placeholder: 'e.g. 20',
              keyboardType: 'numeric',
              icon: MilkIcon,
              showStepButtons: true,
              step: 10,
              min: 20,
            }}
            isDisabled={isUpdating}
          />

          <DateInputField
            name={`collectedAt`}
            control={methods.control}
            label="Date collected"
            datePickerProps={{
              mode: 'date',
              options: { display: 'calendar', minimumDate: new Date() },
              placeholder: 'Select date...',
              icon: CalendarDaysIcon,
            }}
            isDisabled={isUpdating}
          />

          <DateInputField
            name={`collectedAt`}
            control={methods.control}
            label="Time collected"
            datePickerProps={{
              mode: 'time',
              placeholder: 'Select time...',
              icon: TimerIcon,
              showSetNowButton: true,
            }}
            isDisabled={isUpdating}
          />

          <Button
            isDisabled={isUpdating}
            size="lg"
            className="mt-4"
            onPress={handleSubmit(onSubmit)}
          >
            {isUpdating && <ButtonSpinner />}
            <ButtonText>{isUpdate ? (isUpdating ? 'Saving...' : 'Save') : 'Confirm'}</ButtonText>
          </Button>
        </VStack>
      </Form>
    </Sheet>
  );
}
