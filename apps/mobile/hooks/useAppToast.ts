import { useToast } from '@/components/ui/toast';
import { useToastStore } from '@/lib/stores/toastStore';

export function useAppToast() {
  const toast = useToast();

  const show = useToastStore().showToast;

  return {
    ...toast,
    show,
  };
}
