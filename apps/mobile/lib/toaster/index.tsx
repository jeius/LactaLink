import { HStack } from '@/components/ui/hstack';
import { Spinner } from '@/components/ui/spinner';
import { Toast, ToastDescription, ToastTitle } from '@/components/ui/toast';
import { VStack } from '@/components/ui/vstack';
import { ColorsConfig } from '@/lib/types/colors';
import React from 'react';
import { Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getRgbColor } from '../colors';

export function loadingToast(
  id: string,
  message = 'Loading...',
  theme: keyof ColorsConfig = 'light'
) {
  const { width } = Dimensions.get('window');
  const spinnerColor = getRgbColor(theme, 'typography', 500);
  return (
    <SafeAreaView>
      <Toast
        nativeID={`toast-${id}`}
        variant="solid"
        action="muted"
        className="shadow-hard-5 p-5"
        style={{ width: width * 0.9 }}
      >
        <HStack space="sm" className="mx-auto">
          <Spinner size="small" color={spinnerColor} />
          <ToastTitle>{message}</ToastTitle>
        </HStack>
      </Toast>
    </SafeAreaView>
  );
}

export function successToast(id: string, title: string, description?: string) {
  const { width } = Dimensions.get('window');
  return (
    <SafeAreaView>
      <Toast
        nativeID={`toast-${id}`}
        variant="solid"
        action="success"
        className="shadow-hard-5 gap-4 p-5"
        style={{ width: width * 0.9 }}
      >
        <VStack space="sm" className="mx-auto">
          <ToastTitle>{title}</ToastTitle>
          {description && <ToastDescription>{description}</ToastDescription>}
        </VStack>
      </Toast>
    </SafeAreaView>
  );
}

export function errorToast(id: string, title: string, description?: string) {
  const { width } = Dimensions.get('window');
  return (
    <SafeAreaView>
      <Toast
        nativeID={`toast-${id}`}
        variant="solid"
        action="error"
        className="shadow-hard-5 gap-4 p-5"
        style={{ width: width * 0.9 }}
      >
        <VStack space="sm" className="mx-auto">
          <ToastTitle>{title}</ToastTitle>
          {description && <ToastDescription>{description}</ToastDescription>}
        </VStack>
      </Toast>
    </SafeAreaView>
  );
}
