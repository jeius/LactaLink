import { DateInputField } from '@/components/form-fields/DateInputField';
import { NumberInputField } from '@/components/form-fields/NumberInputField';
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from '@/components/ui/actionsheet';
import { Button, ButtonText } from '@/components/ui/button';
import { useMeUser } from '@/hooks/auth/useAuth';
import { createTempID } from '@/lib/utils/tempID';
import { zodResolver } from '@hookform/resolvers/zod';
import { createMilkBagSchema, MilkBagCreateSchema } from '@lactalink/form-schemas';
import { extractID } from '@lactalink/utilities/extractors';
import { CalendarDaysIcon, MilkIcon, TimerIcon } from 'lucide-react-native';
import React, { ComponentProps } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface MilkBagActionSheetProps extends ComponentProps<typeof Actionsheet> {
  values?: MilkBagCreateSchema;
  onSave?: (data: MilkBagCreateSchema) => void;
}

export default function MilkBagActionSheet({ values, ...props }: MilkBagActionSheetProps) {
  const insets = useSafeAreaInsets();
  const { data: meUser } = useMeUser();
  const profileID = extractID(meUser?.profile?.value);

  const methods = useForm<MilkBagCreateSchema>({
    resolver: zodResolver(createMilkBagSchema),
    values: values,
    defaultValues: {
      id: createTempID(),
      volume: 20,
      collectedAt: new Date().toISOString(),
      donor: profileID,
    },
  });

  function handleConfirm() {
    methods.handleSubmit((data) => {
      props.onSave?.(data);
      props.onClose?.();
    })();
  }

  return (
    <Actionsheet {...props}>
      <ActionsheetBackdrop />
      <ActionsheetContent
        className="items-stretch gap-4"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator />
        </ActionsheetDragIndicatorWrapper>

        <FormProvider {...methods}>
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
          />

          <DateInputField
            name={`collectedAt`}
            control={methods.control}
            label="Date collected"
            datePickerProps={{
              mode: 'date',
              placeholder: 'Select date...',
              icon: CalendarDaysIcon,
            }}
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
          />
        </FormProvider>

        <Button className="mt-4" onPress={handleConfirm}>
          <ButtonText>Confirm</ButtonText>
        </Button>
      </ActionsheetContent>
    </Actionsheet>
  );
}
