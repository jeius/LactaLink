import { DraggableWrapper } from '@/components/draggable-wrapper';
import { HStack } from '@/components/ui/hstack';
import { Spinner } from '@/components/ui/spinner';
import { Toast, ToastDescription, ToastTitle, useToast } from '@/components/ui/toast';
import { VStack } from '@/components/ui/vstack';
import { InterfaceToastProps } from '@gluestack-ui/toast/lib/types';
import React, { FC, useEffect } from 'react';
import { Dimensions, View } from 'react-native';
import { useToastStore } from '../stores/toastStore';

export type ToastType = 'success' | 'error' | 'loading';
export type ToastShowArgs = InterfaceToastProps & {
  message?: string;
  type: ToastType;
  description?: string;
};
export type ToastRenderArgs = Pick<ToastShowArgs, 'id' | 'message' | 'description'> & {
  onDismiss?: () => void;
};

export const loadingToast: FC<ToastRenderArgs> = ({
  id,
  message: title = 'Loading...',
  description,
  onDismiss,
}) => {
  const { width } = Dimensions.get('window');
  return (
    <DraggableWrapper onDismiss={onDismiss}>
      <Toast
        nativeID={`toast-${id}`}
        variant="solid"
        action="info"
        className="p-5 shadow-md"
        style={{ width: width * 0.85 }}
      >
        <HStack space="sm" className="mx-auto">
          <Spinner size="small" className="text-info-0" />
          <VStack>
            <ToastTitle>{title}</ToastTitle>
            {description && <ToastDescription>{description}</ToastDescription>}
          </VStack>
        </HStack>
      </Toast>
    </DraggableWrapper>
  );
};

export const successToast: FC<ToastRenderArgs> = ({
  id,
  message: title = 'Success!',
  description,
  onDismiss,
}) => {
  const { width } = Dimensions.get('window');
  return (
    <DraggableWrapper onDismiss={onDismiss}>
      <Toast
        nativeID={`toast-${id}`}
        variant="solid"
        action="success"
        className="shadow-hard-5 gap-4 p-5"
        style={{ width: width * 0.85 }}
      >
        <VStack space="sm" className="mx-auto">
          <ToastTitle>{title}</ToastTitle>
          {description && <ToastDescription>{description}</ToastDescription>}
        </VStack>
      </Toast>
    </DraggableWrapper>
  );
};

export const errorToast: FC<ToastRenderArgs> = ({
  id,
  message: title = 'Unexpected Error!',
  description,
  onDismiss,
}) => {
  const { width } = Dimensions.get('window');
  return (
    <DraggableWrapper onDismiss={onDismiss}>
      <Toast
        nativeID={`toast-${id}`}
        variant="solid"
        action="error"
        className="shadow-hard-5 gap-4 p-5"
        style={{ width: width * 0.85 }}
      >
        <VStack space="sm" className="mx-auto">
          <ToastTitle>{title}</ToastTitle>
          {description && <ToastDescription>{description}</ToastDescription>}
        </VStack>
      </Toast>
    </DraggableWrapper>
  );
};

export const Toaster: FC = () => {
  const toast = useToast();

  const toastArgs = useToastStore((s) => s.toastArgs);
  const clearToast = useToastStore((s) => s.clearToast);

  useEffect(() => {
    if (!toastArgs) return;

    const { id, message: title, type, description, placement, ...options } = toastArgs;

    function onDismiss() {
      if (id) toast.close(id);
    }

    const renderFn = {
      success: (id: string) => successToast({ id, message: title, description, onDismiss }),
      error: (id: string) => errorToast({ id, message: title, description, onDismiss }),
      loading: (id: string) => loadingToast({ id, message: title, description, onDismiss }),
    };

    toast.show({
      id,
      placement: placement || 'top',
      duration: type === 'loading' ? null : 4000,
      render: ({ id }) => renderFn[type](id),
      ...options,
    });

    clearToast();
  }, [toastArgs, toast, clearToast]);

  return <View className="shrink" />;
};
