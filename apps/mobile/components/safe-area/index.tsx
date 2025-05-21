import { tva } from '@gluestack-ui/nativewind-utils/tva';
import React from 'react';
import { SafeAreaView, SafeAreaViewProps } from 'react-native-safe-area-context';

const style = tva({
  base: 'bg-background-50 justifiy-center relative flex flex-1 flex-col items-stretch',
});

export default function SafeArea({ className, ...props }: SafeAreaViewProps) {
  return <SafeAreaView className={style({ class: className })} {...props} />;
}
