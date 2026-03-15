import { usePagination } from '@/hooks/forms/usePagination';
import { useRouter } from 'expo-router';
import { toast } from 'sonner-native';
import { PROFILE_SETUP_ROUTES } from '../lib/constants';
import { SetupProfileSteps } from '../lib/types';

/**
 * Custom hook to manage navigation and validation logic for the profile setup flow.
 */
export function useProfileSetupNavigator({
  onSubmit,
  validate,
}: {
  /**
   * Function to call when the user completes the last step and submits the form.
   */
  onSubmit: () => Promise<void>;
  /**
   * Function to validate the current step's fields. Should return true if all fields
   * are valid, false otherwise.
   *
   * @param currentStep The current step the user is on, which can be used to determine
   * which fields to validate.
   */
  validate: (currentStep: SetupProfileSteps) => Promise<boolean>;
}) {
  const router = useRouter();

  const { nextPage, hasNextPage, prevPage, hasPrevPage, progress, currentPageIndex, pathname } =
    usePagination(PROFILE_SETUP_ROUTES);

  const isIntro = currentPageIndex < 0;

  async function handleNext() {
    if (!hasNextPage) {
      onSubmit();
      return;
    }

    const currentStep = pathname.split('/').pop() as SetupProfileSteps | undefined;

    if (!currentStep) {
      toast.error('An unexpected error occurred. Please try again.');
      return;
    }

    const allValid = await validate(currentStep);
    if (allValid) {
      nextPage();
    } else {
      toast.error('There are some invalid fields. Please fix them before proceeding.');
    }
  }

  function handleBack() {
    if (hasPrevPage) prevPage();
    else router.back();
  }

  return {
    goToNextStep: handleNext,
    goToPrevStep: handleBack,
    progress,
    isIntro,
    hasNextPage,
    hasPrevPage,
  };
}
