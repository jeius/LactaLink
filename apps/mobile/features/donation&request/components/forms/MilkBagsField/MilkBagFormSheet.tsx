import { useForm } from '@/components/contexts/FormProvider';
import { PressableProps } from '@/components/ui/pressable';
import Sheet from '@/components/ui/sheet';
import { SheetRef } from '@/components/ui/sheet/Sheet';
import { DonationSchema } from '@lactalink/form-schemas';
import React, { createElement, FC, useCallback, useRef } from 'react';
import { useController } from 'react-hook-form';
import { GestureResponderEvent } from 'react-native';
import FormSheetContent from './FormSheetContent';

interface MilkBagFormSheetProps {
  trigger: FC<PressableProps>;
}

export default function MilkBagFormSheet({ trigger }: MilkBagFormSheetProps) {
  const sheetRef = useRef<SheetRef>(null);

  const { control } = useForm<DonationSchema>();

  const {
    field: { value: milkbags, onChange },
  } = useController({ name: 'details.bags', control });

  const handleOpen = useCallback((e: GestureResponderEvent) => {
    if (e.defaultPrevented) return;
    sheetRef.current?.present();
  }, []);

  const handleOnSubmit = useCallback((isSuccess: boolean) => {
    if (!isSuccess) return;
    sheetRef.current?.dismiss();
  }, []);

  return (
    <>
      {createElement(trigger, { onPress: handleOpen })}

      <Sheet ref={sheetRef} detents={['auto']}>
        <FormSheetContent
          milkbags={milkbags}
          onChange={onChange}
          onSubmit={handleOnSubmit}
          className="px-4 pb-2"
        />
      </Sheet>
    </>
  );
}
