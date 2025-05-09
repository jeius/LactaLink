import { cn } from '@gluestack-ui/nativewind-utils/cn';
import React from 'react';
import { SafeAreaView, SafeAreaViewProps } from 'react-native-safe-area-context';

export default function SafeArea({ className, ...props }: SafeAreaViewProps) {
  const base = 'bg-background-50 justifiy-center relative flex flex-1 flex-col items-stretch';
  return <SafeAreaView className={cn(base, className)} {...props} />;
}
