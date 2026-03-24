import { Form } from '@/components/contexts/FormProvider';
import { DateInputField } from '@/components/form-fields/DateInputField';
import { NumberInputField } from '@/components/form-fields/NumberInputField';
import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { VStack, VStackProps } from '@/components/ui/vstack';
import {
  useAddMilkBagMutation,
  useUpdateMilkBagMutation,
} from '@/features/donation&request/hooks/mutations';
import { useMeUser } from '@/hooks/auth/useAuth';
import { createTempID } from '@/lib/utils/tempID';
import { zodResolver } from '@hookform/resolvers/zod';
import { MilkBagSchema, milkBagSchema } from '@lactalink/form-schemas';
import { extractID } from '@lactalink/utilities/extractors';
import { useLocalSearchParams } from 'expo-router';
import { CalendarDaysIcon, MilkIcon, TimerIcon } from 'lucide-react-native';
import React from 'react';
import { useForm as useHookForm } from 'react-hook-form';

interface FormSheetContentProps extends VStackProps {
  milkbags: MilkBagSchema[];
  onChange: (bags: MilkBagSchema[]) => void;
  onSubmit?: (isSuccess: boolean) => void;
}

export default function FormSheetContent({
  milkbags,
  onChange,
  space = 'lg',
  onSubmit,
  ...vStackProps
}: FormSheetContentProps) {
  const { id } = useLocalSearchParams<{ id?: string }>();

  const { data: meUser } = useMeUser();
  const profileID = extractID(meUser?.profile?.value);

  const isUpdate = Boolean(id);
  const values = milkbags.find((bag) => bag.id === id);

  const { mutate: addMilkBag } = useAddMilkBagMutation(milkbags, onChange);
  const { mutateAsync: updateBag, isPending: isUpdating } = useUpdateMilkBagMutation(
    milkbags,
    onChange
  );

  const methods = useHookForm({
    resolver: zodResolver(milkBagSchema),
    values: values ? ({ ...values, status: 'AVAILABLE' } as MilkBagSchema) : undefined,
    reValidateMode: 'onBlur',
    defaultValues: {
      id: createTempID(),
      collectedAt: new Date().toISOString(),
      donor: profileID,
      status: 'AVAILABLE',
    },
  });

  function handleConfirm() {
    methods.handleSubmit(async (data) => {
      try {
        if (isUpdate) await updateBag(data);
        else addMilkBag(data);
        onSubmit?.(true);
      } catch (err) {
        onSubmit?.(false);
        throw err;
      }
    })();
  }

  return (
    <Form {...methods}>
      <VStack {...vStackProps} space={space}>
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

        <Button isDisabled={isUpdating} size="lg" className="mt-4" onPress={handleConfirm}>
          {isUpdating && <ButtonSpinner />}
          <ButtonText>{isUpdate ? (isUpdating ? 'Saving...' : 'Save') : 'Confirm'}</ButtonText>
        </Button>
      </VStack>
    </Form>
  );
}
