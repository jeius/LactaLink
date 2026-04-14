import { ToastAction } from '@/components/toasts/ToastAction';
import { usePreventBackPress } from '@/hooks/usePreventBackPress';
import { ErrorSearchParams } from '@lactalink/types/errors';
import { useRouter } from 'expo-router';
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { GestureResponderEvent } from 'react-native';
import { toast } from 'sonner-native';
import { createStore, StoreApi, useStore } from 'zustand';
import { useShallow } from 'zustand/shallow';
import { useStandardScreeningFormQuery } from '../../hooks/queries';

type FormNavigationStore = {
  goNext: () => void;
  goBack: () => void;
  save: (e?: GestureResponderEvent) => Promise<void>;
  isLastSection: boolean;
  progress: number | undefined;
  showUnsavedWarning: () => void;
};

const FormNavigationContext = createContext<StoreApi<FormNavigationStore> | null>(null);

export function useFormNavigation<T>(selector: (state: FormNavigationStore) => T): T {
  const store = useContext(FormNavigationContext);
  if (!store) {
    throw new Error('useFormNavigation must be used within a FormNavigationProvider');
  }
  return useStore(store, useShallow(selector));
}

type FormNavigationProviderProps = {
  sectionID?: string;
  formState?: { isDirty?: boolean };
  onSave?: (e?: GestureResponderEvent) => Promise<void> | void;
  onLeave?: (e?: GestureResponderEvent) => Promise<void> | void;
};
export default function FormNavigationProvider({
  children,
  sectionID,
  formState,
  onSave,
  onLeave,
}: PropsWithChildren<FormNavigationProviderProps>) {
  const router = useRouter();
  const { data: form } = useStandardScreeningFormQuery();

  const sectionIndex = sectionID ? form?.sections?.findIndex((s) => s.id === sectionID) || 0 : 0;
  const nextSection = form?.sections?.[sectionIndex + 1];

  const isLast = !form?.sections ? true : sectionIndex === form.sections.length - 1;
  const isDirty = !!formState?.isDirty;

  const progress = useMemo(() => {
    const numberOfSections = form?.sections?.length || 0;
    const hasRootFields = !!form?.fields?.length;
    const totalPages = numberOfSections + (hasRootFields ? 1 : 0);
    const currentPage = sectionID ? sectionIndex + 1 + (hasRootFields ? 1 : 0) : 1;
    return numberOfSections > 0 && totalPages > 0 ? (currentPage / totalPages) * 100 : undefined;
  }, [form, sectionID, sectionIndex]);

  const goNext = useCallback(() => {
    if (!form?.id) return;

    if (isLast) {
      router.push(`/donor-screening/form/${form.id}/summary`);
      return;
    }

    if (!nextSection?.id) {
      router.push({
        pathname: '/error',
        params: { message: 'Next section not found' } as ErrorSearchParams,
      });
      return;
    }

    router.push(`/donor-screening/form/${form.id}/section/${nextSection.id}`);
  }, [router, form, nextSection, isLast]);

  const handleSave = useCallback(
    async (e?: GestureResponderEvent) => {
      await onSave?.(e);
    },
    [onSave]
  );

  const showUnsavedWarning = useCallback(() => {
    toast.warning('You have unsaved changes. Please save before navigating away.', {
      id: 'unsaved-changes-warning',
      action: (
        <ToastAction
          abortLabel="Leave"
          confirmLabel="Save and leave"
          confirmButtonProps={{
            className: 'shrink',
            onPress: async (e) => {
              e.persist();
              await handleSave(e);
              if (e.defaultPrevented) return;
              router.back();
            },
          }}
          abortButtonProps={{
            className: 'shrink',
            onPress: (e) => {
              e.persist();
              onLeave?.(e);
              if (e.defaultPrevented) return;
              router.back();
            },
          }}
        />
      ),
    });
  }, [handleSave, onLeave, router]);

  const handleBack = useCallback(() => {
    if (!isDirty) {
      router.back();
    } else {
      showUnsavedWarning();
    }
  }, [isDirty, router, showUnsavedWarning]);

  usePreventBackPress(isDirty, showUnsavedWarning);

  const contextValue = useMemo<FormNavigationStore>(
    () => ({
      isLastSection: isLast,
      progress,
      goNext,
      goBack: handleBack,
      showUnsavedWarning,
      save: handleSave,
    }),
    [goNext, handleBack, handleSave, isLast, progress, showUnsavedWarning]
  );

  const [store] = useState(createStore<FormNavigationStore>(() => contextValue));

  useEffect(() => {
    store.setState(contextValue);
  }, [contextValue, store]);

  return <FormNavigationContext.Provider value={store}>{children}</FormNavigationContext.Provider>;
}
