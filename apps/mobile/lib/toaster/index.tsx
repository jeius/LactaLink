/**
 * Toast utility types and renderers for the app.
 *
 * This module provides reusable toast components for different toast types (loading, success, error),
 * as well as the Toaster provider setup for global toast and overlay support.
 *
 * Toasts are rendered using DraggableWrapper for swipe-to-dismiss support.
 * The ToastStore is initialized via the Toast component, allowing toast actions to be triggered globally.
 */

import { DraggableWrapper } from '@/components/draggable-wrapper';
import { HStack } from '@/components/ui/hstack';
import { Spinner } from '@/components/ui/spinner';
import {
  Toast as UIToast,
  ToastDescription as UIToastDescription,
  ToastTitle as UIToastTitle,
  useToast,
} from '@/components/ui/toast';
import { VStack } from '@/components/ui/vstack';
import { InterfaceToastProps } from '@gluestack-ui/toast/lib/types';
import React, { FC, useEffect } from 'react';
import { Dimensions, View } from 'react-native';
import { useToastStore } from '../stores/toastStore';

import { OverlayProvider } from '@gluestack-ui/overlay';
import { ToastProvider } from '@gluestack-ui/toast';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * ToastType defines the available toast variants.
 */
export type ToastType = 'success' | 'error' | 'loading';

/**
 * ToastShowArgs defines the arguments for showing a toast.
 */
export type ToastShowArgs = InterfaceToastProps & {
  message?: string;
  type: ToastType;
  description?: string;
};

/**
 * ToastRenderArgs defines the arguments for rendering a toast.
 */
export type ToastRenderArgs = Pick<ToastShowArgs, 'id' | 'message' | 'description'> & {
  onDismiss?: () => void;
};

/**
 * loadingToast renders a loading toast with a spinner and optional description.
 */
export const loadingToast: FC<ToastRenderArgs> = ({
  id,
  message: title = 'Loading...',
  description,
  onDismiss,
}) => {
  const { width } = Dimensions.get('window');
  return (
    <DraggableWrapper onDismiss={onDismiss}>
      <UIToast
        nativeID={`toast-${id}`}
        variant="solid"
        action="info"
        className="p-5 shadow-md"
        style={{ width: width * 0.85 }}
      >
        <HStack space="sm" className="mx-auto">
          <Spinner size="small" className="text-info-0" />
          <VStack>
            <UIToastTitle>{title}</UIToastTitle>
            {description && <UIToastDescription>{description}</UIToastDescription>}
          </VStack>
        </HStack>
      </UIToast>
    </DraggableWrapper>
  );
};

/**
 * successToast renders a success toast with a title and optional description.
 */
export const successToast: FC<ToastRenderArgs> = ({
  id,
  message: title = 'Success!',
  description,
  onDismiss,
}) => {
  const { width } = Dimensions.get('window');
  return (
    <DraggableWrapper onDismiss={onDismiss}>
      <UIToast
        nativeID={`toast-${id}`}
        variant="solid"
        action="success"
        className="shadow-hard-5 gap-4 p-5"
        style={{ width: width * 0.85 }}
      >
        <VStack space="sm" className="mx-auto">
          <UIToastTitle>{title}</UIToastTitle>
          {description && <UIToastDescription>{description}</UIToastDescription>}
        </VStack>
      </UIToast>
    </DraggableWrapper>
  );
};

/**
 * errorToast renders an error toast with a title and optional description.
 */
export const errorToast: FC<ToastRenderArgs> = ({
  id,
  message: title = 'Unexpected Error!',
  description,
  onDismiss,
}) => {
  const { width } = Dimensions.get('window');
  return (
    <DraggableWrapper onDismiss={onDismiss}>
      <UIToast
        nativeID={`toast-${id}`}
        variant="solid"
        action="error"
        className="shadow-hard-5 gap-4 p-5"
        style={{ width: width * 0.85 }}
      >
        <VStack space="sm" className="mx-auto">
          <UIToastTitle>{title}</UIToastTitle>
          {description && <UIToastDescription>{description}</UIToastDescription>}
        </VStack>
      </UIToast>
    </DraggableWrapper>
  );
};

/**
 * Toast component initializes the ToastStore with the current toast instance.
 * This allows toast actions to be triggered from anywhere in the app via the store.
 *
 * Note: This component must be a React component and must return null.
 * This is required because it uses hooks (such as useToast) to initialize the store,
 * and React hooks can only be called inside functional components.
 * Returning null is the correct approach for components that only perform side effects
 * and do not render any UI.
 */
export const Toast: FC = () => {
  const toast = useToast();

  const initToast = useToastStore((state) => state.init);

  useEffect(() => {
    initToast(toast);
  }, [toast, initToast]);

  return null;
};

/**
 * The Toaster component sets up the OverlayProvider and ToastProvider for the app.
 *
 * Note: The OverlayProvider must be wrapped with a View because SafeAreaView applies padding insets.
 * This is necessary since the Providers render their content with absolute positioning,
 * and without the extra View wrapper, overlays and toasts may be misaligned or offset by the safe area padding.
 */
export const Toaster: FC = () => (
  <SafeAreaView>
    <View className="relative">
      <OverlayProvider>
        <ToastProvider>
          <Toast />
        </ToastProvider>
      </OverlayProvider>
    </View>
  </SafeAreaView>
);
