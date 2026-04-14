import { ToastAction } from '@/components/toasts';
import { usePreventBackPress } from '@/hooks/usePreventBackPress';
import { ErrorSearchParams } from '@lactalink/types';
import { Href, useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { GestureResponderEvent } from 'react-native';
import { toast } from 'sonner-native';
import { useStandardScreeningFormQuery } from './queries';

type Params = {
  sectionID?: string;
  formState?: { isDirty?: boolean };
  onSave?: (e: GestureResponderEvent) => Promise<unknown>;
};

export function useFormNavigation({ sectionID, formState, onSave }: Params = {}) {
  const router = useRouter();
  const { data: form, ...formQuery } = useStandardScreeningFormQuery();

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

    if (!nextSection?.id) {
      router.push({
        pathname: '/error',
        params: { message: 'Next section not found' } as ErrorSearchParams,
      });
      return;
    }

    const href: Href = isLast
      ? '/donor-screening/summary'
      : `/donor-screening/form/${form.id}/section/${nextSection.id}`;

    router.push(href);
  }, [router, form, nextSection, isLast]);

  const showUnsavedWarning = useCallback(() => {
    toast.warning('You have unsaved changes. Please save before navigating away.', {
      action: (
        <ToastAction
          abortLabel="Okay"
          confirmLabel="Save and Leave"
          confirmButtonProps={{
            onPress: async (e) => {
              e.persist();
              await onSave?.(e);
              if (e.defaultPrevented) return;
              router.back();
            },
          }}
        />
      ),
    });
  }, [onSave, router]);

  const handleBack = useCallback(() => {
    if (!isDirty) {
      router.back();
    } else {
      showUnsavedWarning();
    }
  }, [isDirty, router, showUnsavedWarning]);

  usePreventBackPress(isDirty, showUnsavedWarning);

  return {
    goNext,
    goBack: handleBack,
    isLastSection: isLast,
    progress,
    ...formQuery,
  };
}
