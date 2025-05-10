import { useTheme } from '@/components/providers/theme-provider';
import { useToast } from '@/components/ui/toast';
import { errorToast, loadingToast, successToast } from '@/lib/toaster';
import { InterfaceToastProps } from '@gluestack-ui/toast/lib/types';

export type ToastType = 'success' | 'error' | 'loading';

export type ShowProps = InterfaceToastProps & {
  type: ToastType;
  message: string;
  description?: string;
};

export function useAppToast() {
  const toast = useToast();
  const { theme } = useTheme();

  const show = ({ id, message, type, description, placement, ...options }: ShowProps) => {
    const renderFn = {
      success: (id: string) => successToast(id, message),
      error: (id: string) => errorToast(id, message),
      loading: (id: string) => loadingToast(id, message, theme, description),
    };

    toast.show({
      id,
      placement: placement || 'top',
      duration: type === 'loading' ? null : 4000,
      render: ({ id }) => renderFn[type](id),
      ...options,
    });
  };

  return {
    ...toast,
    show,
  };
}
